import { AdditionalUserInfo, OAuthCredential, User, UserCredential } from 'firebase/auth';
import { FriendInvitation, GameInvitation, SimplePlayer } from './game.type';

export type FirebaseAuthData = {
  credential?: OAuthCredential | null | undefined;
  accessToken?: string | null | undefined;
  idToken?: string | null | undefined;
  user?: User | null | undefined;
};

export type AppAccount = {
  _id: string;
  googleUid: string;
  email: string;
  displayName: string;
  logged: boolean;
  active: boolean;
  appData: {
    activeGameId: string | null | undefined;
    friendsIds: string[];
    chatInfo: {
      openTalksIds: string[];
      lastTenContactedFriendsIds: string[];
    };
  };
};

export type UserAppData = {
  friendsData: SimplePlayer[];
  friendsInvites: {
    received: FriendInvitation[];
    sent: FriendInvitation[];
  };
  gamesInvites: GameInvitation[];
};

type _FullAuthData =
  | {
      firebaseAccount: FirebaseAuthData | undefined | null;
      appAccount: AppAccount | undefined | null;
      // appData: UserAppData | undefined | null;
    }
  | undefined
  | null;

export type FullAuthData = Partial<_FullAuthData>;
