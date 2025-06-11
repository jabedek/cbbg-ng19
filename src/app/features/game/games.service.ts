import { effect, inject, Injectable, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, first, from, map, mergeMap, Observable, of, Subject, switchMap, take, tap } from 'rxjs';
import { OperationDisplay } from '@shared/models/common.model';
import { DefaultSeats, GameInvitation, PlayerSeat, wasPlayerAlreadyInvitedOrSeated } from '@shared/models/seats.model';
import { DefaultGameValues, Game } from '@shared/models/game.model';
import { generateDocumentId } from 'frotsi';
import { consoleError, tryCatch } from '@shared/utils/dev.util';
import { AppAccount } from '@shared/models/auth.model';
import { UsersFriendInvitesService } from 'src/app/features/user/users-friend-invites.service';
import { SETTINGS } from 'src/app/app.settings';
import { MOCK_games } from '@shared/utils/mockups';
import { FirebaseDataService, DbReadDetails } from '../firebase/firebase-data.service';
import { AuthService } from '../user/auth.service';

const DISCONNECT = false;

@Injectable({
  providedIn: 'root',
})
export class GamesService implements OnInit, OnDestroy {
  settings = inject(SETTINGS);
  private updateInterval?: NodeJS.Timeout;

  newGameConfig: Game = DefaultGameValues;

  formUpdateTick$ = new Subject<void>();
  gameRemoteUpdating = signal(false);
  gameRemoteUpdatingEffect = effect(() => {
    if (this.gameRemoteUpdating()) {
      this.operationDisplay.set({ status: 'pending', message: undefined });
    } else {
      this.operationDisplay.set({ status: 'none', message: undefined });
    }
  });

  get gameStage() {
    return this.newGameConfig.gameStage;
  }

  get gameHasStarted() {
    const gameStage = this.gameStage;
    if (!gameStage) {
      return undefined;
    }

    return !['init', 'setup'].includes(gameStage);
  }

  get hostPlayerId() {
    if (!this.newGameConfig) {
      return undefined;
    }
    const hostsIds = this.newGameConfig?.playersHostsIds || [];

    return hostsIds[hostsIds.length - 1];
  }

  get userIsHost() {
    return this.auth.currentUserId === this.hostPlayerId;
  }

  operationDisplay = signal<OperationDisplay>({ status: 'none' });

  constructor(
    private router: Router,
    private auth: AuthService,
    // private gamesData: GamesDataService,
    private firebaseData: FirebaseDataService,
    private usersInvites: UsersFriendInvitesService,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    clearInterval(this.updateInterval);
  }

  getGame(gameId: string): Observable<Game | undefined> {
    return from(this.firebaseData.readOneBy<Game>('games', { key: '_id', value: gameId })).pipe(
      catchError((error) => {
        consoleError(error, '[Games#getGame]');
        return of(error);
      }),
      map((game) => game),
    );
  }

  getGames(readDetails: DbReadDetails): Observable<Game[]> {
    if (DISCONNECT) {
      return of([]);
    }

    if (this.settings.USE_REAL_GAMES) {
      return from(this.firebaseData.readManyBy<Game>('games', readDetails)).pipe(
        catchError((error) => {
          consoleError(error, '[Games#getGames]');
          return of(error);
        }),
      );
    } else {
      return of(MOCK_games);
    }
  }

  getGamesInSetup(): Observable<Game[]> {
    if (DISCONNECT) {
      return of([]);
    }

    if (this.settings.USE_REAL_GAMES) {
      return this.getGames({
        key: 'gameStage',
        values: ['setup'],
      }).pipe(
        map((games = []) => {
          return games
            .filter((game: Game) => {
              return Object.values(game.playersSeats).some((seat: PlayerSeat) => {
                const currentUserId = this.auth.currentUserId;
                if (!currentUserId) {
                  return false;
                }
                return seat.status === 'opened-empty' || seat.invitationInfo?.userId === currentUserId;
              });
            })
            .map((game) => game);
        }),
      );
    } else {
      return of(MOCK_games);
    }
  }

