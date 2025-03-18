import { Component, computed, model, OnInit, resource } from '@angular/core';
import { BasicButtonComponent } from '../../simple/basic-button/basic-button.component';
import { GamesLobbyService } from '@services/games/games-lobby.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule, JsonPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Game } from '@shared/types/game.type';
import { GamesListInvitedPipe } from 'src/app/pipes/games-list-invited.pipe';
import { GamesListSeatsPipe } from 'src/app/pipes/games-list-seats.pipe';
import { PUBLICS_INTERVAL_SECONDS } from '@shared/constants/games.const';

@Component({
  selector: 'app-public-games-list',
  imports: [GamesListInvitedPipe, GamesListSeatsPipe, ReactiveFormsModule, CommonModule],
  templateUrl: './public-games-list.component.html',
  styleUrl: './public-games-list.component.scss',
})
export class PublicGamesListComponent implements OnInit {
  PUBLICS_INTERVAL_SECONDS = PUBLICS_INTERVAL_SECONDS;

  publicGamesInterval?: NodeJS.Timeout;

  publicGames = rxResource({
    loader: () => this.gamesLobby.getGamesInAssembly(),
    defaultValue: [],
  });

  status = computed(() => this.publicGames.status());

  selectedGame = model<Game | undefined>(undefined);

  constructor(private gamesLobby: GamesLobbyService) {}

  ngOnInit(): void {
    this.getGamesInterval();
  }

  private getGamesInterval() {
    this.publicGamesInterval = setInterval(() => this.publicGames.reload(), 1000 * PUBLICS_INTERVAL_SECONDS);
  }
}
