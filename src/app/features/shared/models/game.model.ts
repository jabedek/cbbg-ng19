import { GameRound, getRoundsArrayByAmount, RoundLengthsOptions, RoundsLimits } from './rounds-questions.model';
import { DefaultSeatsArray, PlayerSeat } from './seats.model';

export type GameStage = 'init' | 'setup' | 'playing' | 'reviewing' | 'summary';

export type Game = {
  _id: string | null;
  _createdAt: number;
  gameName: string;
  gamePassword: string;
  gameStage: GameStage;
  roundNumber: number;
  roundLengthMS: number;
  roundsAmountLimit: number;
  roundsEntries: GameRound[];
  playerCreatorId: string | null;
  playersHostsIds: string[];
  playersSeats: PlayerSeat[];
};

export type GameBasics = {
  _id: string | null;
  _createdAt: number;

  gameName: string;
  gamePassword: string;
  gameStage: GameStage;

  roundNumber: number;
  roundLengthMS: number;
  roundsAmountLimit: number;

  playerCreatorId: string | null;
  playersHostsIds: string[];
};

export type GameRounds = Record<string, GameRound>;

export type GameSeats = Record<string, PlayerSeat>;

export const DefaultGameValues: Game = {
  _id: null,
  _createdAt: -1,
  gameName: '',
  gamePassword: '',
  gameStage: 'init',
  roundNumber: -1,
  roundLengthMS: RoundLengthsOptions[1].value,
  roundsAmountLimit: RoundsLimits[0],
  roundsEntries: getRoundsArrayByAmount(RoundsLimits[0]),
  playerCreatorId: null,
  playersHostsIds: [],
  playersSeats: DefaultSeatsArray,
} as const;
