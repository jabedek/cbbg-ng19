import { AppAccount } from '@shared/models/auth.model';
import { Game } from '@shared/models/game.model';
import {
  getRoundsArrayByAmount,
  getRoundsEntriesByAmount,
  RoundLengthsOptions,
  RoundsLimits,
} from '@shared/models/rounds-questions.model';
import { DefaultSeats, DefaultSeatsArray } from '@shared/models/seats.model';

export function MOCK_createUsers(emails: string[]): AppAccount[] {
  const users = [];

  for (const email of emails) {
    // Generate UUID for user ID
    const uid = email;

    // Extract username and domain
    const [username, domain] = email.split('@');

    // Create default user account
    const user: AppAccount = {
      _id: uid,
      googleUid: username,
      email: email,
      displayName: username || '', // Default to username if not provided
      logged: true,
      active: true,
      appData: {
        activeGameId: null, // Default value
        friendsData: {
          contacts: emails.filter((e) => e !== email), // All other emails
          invitesReceived: [], // Default empty array
          invitesSent: [], // Default empty array
        },
        gamesInvites: [], // Default empty array
        chatData: {
          openTalksIds: [], // Default empty array
          lastTenContactedFriendsIds: [], // Default empty array
        },
      },
    };

    users.push(user);
  }
  // console.log(users);

  return users as AppAccount[];
}

export const MOCK_users = MOCK_createUsers([
  'john@abc.pl',
  'mark@abc.pl',
  'dave@abc.pl',
  'emily@abc.pl',
  'nina@abc.pl',
]);

export const MOCK_main_user = MOCK_users[0];

export function MOCK_createGame(playersEmails: string[]) {
  const timestamp = Math.randomInt(1_000_000_000, 9_000_000_000);
  const gameId = `game-id-${timestamp}`;

  const seats = DefaultSeatsArray;

  seats[0].status = 'taken';
  seats[0].takenInfo = { userId: MOCK_main_user._id, userName: MOCK_main_user.displayName };

  seats[1].status = 'opened-empty';

  seats[2].status = 'pending-invitation';
  seats[2].invitationInfo = {
    _id: '123',
    gameId: gameId,
    seatIndex: 2,
    userId: playersEmails.at(-1),
    userName: playersEmails.at(-1),
  };

  seats[4].status = 'closed';
  seats[5].status = 'closed';

  // console.log(seats);

  const game: Game = {
    _id: gameId,
    _createdAt: Date.now(),
    gameName: gameId,
    gamePassword: '',
    gameStage: 'setup',
    roundsAmountLimit: RoundsLimits[0],
    roundNumber: -1,
    roundLengthMS: RoundLengthsOptions[1].value,
    roundsEntries: getRoundsArrayByAmount(RoundsLimits[0]),
    playerCreatorId: MOCK_main_user._id,
    playersHostsIds: [MOCK_main_user._id],
    playersSeats: seats,
  } as const;

  return game;
}

export const MOCK_games = [
  MOCK_createGame(['mark@abc.pl', 'dave@abc.pl', 'emily@abc.pl', 'nina@abc.pl']),
  MOCK_createGame(['mark@abc.pl', 'dave@abc.pl', 'emily@abc.pl', 'nina@abc.pl']),
];