  createGame(gameData: Game): Observable<Game | undefined> {
    if (DISCONNECT) {
      return of(undefined);
    }
    const gameId = gameData._id;
    if (!gameId) {
      return EMPTY;
    }

    return from(tryCatch(this.firebaseData.insertData('games', gameId, gameData))).pipe(
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
    if (DISCONNECT) {
      return of(undefined);
    }

    const gameId = gameData._id;
    if (!gameId) {
      return EMPTY;
    }

    return from(tryCatch(this.firebaseData.updateData('games', gameId, gameData))).pipe(
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

  updateGameSeats(game: Game): Observable<Game | undefined> {
    console.log(game.playersSeats);

    const gameId = game._id;

    if (DISCONNECT) {
      return of(undefined);
    }

    if (!gameId) {
      return EMPTY;
    }

    return from(tryCatch(this.firebaseData.updateData('games', gameId, game))).pipe(
      catchError((error) => of([undefined, error])),
      switchMap(([_, err]) => {
        if (err) {
          consoleError(err, '[Games#updateGameSeats]');
          return EMPTY;
        } else {
          return this.getGame(gameId);
        }
      }),
    );
  }

  deleteGame(gameId: string): Observable<void> {
    if (DISCONNECT) {
      return of(undefined);
    }
    if (!gameId) {
      return EMPTY;
    }

    return from(tryCatch(this.firebaseData.deleteData('games', gameId))).pipe(
      catchError((error) => of([undefined, error])),
      switchMap(([_, err]) => {
        if (err) {
          consoleError(err, '[Games#deleteGame]');
        } else {
        }
        return EMPTY;
      }),
    );
  }

  initNewGame() {
    const account = this.auth.appAccount;
    if (!account) {
      consoleError('No account');
      return undefined;
    }

    const newGameId = generateDocumentId('game');
    const newGame: Game = {
      ...DefaultGameValues,
      _id: newGameId,
      playersHostsIds: [account._id],
      playerCreatorId: account._id,
      _createdAt: Date.now(),
      gameStage: 'init',
      playersSeats: {
        ...DefaultGameValues.playersSeats,
        '0': {
          ...DefaultGameValues.playersSeats['0'],
          status: 'taken',
          takenInfo: {
            userId: account._id,
            userName: account.displayName,
          },
        },
      },
    };

    this.newGameConfig._id = newGameId;
    this.newGameConfig = newGame;
    this.gameRemoteUpdating.set(true);

    console.log(newGame);
    console.log(DefaultSeats);

    this.createGame(newGame)
      .pipe(take(1))
      .subscribe((game) => {
        if (game) {
          this.formUpdateTick$.next();
          this.newGameConfig = game;

          setTimeout(() => {
            this.router.navigate([`${newGameId}/setup`]);
            this.gameRemoteUpdating.set(false);
          }, 500);
        }
      });
  }

  initNewGameNext() {
    this.remoteUpdate({ ...this.newGameConfig, gameStage: 'setup' });
  }

  /** Used in forms when user provides data */
  // localUpdate(val: GamePartialUpdate) {
  //   const { key, value } = val;

  //   console.log('#localUpdate', val);

  //   const currentRoundsLimit = this.newGameConfig.roundsAmountLimit;
  //   const newRoundsLimit = (value.roundsAmountLimit as number) ?? currentRoundsLimit;
  //   const roundsDiff = currentRoundsLimit - newRoundsLimit;

  //   if (key === 'Basics') {
  //     this.newGameConfig = { ...this.newGameConfig, ...value };

  //     // Rounds number went up
  //     if (roundsDiff < 0) {
  //       this.newGameConfig.roundsEntries[currentRoundsLimit] = {
  //         roundNumber: currentRoundsLimit,
  //         phase: 'idle',
  //         playersInputs: [],
  //         questionPremiseId: null,
  //       };
  //     } else if (roundsDiff > 0) {
  //       // Rounds number went down
  //       delete this.newGameConfig.roundsEntries[newRoundsLimit];
  //     }

  //     console.log('new rounds', roundsDiff, this.newGameConfig.roundsEntries);
  //   }

  //   if (key === 'Rounds') {
  //     Object.entries(value).forEach((entry) => {
  //       console.log(entry);

  //       // this.newGameConfig.roundsEntries[entry[0]].questionPremiseId = entry[1];
  //     });
  //   }

  //   this.remoteUpdate(this.newGameConfig);
  // }

  /** Used in services when new data should be saved in database. After that, refetch new object and reload forms with it */
  remoteUpdate(gameData: Game) {
    console.log('#remoteUpdate', gameData);

    if (!(gameData && gameData._id)) {
      return;
    }

    this.gameRemoteUpdating.set(true);

    this.updateGame(gameData)
      .pipe(take(1))
      .subscribe((updatedGame) => {
        if (updatedGame) {
          this.newGameConfig = updatedGame;
        }

        console.log('$$', this.newGameConfig);

        this.formUpdateTick$.next();
        setTimeout(() => this.gameRemoteUpdating.set(false), 500);
      });
  }

  cancelCurrentlyCreatedGame() {
    const gameId = this.newGameConfig._id;
    if (gameId) {
      this.gameRemoteUpdating.set(true);
      this.deleteGame(gameId)
        .pipe(first())
        .subscribe(() => {
          this.newGameConfig = DefaultGameValues;
          this.formUpdateTick$.next();
          setTimeout(() => this.gameRemoteUpdating.set(false), 500);
        });
    }
  }

  loadGameInCreation(gameId: string) {
    console.log('#loadGameInCreation', gameId);

    return this.getGame(gameId).pipe(
      tap((val) => console.log(val)),
      take(1),
      tap((val) => {
        if (val) {
          this.newGameConfig = val;
        }
      }),
    );
  }

  startGame(gameId: string) {
    const gameData = this.newGameConfig;
    this.remoteUpdate(gameData);
    return {} as any;
  }

  /** Seats: Invite player and reserve the seat */
  public processSeatInvitation(seat: PlayerSeat, invitedUser: AppAccount) {
    // const game = this.newGameConfig;
    // if (!game?._id) {
    //   return undefined;
    // }
    // const invitedOrSeated = wasPlayerAlreadyInvitedOrSeated(invitedUser._id, seat, game);
    // if (invitedOrSeated) {
    //   this.operationDisplay.set({
    //     status: 'error',
    //     message: 'User already has invitation or seat in this game.',
    //   });
    //   return undefined;
    // }
    // if (!invitedOrSeated) {
    //   const invitation: GameInvitation = {
    //     _id: generateDocumentId('ginv'),
    //     gameId: game?._id,
    //     seatIndex: seat.index,
    //     userId: invitedUser._id,
    //     userName: invitedUser.displayName,
    //   };
    //   const updatedSeat: PlayerSeat = {
    //     ...seat,
    //     status: 'pending-invitation',
    //     takenInfo: null,
    //     invitationInfo: { ...invitation },
    //   };
    //   const seats = { ...game.playersSeats };
    //   seats[updatedSeat.index] = updatedSeat;
    //   const updatedGame = { ...game, playersSeats: seats };
    //   this.gameRemoteUpdating.set(true);
    //   this.usersInvites
    //     .sendGameInvitation(invitation)
    //     ?.pipe(mergeMap(() => this.updateGameSeats(updatedGame)))
    //     .subscribe((val) => {
    //       setTimeout(() => {
    //         this.formUpdateTick$.next();
    //         this.gameRemoteUpdating.set(false);
    //       }, 500);
    //       if (val) {
    //         this.newGameConfig = val;
    //         console.log('processSeatInvitation', val);
    //         this.operationDisplay.set({
    //           status: 'success',
    //           message: 'User has been invited.',
    //         });
    //       }
    //     });
    // }
  }

  /** Seats: Kick player / Cancel invitation */
  public processSeatEmptying(seat: PlayerSeat) {
    const game = this.newGameConfig;

    if (!game?._id) {
      return undefined;
    }

    const updatedSeat: PlayerSeat = {
      ...seat,
      status: 'opened-empty',
      invitationInfo: {
        _id: null,
        seatIndex: seat.index,
        gameId: null,
        userId: null,
        userName: null,
      },
      takenInfo: {
        userId: null,
        userName: null,
      },
    };

    const seats = { ...game.playersSeats };
    seats[updatedSeat.index] = updatedSeat;
    const updatedGame = { ...game, playersSeats: seats };

    this.gameRemoteUpdating.set(true);
    this.updateGameSeats(updatedGame).subscribe((val) => {
      this.formUpdateTick$.next();
      setTimeout(() => this.gameRemoteUpdating.set(false), 500);
      if (val) {
        this.newGameConfig = val;
      }
    });
  }

  /** Seats: Open or close seat in public access */
  public processSeatAccess(seat: PlayerSeat, decision: 'close' | 'open') {
    const game = this.newGameConfig;

    if (!game?._id) {
      return undefined;
    }

    const updatedSeat: PlayerSeat = {
      ...seat,
      status: decision === 'close' ? 'closed' : 'opened-empty',
      takenInfo: null,
      invitationInfo: null,
    };

    const seats = { ...game.playersSeats };
    seats[updatedSeat.index] = updatedSeat;

    const updatedGame = { ...game, playersSeats: seats };

    this.gameRemoteUpdating.set(true);
    this.updateGameSeats(updatedGame).subscribe((val) => {
      this.formUpdateTick$.next();
      this.formUpdateTick$.next();
      setTimeout(() => this.gameRemoteUpdating.set(false), 500);
      if (val) {
        this.newGameConfig = val;
      }
    });
  }

  /* Seats: Either from public access or an invite */
  public processSeatTake(seat: PlayerSeat) {}

  public fakeForced_inviteGhost(seat: PlayerSeat) {
    const game = this.newGameConfig;

    const userId = generateDocumentId('fake-user');

    const updatedSeat: PlayerSeat = {
      ...seat,
      status: 'taken',
      takenInfo: {
        userId: userId,
        userName: `Fake User #${userId.substring(0, 6)}`,
      },
      invitationInfo: null,
    };

    const seats = { ...game.playersSeats };
    seats[updatedSeat.index] = updatedSeat;

    const updatedGame = { ...game, playersSeats: seats };
    this.formUpdateTick$.next();
    this.gameRemoteUpdating.set(true);
    this.updateGameSeats(updatedGame).subscribe((val) => {
      this.formUpdateTick$.next();
      setTimeout(() => this.gameRemoteUpdating.set(false), 500);
      if (val) {
        this.newGameConfig = val;
        this.operationDisplay.set({
          status: 'success',
          message: 'Fake User has been invited.',
        });
      }
    });
  }
}
