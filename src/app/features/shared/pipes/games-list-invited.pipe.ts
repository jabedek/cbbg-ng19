import { inject, Pipe, PipeTransform } from '@angular/core';
import { Game } from '@shared/models/game.model';
import { AuthService } from '../../user/auth.service';

@Pipe({
  name: 'gamesListInvited',
})
export class GamesListInvitedPipe implements PipeTransform {
  auth = inject(AuthService);

  transform(value: Game, ...args: unknown[]): unknown {
    const currentUserId = this.auth.currentUserId;
    const isHost = value.playersHostsIds.at(-1) === currentUserId;
    // console.log(value);

    const seat = Object.values(value.playersSeats).find(
      (seat) => seat.takenInfo?.userId === currentUserId || seat.invitationInfo?.userId === currentUserId,
    );

    if (!seat) {
      return '--';
    }

    if (seat.takenInfo?.userId) {
      return 'YES' + `${isHost ? ' (HOST)' : ''}`;
    } else if (seat.invitationInfo?.userId) {
      return 'INVITED';
    }

    return '--';
  }
}
