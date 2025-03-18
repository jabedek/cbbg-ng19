import { Pipe, PipeTransform } from '@angular/core';
import { Game } from '@shared/types/game.type';

@Pipe({
  name: 'gamesListSeats',
})
export class GamesListSeatsPipe implements PipeTransform {
  transform(value: Game, ...args: unknown[]): unknown {
    return value.playersData.seats.filter((seat) => (seat.status = 'opened-empty')).length;
  }
}
