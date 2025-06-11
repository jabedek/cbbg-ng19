import { AfterViewInit, Component, computed, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicsFormName, BasicsComponent } from './partials/basics/basics.component';
import { SeatsComponent } from './partials/seats/seats.component';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';
import { QuestionsComponent, RoundsFormName } from './partials/questions/questions.component';
import { IntervalsMS } from '@shared/constants/intervals.const';
import { roundsQuestionsCheck, seatsCheck } from '@shared/validators/validators';
import { ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { buildRoundsFormPartial, QuestionPremiseId } from '@shared/models/rounds-questions.model';
import { GamesService } from 'src/app/features/game/games.service';
import { merge } from 'lodash';
import { BasicButtonComponent } from '@shared/components/basic-button/basic-button.component';
import { OperationDisplayComponent } from '@shared/components/operation-display/operation-display.component';
import { Game, GameBasics } from '@shared/models/game.model';
import { AuthService } from '../../user/auth.service';

const buildNewGameForm = (formBuilder: FormBuilder, game: Game) => {
  console.log('###', game.roundsEntries);

  const { roundsEntries, playersSeats, ...basics } = game;
  const { gameName, gamePassword, roundsAmountLimit, roundLengthMS, ...otherBasics } = basics;

  // const mappedRounds = buildRoundsFormPartial(roundsEntries);

  const newForm = formBuilder.group({
    [BasicsFormName]: formBuilder.group({ gameName, gamePassword, roundsAmountLimit, roundLengthMS }),
    [RoundsFormName]: formBuilder.array([]),
  });

  return newForm;
};

@Component({
  selector: 'app-new-game-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BasicsComponent,
    QuestionsComponent,
    // SeatsComponent,
    OperationDisplayComponent,
    BasicButtonComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './new-game-form.component.html',
  styleUrl: './new-game-form.component.scss',
})
export class NewGameFormComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  protected initCountdown = signal(-1);
  private updateInterval?: NodeJS.Timeout;
  protected updateCountdown = signal(-1);
  IntervalsMSupdate = IntervalsMS.update;

  // protected formShouldUpdateLocally$ = new Subject<GamePartialUpdate>();

  reAttachFormListeners$ = merge(this.destroy$, this.games.formUpdateTick$);

  get appAccount() {
    return this.auth.appAccount;
  }

  form = buildNewGameForm(this.fb, this.games.newGameConfig);

  get roundsValid() {
    return roundsQuestionsCheck(this.roundsForm.getRawValue());
  }

  get seatsValid() {
    return true; // seatsCheck(this.games.newGameConfig.playersSeats);
  }

  get operationDisplay() {
    return this.games.operationDisplay();
  }

  protected chosenAmount = signal(0);

  chosenRoundsLimit = computed(() => this.games.newGameConfig?.roundsAmountLimit);

  get basicsForm() {
    return this.form.get(BasicsFormName) as FormGroup;
  }

  get roundsForm() {
    return this.form.get(RoundsFormName) as FormGroup;
  }

  /** Game config is inited */
  formEditable = computed(() => {
    // 1. user must be host
    const userIsHost = this.games.userIsHost;

    // 2. game can't be started
    const gameHasStartedNot = !this.games.gameHasStarted;
    // console.log(userIsHost, gameHasStartedNot);

    return Boolean(userIsHost && gameHasStartedNot);
  });

  // updateForm = effect(() => {
  //   const game = this.games.newGameConfig;

  //   const gameUpdating = this.games.gameRemoteUpdating();

  //   if (!gameUpdating) {
  //     console.log('updated', game);
  //     this.form = buildNewGameForm(this.fb, game);
  //     this.form.updateValueAndValidity();
  //   }
  // });

  constructor(
    public games: GamesService,
    private auth: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {
    effect(() => {
      const gameRemoteUpdating = this.games.gameRemoteUpdating();
      const formEditable = this.formEditable();
      this.handleFormAccess(gameRemoteUpdating, formEditable);
    });

    this.games.formUpdateTick$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const game = this.games.newGameConfig;

      this.reAttachFormListeners$.next();
      console.log('updated', game);
      this.form = buildNewGameForm(this.fb, game);
      this.listenToChanges();
      this.form.updateValueAndValidity();
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.listenToChanges();
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');

    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.updateInterval);
  }

  private handleFormAccess(gameRemoteUpdating: boolean, formEditable: boolean) {
    if (formEditable) {
      if (gameRemoteUpdating) {
        this.form?.disable({ emitEvent: false });
      } else {
        this.form?.enable({ emitEvent: false });
      }
    } else {
      this.form?.disable({ emitEvent: false });
    }
  }

  private listenToChanges() {
    // // Start listener
    // this.formShouldUpdateLocally$
    //   .pipe(
    //     tap((v) => console.log(v)),
    //     takeUntil(this.reAttachFormListeners$),
    //   )
    //   .subscribe((updatePart: GamePartialUpdate) => this.games.localUpdate(updatePart));
    // /** Basics */
    // this.basicsForm?.valueChanges
    //   .pipe(
    //     tap((v) => console.log(v)),
    //     takeUntil(this.reAttachFormListeners$),
    //     debounceTime(2000),
    //   )
    //   .subscribe((value: GameBasics) => this.formShouldUpdateLocally$.next({ key: BasicsFormName, value }));
    // /** Rounds */
    // this.roundsForm?.valueChanges
    //   .pipe(takeUntil(this.reAttachFormListeners$), debounceTime(2000))
    //   .subscribe((value: string[]) => {
    //     const newVal: Record<string, QuestionPremiseId | null> = {};
    //     value.forEach((val, index) => (newVal[index] = val ? (val as QuestionPremiseId) : null));
    //     return this.formShouldUpdateLocally$.next({
    //       key: RoundsFormName,
    //       value: newVal,
    //     });
    //   });
    /** Seats */
    // this.seatsForm?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500));
    // .subscribe((value: GameSeats) => this.formShouldUpdateLocally$.next({ key: SeatsFormName, value }));
  }
}
