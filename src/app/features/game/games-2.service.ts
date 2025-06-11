import { effect, Injectable, signal } from '@angular/core';
import { DefaultGameValues, Game, GameStage } from '@shared/models/game.model';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  from,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { UsersFriendInvitesService } from 'src/app/features/user/users-friend-invites.service';
import { OperationDisplay } from '@shared/models/common.model';
import { DefaultSeatsArray, GameInvitation, PlayerSeat } from '@shared/models/seats.model';
import { tryCatch, consoleError } from '@shared/utils/dev.util';
import { FormControl, FormGroup } from '@angular/forms';
import {
  RoundLengthsOptions,
  RoundsLimits,
  GameRound,
  getRoundsArrayByAmount,
} from '@shared/models/rounds-questions.model';
import { generateDocumentId } from 'frotsi';
import { Router } from '@angular/router';
import { FirebaseDataService } from '../firebase/firebase-data.service';
import { AuthService } from '../user/auth.service';
import { GameFormRaw, getInitGameFormRaw } from './components/new-game-form-2/new-game-form-2.component';

export function transformFormRawToModel(raw: GameFormRaw): Game {
  const game: Game = {
    _id: raw._id ?? DefaultGameValues._id,
    _createdAt: raw._createdAt ?? DefaultGameValues._createdAt,
    gameName: raw.gameName ?? DefaultGameValues.gameName,
    gamePassword: raw.gamePassword ?? DefaultGameValues.gamePassword,
    gameStage: raw.gameStage ?? DefaultGameValues.gameStage,
    roundNumber: raw.roundNumber ?? DefaultGameValues.roundNumber,
    roundLengthMS: raw.roundLengthMS ?? DefaultGameValues.roundLengthMS,
    roundsAmountLimit: raw.roundsAmountLimit ?? DefaultGameValues.roundsAmountLimit,
    roundsEntries: raw.roundsEntries ?? DefaultGameValues.roundsEntries,
    playerCreatorId: raw.playerCreatorId ?? DefaultGameValues.playerCreatorId,
    playersHostsIds: raw.playersHostsIds ?? DefaultGameValues.playersHostsIds,
    playersSeats: raw.playersSeats ?? DefaultGameValues.playersSeats,
  };

  return game;
}

export function transformModelToForm(gameModel: Game): FormGroup {
  const gameForm = new FormGroup({
    // auto
    _id: new FormControl<string | null>(gameModel._id),
    _createdAt: new FormControl<number>(gameModel._createdAt),
    gameStage: new FormControl<GameStage>(gameModel.gameStage),
    roundNumber: new FormControl<number>(gameModel.roundNumber),
    playerCreatorId: new FormControl<string | null>(gameModel.playerCreatorId),
    playersHostsIds: new FormControl<string[]>(gameModel.playersHostsIds),

    // basics
    gameName: new FormControl<string>(gameModel.gameName),
    gamePassword: new FormControl<string>(gameModel.gamePassword),
    roundLengthMS: new FormControl<number>(gameModel.roundLengthMS),
    roundsAmountLimit: new FormControl<number>(gameModel.roundsAmountLimit),

    // rounds & questions
    roundsEntries: new FormControl<GameRound[]>(gameModel.roundsEntries),

    // players & seats
    playersSeats: new FormControl<PlayerSeat[]>(gameModel.playersSeats),
  });

  return gameForm;
}

@Injectable({
  providedIn: 'root',
})
export class Games2Service {
  operationDisplay = signal<OperationDisplay>({ status: 'none' });
  // formUpdateTick$ = new Subject<Game>();

  newGameModel$ = new BehaviorSubject<Game>(DefaultGameValues);
  gameRemoteUpdating = signal(false);
  gameRemoteUpdatingEffect = effect(() => {
    if (this.gameRemoteUpdating()) {
      this.operationDisplay.set({ status: 'pending', message: undefined });
    } else {
      this.operationDisplay.set({ status: 'none', message: undefined });
    }
  });

  get createContext() {
    const game: Game = this.newGameModel$.value;

    const gameStage = game.gameStage;
    const gameHasStarted = !!gameStage && !['init', 'setup'].includes(gameStage);
    const gameInSetup = gameStage === 'setup';

    const currentUserId = this.auth.currentUserId;
    const hostPlayerId = !!(game._id && game.playersHostsIds) ? game.playersHostsIds.at(-1) : undefined;
    const userIsHost = currentUserId === hostPlayerId;

    const formEditable = Boolean(!gameHasStarted && userIsHost);
    const seatsEditable = !gameHasStarted && userIsHost;

    return {
      gameStage,
      gameHasStarted,
      gameInSetup,
      currentUserId,
      hostPlayerId,
      userIsHost,
      formEditable,
      seatsEditable,
    };
  }

