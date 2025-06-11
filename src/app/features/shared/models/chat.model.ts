import { Flatten } from 'frotsi';

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

export class TalkManager {
  getFreshestMessages_30(chatId: string): TalkHistoryData {
    return { chatId, messages: [] };
  }

  getNextOlderMessages_30(chatId: string): TalkHistoryData {
    return { chatId, messages: [] };
  }
}

type TalkBase = {
  _id: string;
  order: number;
  type: 'standard' | 'conference';
  createInfo: {
    createdById: string;
    createdAt: number;
  };

  isMinimized: boolean;
  hasUnreadMessages: boolean;

  /** Populated by above functions.
   * Initially has only first 30 lat messages.
   * Then thru scrolling older messages are being added */
  messagesHistory: TalkMessage[];
};

export type StandardTalk = Flatten<
  {
    type: 'standard';
    membersIds: [string, string];
  } & TalkBase
>;

export type ConferenceTalk = Flatten<
  {
    type: 'conference';
    membersIds: string[];
    talkAdminId: string;
  } & TalkBase
>;

export type Talk = StandardTalk | ConferenceTalk;

export type TalkHistoryData = {
  chatId: string;
  messages: TalkMessage[];
};

export type TalkMessage = {
  _id: string;
  talkId: string;
  authorUserId: string;
  sentAt: number;
  messageContent: string;
};

export type SimpleChatFriend = {
  userId: string;
  userEmail: string;
  userName: string;
  isOnline: boolean;
};
