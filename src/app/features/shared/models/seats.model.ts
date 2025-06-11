import { FormGroup, FormControl } from '@angular/forms';
import { GameSeats } from './game.model';
import { FORM_APP_DATA } from '@shared/constants/special-fields-extensions';

export type PlayerSeatStatus = 'closed' | 'opened-empty' | 'pending-invitation' | 'taken';

export type PlayerSeat = {
  index: number;
  status: PlayerSeatStatus | null;
  invitationInfo?: GameInvitation | null;
  takenInfo?: SeatTakenInfo | null;
};

export type SeatTakenInfo = {
  userId?: string | null;
  userName?: string | null;
};

/**
 * Deleted after game is done
 */
export type GameInvitation = {
  _id: string | null;
  gameId: string | null;
  seatIndex: number | null;
  userId?: string | null;
  userName?: string | null;
};

export const DefaultSeats: GameSeats = {
  0: {
    index: 0,
    status: 'closed',
    invitationInfo: {
      _id: null,
      seatIndex: 0,
      gameId: null,
      userId: null,
      userName: null,
    },
    takenInfo: {
      userId: null,
      userName: null,
    },
  },
  1: {
    index: 1,
    status: 'closed',
    invitationInfo: {
      _id: null,
      seatIndex: 1,
      gameId: null,
      userId: null,
      userName: null,
    },
    takenInfo: {
      userId: null,
      userName: null,
    },
  },
  2: {
    index: 2,
    status: 'closed',
    invitationInfo: {
      _id: null,
      seatIndex: 2,
      gameId: null,
      userId: null,
      userName: null,
    },
    takenInfo: {
      userId: null,
      userName: null,
    },
  },
  3: {
    index: 3,
    status: 'closed',
    invitationInfo: {
      _id: null,
      seatIndex: 3,
      gameId: null,
      userId: null,
      userName: null,
    },
    takenInfo: {
      userId: null,
      userName: null,
    },
  },
  4: {
    index: 4,
    status: 'closed',
    invitationInfo: {
      _id: null,
      seatIndex: 4,
      gameId: null,
      userId: null,
      userName: null,
    },
    takenInfo: {
      userId: null,
      userName: null,
    },
  },
  5: {
    index: 5,
    status: 'closed',
    invitationInfo: {
      _id: null,
      seatIndex: 5,
      gameId: null,
      userId: null,
      userName: null,
    },
    takenInfo: {
      userId: null,
      userName: null,
    },
  },
} as const;

export const DefaultSeatsArray = Object.values(DefaultSeats);

export const buildSeatsFormPartial = (playersSeats: GameSeats) => {
  return Object.entries(playersSeats).reduce((acc, newVal: [string, PlayerSeat], index) => {
    const newFormGroup = new FormGroup({
      index: new FormControl(newVal[1].index),
      status: new FormControl(newVal[1].status),
      invitationInfo: new FormGroup({
        _id: new FormControl(newVal[1].invitationInfo?._id || null),
        seatIndex: new FormControl(newVal[1].index),
        gameId: new FormControl(newVal[1].invitationInfo?.gameId || null),
        userId: new FormControl(newVal[1].invitationInfo?.userId || null),
        userName: new FormControl(newVal[1].invitationInfo?.userName || null),
      }),
      takenInfo: new FormGroup({
        userId: new FormControl(newVal[1].takenInfo?.userId || null),
        userName: new FormControl(newVal[1].takenInfo?.userName || null),
      }),
    });

    (newFormGroup as any)[FORM_APP_DATA] = {
      name: `Seat_${index}`,
      seatIndex: +index,
    };

    return Object.assign({}, acc, { [newVal[0]]: newFormGroup });
  }, {});
};

export function wasPlayerAlreadyInvitedOrSeated(
  playerId: string,
  seatCtrlValue: PlayerSeat,
  gameId: string,
  playerSeats: PlayerSeat[],
) {
  const playerFound = !!playerSeats?.find((seat) => {
    const userId = seat.invitationInfo?.userId || seat.takenInfo?.userId;
    return userId === playerId;
  });
  return playerFound;
}
