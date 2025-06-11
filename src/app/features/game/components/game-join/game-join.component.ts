import { Component, model, OnDestroy, OnInit, signal } from '@angular/core';
import { PublicGamesListComponent } from '../public-games-list/public-games-list.component';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IntervalsMS } from '@shared/constants/intervals.const';
import { Game } from '@shared/models/game.model';
import { GamesService } from 'src/app/features/game/games.service';
import { BasicButtonComponent } from '@shared/components/basic-button/basic-button.component';
import { OperationDisplayComponent } from '@shared/components/operation-display/operation-display.component';
import { AuthService } from 'src/app/features/user/auth.service';

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
    OperationDisplayComponent,
  ],
  templateUrl: './game-join.component.html',
  styles: ``,
})
export class GameJoinComponent implements OnInit, OnDestroy {
  IntervalsMSpublics = IntervalsMS.publics;

  protected updateCountdown = signal(-1);

  protected selectedGame = model<Game | undefined>(undefined);

  private destroy$ = new Subject<void>();
  private updateInterval?: NodeJS.Timeout;

  protected initCountdoown = signal(-1);

  get operationDisplay() {
    return this.games.operationDisplay();
  }

  get currentUserId() {
    return this.auth.currentUserId;
  }

  get newGameConfig() {
    return this.games.newGameConfig;
  }

  get userIsHost() {
    return this.games.userIsHost;
  }

  get gameHasStarted() {
    return this.games.gameHasStarted;
  }

  constructor(
    public games: GamesService,
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
      // this.gameSession.joinGame(gameId, this.currentUserId);
    }
  }
}
