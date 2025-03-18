import { Component } from '@angular/core';
import { ViewComponent } from '../../layout/components/view/view.component';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { GameCreateFormComponent } from '../../components/game/game-create-form/game-create-form.component';
import { PublicGamesListComponent } from '../../components/game/public-games-list/public-games-list.component';
import { GameJoinComponent } from '../../components/game/game-join/game-join.component';
@Component({
  selector: 'app-lobby',
  imports: [ViewComponent, MatTab, MatTabGroup, GameCreateFormComponent, GameJoinComponent],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent {}
