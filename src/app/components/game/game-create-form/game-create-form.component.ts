import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { GamesLobbyService } from '@services/games/games-lobby.service';
import {
  DEFAULT_SEATS,
  DefaultConfigData,
  RoundsLimits,
  RoundLengthsOptions,
  UPDATE_INTERVAL_SECONDS,
} from '@shared/constants/games.const';
import { allowedValuesValidator } from '@shared/validators/allowedValues.validator';
import { AppFormGroup, AppFormControl } from 'form-global';
import { debounceTime, filter, Subject, takeUntil } from 'rxjs';
import { InputTextComponent } from '../../simple/input-text/input-text.component';
import { InputRadioComponent } from '../../simple/input-radio/input-radio.component';
import { BasicButtonComponent } from '../../simple/basic-button/basic-button.component';
import { OperationDisplay } from '@shared/types/common.type';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Game, GameLobbyConfig, GameRound, PlayingSeat } from '@shared/types/game.type';
import { GameLobbyConfigComponent } from '../game-lobby-config/game-lobby-config.component';
import { GameLobbyQuestionsComponent } from '../game-lobby-questions/game-lobby-questions.component';
import { GameLobbySeatsComponents } from '../game-lobby-seats/game-lobby-seats.component';

@Component({
  selector: 'app-game-create-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    GameLobbyQuestionsComponent,
    GameLobbySeatsComponents,
    BasicButtonComponent,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    GameLobbyConfigComponent,
  ],
  templateUrl: './game-create-form.component.html',
  styleUrl: './game-create-form.component.scss',
})
export class GameCreateFormComponent implements OnInit, OnDestroy {
  UPDATE_INTERVAL_SECONDS = UPDATE_INTERVAL_SECONDS;

  protected updateCountdown = signal(-1);

  private destroy$ = new Subject<void>();
  private updateInterval?: NodeJS.Timeout;

  protected initCountdoown = signal(-1);

  get operationDisplay() {
    return this.gamesLobby.operationDisplay();
  }

  get currentUserId() {
    return this.auth.appAccount()?._id;
  }

  get currentlyCreatedGame() {
    return this.gamesLobby.currentlyCreatedGame();
  }

  get userIsHost() {
    return this.gamesLobby.userIsHost;
  }

  get gameHasStarted() {
    return this.gamesLobby.gameHasStarted;
  }

  constructor(
    protected gamesLobby: GamesLobbyService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.updateInterval);
  }

  updateLocalGameConfig(data: GameLobbyConfig) {
    this.gamesLobby.updateLocallyLobbyGame({ key: 'config', data });
  }

  updateLocalGameRounds(data: GameRound[]) {
    this.gamesLobby.updateLocallyLobbyGame({ key: 'rounds', data });
  }

  updateLocalGameSeats(data: PlayingSeat[]) {
    this.gamesLobby.updateLocallyLobbyGame({ key: 'seats', data });
  }

  /**
   * Called from assembly
   */
  start() {
    const gameId = this.gamesLobby.currentlyCreatedGame().data._id;
    if (gameId) {
      this.initCountdoown.set(10);
      const interval = setInterval(() => this.initCountdoown.update((val) => val - 1), 1000);
      setTimeout(() => clearInterval(interval), 1000 * 10);
    }
  }
}
