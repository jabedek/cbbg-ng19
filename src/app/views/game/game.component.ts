import { Component } from '@angular/core';
import { ViewComponent } from '../../layout/components/view/view.component';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { GamesLobbyService } from '@services/games/games-lobby.service';
import { GamesService } from '@services/games/games.service';

@Component({
  selector: 'app-game',
  imports: [ViewComponent, RouterOutlet],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {
  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    public gamesLobby: GamesLobbyService,
    private games: GamesService,
  ) {}

  ngAfterViewInit(): void {
    console.log('assembly', this.route.snapshot.paramMap);
    // this.games.rerouteAfterGameStageChange();

    const gameId = this.route.snapshot.paramMap.get('gameId') || undefined;
    if (gameId) {
      this.gamesLobby.loadCreatedGameInAssembly(gameId);
    }
  }
}
