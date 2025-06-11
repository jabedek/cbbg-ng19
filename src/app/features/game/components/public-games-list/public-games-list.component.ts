import { Component, computed, model, OnInit } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IntervalsMS } from '@shared/constants/intervals.const';
import { Game } from '@shared/models/game.model';
import { GamesService } from 'src/app/features/game/games.service';
import { GamesListInvitedPipe } from '@shared/pipes/games-list-invited.pipe';
import { GamesListSeatsPipe } from '@shared/pipes/games-list-seats.pipe';

@Component({
  selector: 'app-public-games-list',
  imports: [GamesListInvitedPipe, GamesListSeatsPipe, ReactiveFormsModule, CommonModule],
  templateUrl: './public-games-list.component.html',
  styleUrl: './public-games-list.component.scss',
})
export class PublicGamesListComponent implements OnInit {
  IntervalsMSpublics = IntervalsMS.publics;

  publicGamesInterval?: NodeJS.Timeout;

  publicGames = rxResource({
    loader: () => this.games.getGamesInSetup(),
    defaultValue: [],
  });

  status = computed(() => this.publicGames.status());

  selectedGame = model<Game | undefined>(undefined);

  constructor(public games: GamesService) {}

  ngOnInit(): void {
    this.getGamesInterval();
  }

  private getGamesInterval() {
    this.publicGamesInterval = setInterval(() => this.publicGames.reload(), 1000 * this.IntervalsMSpublics);
  }
}
