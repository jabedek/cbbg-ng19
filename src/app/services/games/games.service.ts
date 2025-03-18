import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { Game, GameLobbyConfig, GameRound, PlayingSeat } from '@shared/types/game.type';
import { AppCrypto } from '@shared/utils/crypto.util';
import { consoleError, tryCatch } from '@shared/utils/dev.util';
import { from, Observable, map, catchError, of, switchMap, EMPTY } from 'rxjs';
import { DbReadDetails, FirebaseDataService } from 'src/app/firebase/firebase-data.service';
import { GameUpdatePart } from './games-lobby.service';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  constructor(
    private router: Router,
    private firebaseData: FirebaseDataService,
    private auth: AuthService,
  ) {}

  getGame(gameId: string): Observable<Game | undefined> {
    return from(this.firebaseData.readOneBy<Game>('games', { key: '_id', value: gameId })).pipe(
      map((game) => {
        // if (game && game.password && game.password.includes('㋛')) {
        //   game.password = AppCrypto.decrypt(game.password);
        // }
        return game;
      }),
    );
  }

  getGames(readDetails: DbReadDetails): Observable<Game[]> {
    return from(this.firebaseData.readManyBy<Game>('games', readDetails)).pipe(
      catchError((error) => {
        consoleError(error, '[Games#getGames]');
        return of([undefined, error]);
      }),
    );
  }

  createGame(gameData: Game): Observable<Game | undefined> {
    const gameId = gameData._id;
    if (!gameId) {
      return EMPTY;
    }

    return from(tryCatch<void>(this.firebaseData.insertData('games', gameId, gameData))).pipe(
      catchError((error) => of([undefined, error])),
      switchMap(([_, err]) => {
        if (err) {
          consoleError(err, '[Games#createGame]');
          return EMPTY;
        } else {
          return this.getGame(gameId);
        }
      }),
    );
  }

  updateGame(gameData: Game): Observable<Game | undefined> {
    const gameId = gameData._id;
    if (!gameId) {
      return EMPTY;
    }

    return from(tryCatch<void>(this.firebaseData.updateData('games', gameId, gameData))).pipe(
      catchError((error) => of([undefined, error])),
      switchMap(([_, err]) => {
        if (err) {
          consoleError(err, '[Games#updateRemoteGame]');
          return EMPTY;
        } else {
          return this.getGame(gameId);
        }
      }),
    );
  }

  // updateRemoteGamePart(gameId: string, part: GameUpdatePart): Observable<Game | undefined> {
  //   return from(tryCatch<void>(this.firebaseData.updateData('games', gameId, { [part.key]: part.data }))).pipe(
  //     catchError((error) => of([undefined, error])),
  //     switchMap(([_, err]) => {
  //       if (err) {
  //         consoleError(err, '[Games#updateRemoteCreatedGamePart]');
  //         return EMPTY;
  //       } else {
  //         return this.getGame(gameId);
  //       }
  //     }),
  //   );
  // }

  deleteGame(gameId: string): Observable<void> {
    return {} as any;
  }
}
