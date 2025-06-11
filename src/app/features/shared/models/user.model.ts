import { UserEmail, UserId } from './common.model';

export type FriendContact = SimplePlayer | UserId | UserEmail;

export type SimplePlayer = { userId: string; userName: string; userEmail: string };
export type SimplePlayerLogged = SimplePlayer & { logged: boolean };

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
