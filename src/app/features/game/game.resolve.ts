import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { GamesService } from 'src/app/features/game/games.service';

import { Game } from '@shared/models/game.model';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../user/auth.service';
import { Games2Service } from './games-2.service';

@Injectable({ providedIn: 'root' })
export class GameResolver implements Resolve<Game | undefined> {
  router = inject(Router);
  auth = inject(AuthService);

  constructor(public games: Games2Service) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<Game | undefined> | Promise<Game | undefined> | Game | undefined {
    const gameId = route.paramMap.get('gameId');

    if (!gameId) {
      this.router.navigateByUrl('lobby');
      return undefined;
    }
    return this.games.resolveNewGameForSetup(gameId).pipe(
      tap((val) => {
        if (!val) {
          this.router.navigateByUrl('lobby');
          return undefined;
        }
      }),
    );
  }
}
