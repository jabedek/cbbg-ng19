import { Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { GameJoinComponent } from '../../features/game/components/game-join/game-join.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GamesService } from 'src/app/features/game/games.service';
import { Games2Service } from 'src/app/features/game/games-2.service';
import { PublicGamesListComponent } from '../../features/game/components/public-games-list/public-games-list.component';
import { IntervalsMS } from '@shared/constants/intervals.const';
import { Game } from '@shared/models/game.model';
import { Subject } from 'rxjs';
import { BasicButtonComponent } from '@shared/components/basic-button/basic-button.component';
import { OperationDisplayComponent } from '@shared/components/operation-display/operation-display.component';
@Component({
  selector: 'app-lobby',
  imports: [GameJoinComponent, BasicButtonComponent, OperationDisplayComponent, PublicGamesListComponent],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements OnInit, OnDestroy {
  protected destroy$ = new Subject<void>();
  protected selectedGame = model<Game | undefined>(undefined);

  protected updateInterval?: NodeJS.Timeout;
  protected IntervalsMSpublics = IntervalsMS.publics;
  protected initCountdoown = signal(-1);
  protected updateCountdown = signal(-1);

  title = 'Lobby';
  router = inject(Router);

  get operationDisplay() {
    return this.games.operationDisplay();
  }

  get createContext() {
    return this.games2.createContext;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    public games: GamesService,
    public games2: Games2Service,
  ) {
    // console.log('Lobby');
  }
  ngOnInit() {
    // console.log(this.activatedRoute);

    this.activatedRoute.data.subscribe(({ game }) => {
      // console.log(game);

      if (game?.gameStage === 'setup') {
        this.router.navigateByUrl(`/${game._id}/setup`);
      }

      // do something with your resolved data ...
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.updateInterval);
  }

  join() {
    const gameId = this.selectedGame()?._id;
    if (this.createContext.currentUserId && gameId) {
      // this.gameSession.joinGame(gameId, this.currentUserId);
    }
  }

  moveNewGameToInit() {
    this.games2.moveNewGameToInit();
  }
}
