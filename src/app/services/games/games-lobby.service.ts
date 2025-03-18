import { computed, DestroyRef, effect, inject, Injectable, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CachedGameData, Game, GameLobbyConfig, GameRound, PlayingSeat } from '@shared/types/game.type';
import { AppCrypto } from '@shared/utils/crypto.util';
import { generateDocumentId } from 'frotsi';
import { BehaviorSubject, debounceTime, first, from, map, Observable, ReplaySubject, Subject } from 'rxjs';
import { GamesService } from './games.service';
import {
  DEFAULT_SEATS,
  DefaultCachedGameData,
  DefaultConfigData,
  UPDATE_INTERVAL_SECONDS,
} from '@shared/constants/games.const';
import { OperationDisplay } from '@shared/types/common.type';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { set } from 'lodash';

export type GameUpdatePart =
  | {
      key: 'config';
      data: GameLobbyConfig;
    }
  | { key: 'rounds'; data: GameRound[] }
  | { key: 'seats'; data: PlayingSeat[] };

@Injectable({
  providedIn: 'root',
})
export class GamesLobbyService implements OnInit, OnDestroy {
  private updateInterval?: NodeJS.Timeout;

  private _currentlyCreatedGame = signal<CachedGameData>(DefaultCachedGameData);
  currentlyCreatedGame = computed(() => this._currentlyCreatedGame());

  gameIsUpdatingRemotely = signal(false);
  gameIsUpdatingRemotelyEffect = effect(() => {
    if (this.gameIsUpdatingRemotely()) {
      this.operationDisplay.set({ status: 'pending', message: undefined });
    } else {
      this.operationDisplay.set({ status: 'none', message: undefined });
    }
  });

  gameStage = computed(() => this.currentlyCreatedGame().data?.gameStage);

  gameHasStarted = computed(() => {
    const gameStage = this.gameStage();
    return gameStage && gameStage !== 'assembly';
  });

  hostPlayerId = computed(() => {
    if (!this.currentlyCreatedGame().data) {
      return undefined;
    }
    const hostsIds = this.currentlyCreatedGame().data?.playersData.hostsPlayerIds || [];
    return hostsIds[hostsIds.length - 1];
  });

  userIsHost = computed(() => this.auth.appAccount()?._id === this.hostPlayerId());

  operationDisplay = signal<OperationDisplay>({ status: 'none' });

  constructor(
    private router: Router,
    private auth: AuthService,
    private games: GamesService,
  ) {
    this.updateRemoteInterval();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    clearInterval(this.updateInterval);
  }

  initNewGame() {
    const creatorPlayerId = this.auth.appAccount()?._id;
    const creatorPlayerName = this.auth.appAccount()?.displayName;
    const creatorPlayerEmail = this.auth.appAccount()?.email;

    const gameData = this.currentlyCreatedGame().data;
    if (!gameData) {
      return;
    }

    const config: GameLobbyConfig = {
      name: gameData.name,
      password: gameData.password,
      roundLengthMS: gameData.roundsData.roundLengthMS,
      roundsAmountLimit: gameData.roundsData.roundsAmountLimit,
    };

    if (config && creatorPlayerId && creatorPlayerName) {
      const gameId = generateDocumentId('game');

      // if (config.password && !config.password.includes('㋛')) {
      //   config.password = AppCrypto.encrypt(config.password);
      // }

      const newGame: Game = {
        _id: gameId,
        name: config.name,
        password: config.password,
        gameStage: 'assembly',
        roundsData: {
          roundsAmountLimit: config.roundsAmountLimit,
          roundLengthMS: config.roundLengthMS,
          currentRoundNumber: -1,
          roundsEntries: [],
        },
        playersData: {
          seats: DEFAULT_SEATS,
          creatorPlayerId: creatorPlayerId,
          hostsPlayerIds: [creatorPlayerId],
        },
      };

      newGame.playersData.seats[0] = {
        ...newGame.playersData.seats[0],
        status: 'taken',
        takenInfo: {
          userId: creatorPlayerId,
          userName: creatorPlayerName,
          userEmail: creatorPlayerEmail,
          locked: true,
        },
      };

      this.gameIsUpdatingRemotely.set(true);

      this.games
        .createGame(newGame)
        .pipe(first())
        .subscribe((game) => {
          if (game) {
            this._currentlyCreatedGame.set({ lastRefreshedRemote: Date.now(), data: game });

            setTimeout(() => {
              this.gameIsUpdatingRemotely.set(false);
              this.router.navigate(['/game/' + gameId + '/assembly']);
            }, 1000);
          }
        });
    }
  }

