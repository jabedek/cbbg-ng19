import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
  output,
  Output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { GamesLobbyService } from '@services/games/games-lobby.service';
import { DefaultCachedGameData, DefaultConfigData } from '@shared/constants/games.const';
import { QUESTIONS } from '@shared/constants/questions-premises.const';
import { GameRound } from '@shared/types/game.type';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

export type QuestionPremiseChosen = { _id: string; text: string; amount: number };

@Component({
  selector: 'app-game-lobby-questions',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './game-lobby-questions.component.html',
  styleUrl: './game-lobby-questions.component.scss',
})
export class GameLobbyQuestionsComponent implements OnDestroy, OnInit {
  private destroy$ = new Subject<void>();
  protected chosenAmount = signal(0);
  protected questionsList = QUESTIONS;
  protected questionsForm?: FormGroup;
  questionsChange = output<GameRound[]>();

  get premises() {
    return this.questionsForm?.get('premises') as FormArray;
  }

  get premisesControls() {
    return (this.questionsForm?.controls.premises as FormArray).controls;
  }

  chosenRoundsLimit = computed(
    () =>
      this.gamesLobby.currentlyCreatedGame().data?.roundsData.roundsAmountLimit || DefaultConfigData.roundsAmountLimit,
  );

  get gameIsUpdatingRemotely() {
    return this.gamesLobby.gameIsUpdatingRemotely();
  }

  constructor(
    public fb: FormBuilder,
    public gamesLobby: GamesLobbyService,
  ) {
    effect(() => {
      const roundsData = this.gamesLobby.currentlyCreatedGame().data.roundsData;
      if (roundsData) {
        const { roundsEntries } = roundsData;
        const interim: Record<string, number> = {};
        roundsEntries.forEach(({ questionPremise }) => {
          if (!interim[questionPremise._id]) {
            interim[questionPremise._id] = 0;
          }
          interim[questionPremise._id]++;
        });
        this.premisesControls.forEach((control) => {
          const questionId = control.get('_id')?.value;
          Object.entries(interim).forEach((entry) => {
            if (entry[0] === questionId) {
              control.get('amount')?.setValue(entry[1], { emitEvent: false });
            }
          });
        });

        this.updateRoundsAmount();
      }
      this.questionsForm?.updateValueAndValidity({ emitEvent: false });
      this.questionsForm?.markAsUntouched({ emitEvent: false });
    });

    effect(() => {
      const inAssembly = this.gamesLobby.gameStage() === 'assembly';
      const userIsHost = this.gamesLobby.userIsHost();
      const gameIsUpdatingRemotely = this.gamesLobby.gameIsUpdatingRemotely();
      this.handleFormAccess(inAssembly, userIsHost, gameIsUpdatingRemotely);
    });
  }

  ngOnInit(): void {
    this.setupQuestionForm();
    this.listenToPremisesChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenToPremisesChange() {
    this.premises?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(1000))
      .subscribe((vals: QuestionPremiseChosen[]) => {
        if (this.chosenAmount() === this.chosenRoundsLimit()) {
          this.questionsForm?.disable({ emitEvent: false });
        } else if (this.questionsForm?.disabled) {
          this.questionsForm.enable({ emitEvent: false });
        }

        const questions: GameRound[] = [];

        vals.forEach(({ _id, text, amount }, index) => {
          if (amount !== 0) {
            for (let i = 0; i < amount; i++) {
              const foundQuestion = QUESTIONS.find((q) => q._id === _id);
              if (foundQuestion) {
                questions.push({ roundNumber: questions.length, questionPremise: foundQuestion, playersInputs: [] });
              }
            }
          }
        });

        this.questionsChange.emit([...questions]);
      });
  }

  private updateRoundsAmount() {
    const chosenPremises = this.premises.getRawValue().filter((val) => val.amount);
    this.chosenAmount.set(chosenPremises.reduce((acc, premise) => acc + Number(premise.amount), 0));
  }

  private handleFormAccess(inAssembly: boolean, userIsHost: boolean, gameIsUpdatingRemotely: boolean) {
    if ((inAssembly && userIsHost) || !inAssembly) {
      if (gameIsUpdatingRemotely) {
        this.questionsForm?.disable({ emitEvent: false });
      } else {
        this.questionsForm?.enable({ emitEvent: false });
      }
    } else {
      this.questionsForm?.disable({ emitEvent: false });
    }
  }

  private setupQuestionForm() {
    this.questionsForm = this.fb.group({
      premises: this.fb.array(
        this.questionsList.map((question) =>
          this.fb.group({
            _id: question._id,
            text: question.text,
            amount: new FormControl(0, [Validators.max(this.chosenRoundsLimit())]),
          }),
        ),
      ),
      // customPremise: this.fb.group({ text: '', amount: 0 }),
    });
  }

  changeAmount(controlIndex: number, mode: 'remove' | 'add') {
    const amountControl = this.premises.get(`${controlIndex}.amount`);

    if (!amountControl) {
      return;
    }

    const amount = amountControl?.value;

    if (mode === 'remove' && amount > 0) {
      amountControl.setValue(amount - 1);
    }

    if (mode === 'add' && this.chosenAmount() < this.chosenRoundsLimit()) {
      amountControl.setValue(amount + 1);
    }

    this.updateRoundsAmount();
  }
}
