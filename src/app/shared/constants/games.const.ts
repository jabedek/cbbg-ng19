import { CachedGameData, Game, PlayingSeat } from '@shared/types/game.type';
import { RadioOption } from './inputs.const';

export const RoundsLimits = [10, 11, 12, 13, 14, 15] as const;

export const RoundLengthsOptions: RadioOption[] = [
  { label: '30s', value: 1000 * 30, checked: false },
  { label: '45s', value: 1000 * 45, checked: false },
  { label: '60s', value: 1000 * 60, checked: false },
] as const;

export const DefaultConfigData = {
  name: '',
  password: '',
  roundsAmountLimit: RoundsLimits[0],
  roundLengthMS: RoundLengthsOptions[1].value,
};

export const DefaultGameValues: Game = {
  _id: null,
  name: null,
  password: null,
  gameStage: null,
  roundsData: {
    roundLengthMS: DefaultConfigData.roundLengthMS,
    roundsAmountLimit: DefaultConfigData.roundsAmountLimit,
    currentRoundNumber: -1,
    roundsEntries: [],
  },
  playersData: {
    seats: [],
    creatorPlayerId: null,
    hostsPlayerIds: [],
  },
} as const;

export const DefaultCachedGameData: CachedGameData = {
  data: DefaultGameValues,
  lastRefreshedRemote: 0,
};

export const SEATS_AMOUNTS = [4, 5, 6];
export const DEFAULT_EMPTY_SEAT: PlayingSeat = {
  index: 0,
  status: 'closed',
  invitationInfo: null,
  takenInfo: null,
};

export const DEFAULT_SEATS: PlayingSeat[] = [
  {
    index: 0,
    status: 'closed',
    invitationInfo: null,
    takenInfo: null,
  },
  {
    index: 1,
    status: 'closed',
    invitationInfo: null,
    takenInfo: null,
  },
  {
    index: 2,
    status: 'closed',
    invitationInfo: null,
    takenInfo: null,
  },
  {
    index: 3,
    status: 'closed',
    invitationInfo: null,
    takenInfo: null,
  },
  {
    index: 4,
    status: 'closed',
    invitationInfo: null,
    takenInfo: null,
  },
  {
    index: 5,
    status: 'closed',
    invitationInfo: null,
    takenInfo: null,
  },
];

export const UPDATE_INTERVAL_SECONDS = 30;
export const PUBLICS_INTERVAL_SECONDS = 10;
