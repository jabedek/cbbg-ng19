import { FullAuthData } from '@shared/types/auth.type';
import { Game } from '@shared/types/game.type';

export type State = {
  authData?: FullAuthData | null;
  currentlyAssembledGame?: CurrentlyAssembledGame | null; // both creation and joining
  currentlyPlayedGame?: CurrentlyPlayedGame | null;
};

export type CurrentlyAssembledGame = {
  id?: string;
  data?: Game;
  lastRefreshedRemote: number;
};

export type CurrentlyPlayedGame = {
  id?: string;
  data?: Game;
  lastRefreshedRemote: number;
};
