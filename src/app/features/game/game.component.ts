import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { GamesService } from 'src/app/features/game/games.service';
import { AuthService } from '../user/auth.service';

@Component({
  selector: 'app-game',
  imports: [RouterOutlet],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {
  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    public games: GamesService,
  ) {}

  ngAfterViewInit(): void {
    console.log('game component', this.route.snapshot.paramMap);
    console.log('game component', this.auth);
    // this.games.rerouteAfterGameStageChange();

    const gameId = this.route.snapshot.paramMap.get('gameId') || undefined;
    if (gameId) {
      // this.gameSession.loadGameInCreation(gameId);
    }
  }
}
