import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoundLengthsOptions, RoundsLimits, DefaultConfigData } from '@shared/constants/games.const';
import { AppFormGroup, AppFormControl } from 'form-global';
import { debounceTime, Subject, filter, takeUntil, distinctUntilChanged } from 'rxjs';
import { InputTextComponent } from '../../simple/input-text/input-text.component';
import { InputRadioComponent } from '../../simple/input-radio/input-radio.component';
import { CommonModule } from '@angular/common';
import { GamesLobbyService } from '@services/games/games-lobby.service';
import { GameLobbyConfig, GameRound } from '@shared/types/game.type';

@Component({
  selector: 'app-game-lobby-config',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextComponent, InputRadioComponent],
  templateUrl: './game-lobby-config.component.html',
  styles: ``,
})
export class GameLobbyConfigComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  protected RoundLengthsOptions = RoundLengthsOptions;
  protected configForm = new AppFormGroup({
    name: new AppFormControl(DefaultConfigData.name, [Validators.required, Validators.maxLength(16)]),
    password: new AppFormControl(DefaultConfigData.password),
    roundsAmountLimit: new AppFormControl(DefaultConfigData.roundsAmountLimit, [
      Validators.min(10),
      Validators.max(15),
    ]),
    roundLengthMS: new AppFormControl(DefaultConfigData.roundLengthMS),
  });

  configChange = output<GameLobbyConfig>();

  get gameIsUpdatingRemotely() {
    return this.gamesLobby.gameIsUpdatingRemotely();
  }

  constructor(protected gamesLobby: GamesLobbyService) {
    effect(() => {
      const inAssembly = this.gamesLobby.gameStage() === 'assembly';
      const userIsHost = this.gamesLobby.userIsHost();
      const gameIsUpdatingRemotely = this.gamesLobby.gameIsUpdatingRemotely();
      const game = this.gamesLobby.currentlyCreatedGame().data;

      if (game) {
        const { name, password, roundsData } = game;
        this.configForm.patchValue(
          {
            name,
            password,
            roundsAmountLimit: roundsData.roundsAmountLimit,
            roundLengthMS: roundsData.roundLengthMS,
          },
          { emitEvent: false },
        );
      }

      this.configForm.updateValueAndValidity({ emitEvent: false });
      this.configForm.markAsUntouched({ emitEvent: false });

      this.handleFormAccess(inAssembly, userIsHost, gameIsUpdatingRemotely);
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.listenToConfigChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenToConfigChange() {
    this.configForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev: GameLobbyConfig, curr: GameLobbyConfig) => {
          return (
            prev.name === curr.name &&
            prev.password === curr.password &&
            prev.roundLengthMS === curr.roundLengthMS &&
            prev.roundsAmountLimit === curr.roundsAmountLimit
          );
        }),
        debounceTime(500),
        // filter((val) => this.configForm.valid),
      )
      .subscribe((val: GameLobbyConfig) => this.configChange.emit(val));
  }

  private handleFormAccess(inAssembly: boolean, userIsHost: boolean, gameIsUpdatingRemotely: boolean) {
    if ((inAssembly && userIsHost) || !inAssembly) {
      if (gameIsUpdatingRemotely) {
        this.configForm.disable({ emitEvent: false });
      } else {
        this.configForm.enable({ emitEvent: false });
      }
    } else {
      this.configForm.disable({ emitEvent: false });
    }
  }
}
