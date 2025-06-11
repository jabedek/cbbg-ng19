import { Pipe, PipeTransform } from '@angular/core';
import { Game } from '@shared/models/game.model';

@Pipe({
  name: 'gamesListSeats',
})
export class GamesListSeatsPipe implements PipeTransform {
  transform(value: Game, ...args: unknown[]): unknown {
    return Object.values(value.playersSeats).filter((seat) => seat.status === 'opened-empty').length;
  }
}