  loadCreatedGameInAssembly(gameId: string) {
    this.games
      .getGame(gameId)
      .pipe(first())
      .subscribe((game = DefaultCachedGameData.data) =>
        this._currentlyCreatedGame.set({ data: game, lastRefreshedRemote: Date.now() }),
      );
  }

  updateLocallyLobbyGame(part: GameUpdatePart) {
    console.log('updateLocallyLobbyGame', part);

    this._currentlyCreatedGame.update((cache = DefaultCachedGameData) => {
      const game: Game = cache.data;

      if (part.key === 'config') {
        game.name = part.data.name;
        game.password = part.data.password;
        game.roundsData = {
          roundsEntries: game.roundsData?.roundsEntries || [],
          currentRoundNumber: game.roundsData?.currentRoundNumber || -1,
          roundLengthMS: part.data.roundLengthMS,
          roundsAmountLimit: part.data.roundsAmountLimit,
        };
      }

      if (part.key === 'rounds') {
        game.roundsData = {
          roundsEntries: [...part.data],
          currentRoundNumber: game.roundsData?.currentRoundNumber || -1,
          roundLengthMS: game.roundsData?.roundLengthMS || DefaultConfigData.roundLengthMS,
          roundsAmountLimit: game.roundsData?.roundsAmountLimit || DefaultConfigData.roundsAmountLimit,
        };
      }

      if (part.key === 'seats') {
        game.playersData = {
          ...game.playersData,
          seats: [...part.data],
        };
      }
      this.updateRemoteLobbyGame();
      return { lastRefreshedRemote: 0, data: game };
    });
  }

  private updateRemoteLobbyGame() {
    const gameData = this.currentlyCreatedGame().data;
    if (!(gameData && gameData._id)) {
      return;
    }

    const newRefresh = Date.now();
    const lastRefresh = this.currentlyCreatedGame().lastRefreshedRemote;
    const diffSeconds = Math.abs(newRefresh - lastRefresh) / 1000;
    const seconds = Number(diffSeconds.toFixed(0));

    if (seconds > 1) {
      // if (gameData.password && !gameData.password.includes('㋛')) {
      //   gameData.password = AppCrypto.encrypt(gameData.password);
      // }

      this.gameIsUpdatingRemotely.set(true);

      this.games
        .updateGame(gameData)
        .pipe(first())
        .subscribe((updatedGame) => {
          if (updatedGame) {
            this._currentlyCreatedGame.set({ data: updatedGame, lastRefreshedRemote: Date.now() });
          }
          setTimeout(() => this.gameIsUpdatingRemotely.set(false), 500);
        });
    }
  }

  private updateRemoteInterval() {
    this.updateInterval = setInterval(() => {
      if (this.gameStage() === 'assembly') {
        this.updateRemoteLobbyGame();
      }
    }, 1000 * UPDATE_INTERVAL_SECONDS);
  }

  getGamesInAssembly(): Observable<Game[]> {
    return this.games
      .getGames({
        key: 'gameStage',
        values: ['assembly'],
      })
      .pipe(
        map((games = []) => {
          return games
            .filter(({ playersData }) => {
              return playersData.seats.some((seat) => {
                const currentUserId = this.auth.appAccount()?._id;
                if (!currentUserId) {
                  return;
                }
                return seat.status === 'opened-empty' || seat.invitationInfo?.userId === currentUserId;
              });
            })
            .map((game) => {
              if (game.password && game.password.includes('_')) {
                game.password = AppCrypto.decrypt(game.password);
              }
              return game;
            });
        }),
      );
  }

  cancelCurrentlyCreatedGame() {
    const gameId = this.currentlyCreatedGame().data._id;
    if (gameId) {
      this.gameIsUpdatingRemotely.set(true);
      this.games
        .deleteGame(gameId)
        .pipe(first())
        .subscribe(() => {
          this._currentlyCreatedGame.set(DefaultCachedGameData);
          setTimeout(() => this.gameIsUpdatingRemotely.set(false), 500);
        });
    }
  }

  startGame(gameId: string) {
    this.updateRemoteLobbyGame();
    return {} as any;
  }

  joinGame(gameId: string, userId: string) {
    return {} as any;
  }

  leaveGame(gameId: string, userId: string) {
    return {} as any;
  }
}
