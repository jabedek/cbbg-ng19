import { Component, model, OnDestroy, OnInit, signal } from '@angular/core';
import { PublicGamesListComponent } from '../public-games-list/public-games-list.component';
import { AuthService } from '@services/auth.service';
import { GamesLobbyService } from '@services/games/games-lobby.service';
import { PUBLICS_INTERVAL_SECONDS, UPDATE_INTERVAL_SECONDS } from '@shared/constants/games.const';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BasicButtonComponent } from '../../simple/basic-button/basic-button.component';
import { Game } from '@shared/types/game.type';

@Component({
  selector: 'app-game-join',
  imports: [
    PublicGamesListComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    BasicButtonComponent,
  ],
  templateUrl: './game-join.component.html',
  styles: ``,
})
export class GameJoinComponent implements OnInit, OnDestroy {
  PUBLICS_INTERVAL_SECONDS = PUBLICS_INTERVAL_SECONDS;

  protected updateCountdown = signal(-1);

  protected selectedGame = model<Game | undefined>(undefined);

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

  join() {
    const gameId = this.selectedGame()?._id;
    if (this.currentUserId && gameId) {
      this.gamesLobby.joinGame(gameId, this.currentUserId);
    }
  }
}
