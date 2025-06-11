import { AdditionalUserInfo, OAuthCredential, User, UserCredential } from 'firebase/auth';
import { FriendContact, FriendInvitation, SimplePlayer } from './user.model';
import { GameInvitation } from '@shared/models/seats.model';

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
    friendsData: {
      contacts: FriendContact[];
      invitesReceived: FriendInvitation[];
      invitesSent: FriendInvitation[];
    };
    gamesInvites: GameInvitation[];
    chatData: {
      openTalksIds: string[];
      lastTenContactedFriendsIds: string[];
    };
  };
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