  constructor(
    private router: Router,
    private auth: AuthService,
    private firebaseData: FirebaseDataService,
    private usersInvites: UsersFriendInvitesService,
  ) {}

  createGame(gameData: Game): Observable<Game | undefined> {
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

  getGame(gameId: string): Observable<Game | undefined> {
    return from(this.firebaseData.readOneBy<Game>('games', { key: '_id', value: gameId })).pipe(
      catchError((error) => {
        consoleError(error, '[Games#getGame]');
        return of(error);
      }),
      map((game) => game),
    );
  }

  updateGame(gameData: Game): Observable<Game | undefined> {
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

  moveNewGameToInit() {
    const game: Game = transformFormRawToModel(getInitGameFormRaw());
    this.newGameModel$.next(game);

    const account = this.auth.appAccount;
    if (!account) {
      consoleError('No account');
      return undefined;
    }

    const newGameId = generateDocumentId('game');

    game._id = newGameId;
    game._createdAt = Date.now();
    game.playersHostsIds = [account._id];
    game.playerCreatorId = account._id;
    game.gameStage = 'init';
    game.playersSeats[0] = {
      ...game.playersSeats[0],
      status: 'taken',
      takenInfo: {
        userId: account._id,
        userName: account.displayName,
      },
    };
    console.log('initNewGame', game);

    this.gameRemoteUpdating.set(true);

    this.createGame(game)
      .pipe(take(1))
      .subscribe((val) => {
        console.log('initNewGame', val);

        setTimeout(() => {
          this.gameRemoteUpdating.set(false);
          if (val) {
            this.router.navigate([`${newGameId}/setup`]);
            // this.formUpdateTick$.next(val);
            this.newGameModel$.next(val);
          }
        }, 500);
      });
  }

  moveNewGameToSetup(gameForm: GameFormRaw) {
    console.log('moveNewGameToSetup', gameForm);

    const game: Game = transformFormRawToModel(gameForm);
    game.gameStage = 'setup';

    this.gameRemoteUpdating.set(true);
    this.updateGame(game).subscribe((val) => {
      console.log('moveNewGameToSetup', val);

      setTimeout(() => {
        this.gameRemoteUpdating.set(false);
        if (val) {
          this.newGameModel$.next(val);
          // this.formUpdateTick$.next(val);
        }
      }, 500);
    });
  }

  resolveNewGameForSetup(gameId: string) {
    console.log('#resolveNewGameForSetup', gameId);

    return this.getGame(gameId).pipe(
      tap((val) => console.log(val)),
      take(1),
      tap((val) => {
        if (val) {
          this.newGameModel$.next(val);
        }
      }),
    );
  }

  /** Seats: Invite player and reserve the seat */
  public processSeatInvitation(gameForm: GameFormRaw, invitation: GameInvitation) {
    const game: Game = transformFormRawToModel(gameForm);

    this.gameRemoteUpdating.set(true);
    this.usersInvites
      .sendGameInvitation(invitation)
      ?.pipe(mergeMap(() => this.updateGame(game)))
      .subscribe((val) => {
        setTimeout(() => {
          this.gameRemoteUpdating.set(false);
          if (val) {
            // this.formUpdateTick$.next(val);
            this.newGameModel$.next(val);
            this.operationDisplay.set({
              status: 'success',
              message: 'User has been invited.',
            });
          }
        }, 500);
      });
  }

  /** Seats: Kick player / Cancel invitation */
  public processSeatEmptying(gameForm: GameFormRaw) {
    const game: Game = transformFormRawToModel(gameForm);

    this.gameRemoteUpdating.set(true);
    this.updateGame(game).subscribe((val) => {
      setTimeout(() => {
        this.gameRemoteUpdating.set(false);
        if (val) {
          // this.formUpdateTick$.next(val);

          this.newGameModel$.next(val);
        }
      }, 500);
    });
  }

  /** Seats: Open or close seat in public access */
  public processSeatAccess(gameForm: GameFormRaw) {
    const game: Game = transformFormRawToModel(gameForm);

    this.gameRemoteUpdating.set(true);
    this.updateGame(game).subscribe((val) => {
      setTimeout(() => {
        this.gameRemoteUpdating.set(false);
        if (val) {
          // this.formUpdateTick$.next(val);
          this.newGameModel$.next(val);
        }
      }, 500);
    });
  }
}
