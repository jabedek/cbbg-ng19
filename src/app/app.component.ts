import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { GamesService } from '@services/games/games.service';
import { AppStore } from './store/store';
import { SeeDataComponent } from './components/simple/see-data/see-data.component';
import { GamesLobbyService } from '@services/games/games-lobby.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, SeeDataComponent],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'cbbg-client';
  store = inject(AppStore);

  constructor(
    public auth: AuthService,
    public games: GamesService,
    public gamesLobby: GamesLobbyService,
  ) {}
}
