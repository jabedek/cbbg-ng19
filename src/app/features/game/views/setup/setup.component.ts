import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamesService } from 'src/app/features/game/games.service';
import { AuthService } from 'src/app/features/user/auth.service';
import { NewGameForm2Component } from '../../components/new-game-form-2/new-game-form-2.component';
import { NewGameFormComponent } from '../../new-game-form/new-game-form.component';

@Component({
  selector: 'app-setup',
  imports: [NewGameFormComponent, NewGameForm2Component],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
})
export class SetupComponent implements AfterViewInit, OnDestroy {
  get currentUserId() {
    return this.auth.currentUserId;
  }

  get newGameConfig() {
    return this.games.newGameConfig;
  }

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    public games: GamesService,
  ) {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    // this.games.forceGameStageChangeUnsub();
  }
}
