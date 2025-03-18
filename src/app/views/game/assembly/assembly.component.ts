import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { GameCreateFormComponent } from '../../../components/game/game-create-form/game-create-form.component';
import { ViewComponent } from '../../../layout/components/view/view.component';
import { GamesLobbyService } from '@services/games/games-lobby.service';
import { AuthService } from '@services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { GamesService } from '@services/games/games.service';

@Component({
  selector: 'app-assembly',
  imports: [GameCreateFormComponent],
  templateUrl: './assembly.component.html',
  styleUrl: './assembly.component.scss',
})
export class AssemblyComponent implements AfterViewInit, OnDestroy {
  get currentUserId() {
    return this.auth.appAccount()?._id;
  }

  get currentlyCreatedGame() {
    return this.gamesLobby.currentlyCreatedGame();
  }

  get gameData() {
    return this.gamesLobby.currentlyCreatedGame();
  }

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    public gamesLobby: GamesLobbyService,
    private games: GamesService,
  ) {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    // this.games.forceGameStageChangeUnsub();
  }
}
