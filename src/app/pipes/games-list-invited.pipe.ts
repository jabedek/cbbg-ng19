import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { GamesLobbyService } from '@services/games/games-lobby.service';
import { Game } from '@shared/types/game.type';

@Pipe({
  name: 'gamesListInvited',
})
export class GamesListInvitedPipe implements PipeTransform {
  auth = inject(AuthService);

  transform(value: Game, ...args: unknown[]): unknown {
    const currentUserId = this.auth.currentUserId();

    const seat = value.playersData.seats.find(
      (seat) => seat.takenInfo?.userId === currentUserId || seat.invitationInfo?.userId === currentUserId,
    );

    if (!seat) {
      return 'NO';
    }

    if (seat.takenInfo?.userId) {
      return 'TAKEN BY YOU';
    } else if (seat.invitationInfo?.userId) {
      return 'INVITE';
    }

    return 'NO';
  }
}
