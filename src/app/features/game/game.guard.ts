import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, RouterStateSnapshot } from '@angular/router';
import { GamesService } from 'src/app/features/game/games.service';
import { AuthService } from '../user/auth.service';

export const gameGuard: CanActivateChildFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService: AuthService = inject(AuthService);
  const games = inject(GamesService);

  const currentUserId = authService.currentUserId;

  if (!currentUserId) {
    return false;
  }

  const game = games.newGameConfig;

  const isHost = game.playerCreatorId === currentUserId || game.playersHostsIds.includes(currentUserId);
  const isGuest = Object.values(game.playersSeats).some(
    (seat) => seat.invitationInfo?.userId === currentUserId || seat.takenInfo?.userId === currentUserId,
  );

  const userIsInvoledInGame = isHost || isGuest;

  return userIsInvoledInGame;
};
