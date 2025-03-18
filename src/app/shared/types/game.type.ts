import { QuestionPremise } from '@shared/constants/questions-premises.const';

export type Game = {
  _id: string | null;
  name: string | null;
  password: string | null | null;
  gameStage: GameStage | null;
  roundsData: {
    roundLengthMS: number;
    roundsAmountLimit: number;
    currentRoundNumber: number | -1;
    roundsEntries: GameRound[];
  };
  playersData: {
    seats: PlayingSeat[];
    creatorPlayerId: string | null;
    hostsPlayerIds: string[];
  };
};

export type GameStage = 'assembly' | 'playing' | 'reviewing' | 'summary';

export type GameLobbyConfig = {
  name: string | null;
  password: string | null | null;
  roundLengthMS: number;
  roundsAmountLimit: number;
};

export type GameRound = {
  roundNumber: number;
  questionPremise: QuestionPremise;
  playersInputs: PlayerInput[];
};

export type PlayingSeat = {
  index: number;
  status: 'closed' | 'opened-empty' | 'pending-invitation' | 'taken';
  invitationInfo: GameInvitation | null;
  takenInfo: TakenInfo | null;
};

export type TakenInfo = {
  userId?: string;
  userName?: string;
  userEmail?: string;
  locked?: boolean;
};

/**
 * Deleted after game is done
 */
export type GameInvitation = {
  _id: string;
  gameId: string;
  seatIndex: number;
  sentTime: number;
  userId?: string;
  userName?: string;
  userEmail?: string;
};

export type SimplePlayer = { userId: string; userName: string; userEmail: string };
export type SimplePlayerLogged = SimplePlayer & { logged: boolean };

export type CachedGameData = {
  data: Game;
  lastRefreshedRemote: number;
};

export type PlayerInput = {
  question: { content: string; author: SimplePlayer | undefined; ratings: Rating[] };
  answer: { content: string; author: SimplePlayer | undefined; ratings: Rating[] };
};

export type Rating = {
  value: number; // 1 - 5
  reviewer: { userId: string; userName: string };
};

export type FriendInvitation = {
  _id: string;
  active: boolean; // updated when invitation is accepted or denied or cancelled bo either of sides
  result?: 'accepted' | 'denied' | 'cancelled' | null;
  sentTime: number;
  senderPlayerId: string;
  senderPlayerName: string;
  receiverPlayerId: string;
  receiverPlayerName: string;
};

export type ChatMessage = {
  _id: string;
  sentMessage: string;
  sentTime: number;
  senderPlayerId: string;
  senderPlayerName: string;
  receiverPlayerId: string;
  receiverPlayerName: string;
};

export interface ChatInitData {
  senderPlayerId: string;
  senderPlayerName: string;
  receiverPlayerId: string;
  receiverPlayerName: string;
}
