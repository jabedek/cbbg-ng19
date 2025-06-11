import { FormControl } from '@angular/forms';
import { RadioOption } from '@shared/models/inputs.model';
import { SimplePlayer } from '@shared/models/user.model';
import { loop } from 'frotsi';
import { GameRounds } from './game.model';
import { FORM_APP_DATA } from '@shared/constants/special-fields-extensions';

export const QUESTIONS_ARRAY = [
  { _id: '10_91599', text: 'Co by było gdyby...' },
  { _id: '11_8dabd', text: 'Co powiedział(a)...' },
  { _id: '12_9c2f4', text: 'Co by powiedział(a)...' },
  { _id: '13_f1db7', text: 'Co mogłoby...' },
  { _id: '14_16809', text: 'Co chciał(a)by...' },
  { _id: '15_19e5a', text: 'Co chciał(a)byś...' },
  { _id: '16_4eead', text: 'Ile trzeba...' },
  { _id: '17_f984c', text: 'Ile kosztuje...' },
  { _id: '18_1bc85', text: 'Gdzie...' },
  { _id: '19_dbde5', text: 'Skąd...' },
  { _id: '20_acca3', text: 'Kiedy...' },
  { _id: '21_64790', text: 'Od kiedy...' },
  { _id: '22_a8df7', text: 'Kto...' },
  { _id: '23_fe528', text: 'Kto był...' },
  { _id: '24_d743e', text: 'Kto wymyślił...' },
  { _id: '25_fc0c6', text: 'Kim był...' },
  { _id: '26_b8f8b', text: 'Z kim...' },
  { _id: '27_bf402', text: 'Po kim...' },
  { _id: '28_5465d', text: 'Za kogo...' },
  { _id: '29_9b4af', text: 'Za co...' },
  { _id: '30_26468', text: 'Dlaczego...' },
  { _id: '31_8c929', text: 'Po co...' },
  { _id: '32_b7f7a', text: 'Jak...' },
  { _id: '33_32468', text: 'Jak nazwiesz...' },
  { _id: '34_b1f56', text: 'Jak to możliwe, że...' },
  { _id: '35_b5c66', text: 'Jaka jest szansa na to, że...' },
  { _id: '36_19e62', text: 'Czym różni się...' },
  { _id: '37_aa6c5', text: 'W jakiej kolejności...' },
  { _id: '38_47e51', text: 'Przed czym...' },
] as const;

export type QuestionPremise = (typeof QUESTIONS_ARRAY)[number];

export const QUESTIONS_DICTIONARY = Object.values(QUESTIONS_ARRAY).reduce(
  (acc, newVal: QuestionPremise) => Object.assign({}, acc, { [newVal._id]: newVal.text }),
  {},
) as Record<QuestionPremise['_id'], QuestionPremise['text']>;
// console.log(QUESTIONS_DICTIONARY);

export type QuestionPremiseId = keyof typeof QUESTIONS_DICTIONARY;

export type GameRound = {
  roundNumber: number;
  phase: 'idle' | 'questions' | 'premises' | 'done';
  questionPremiseId: QuestionPremiseId | null;
  playersInputs: PlayerRoundInput[] | null;
};

export type PlayerRoundInput = {
  question: { content: string; author: SimplePlayer | undefined; ratings: RoundInputRating[] };
  answer: { content: string; author: SimplePlayer | undefined; ratings: RoundInputRating[] };
};

export type RoundInputRating = {
  value: number; // 1 - 5
  reviewer: { userId: string; userName: string };
};

export const RoundsLimits = [8, 9, 10, 11, 12];

export const RoundLengthsOptions: RadioOption<number>[] = [
  { label: '30s', value: 1000 * 30, checked: false },
  { label: '45s', value: 1000 * 45, checked: false },
  { label: '60s', value: 1000 * 60, checked: false },
];

export const DefaultRoundEntry = {
  0: {
    roundNumber: 0,
    phase: 'lidl',
    playersInputs: [],
    questionPremiseId: null,
  },
} as const;

export function getRoundsArrayByAmount(amount: number) {
  const entries: GameRound[] = [];

  loop(amount).forEach((index) => {
    entries[index] = {
      roundNumber: index,
      phase: 'idle',
      playersInputs: [],
      questionPremiseId: null,
    };
  });

  return entries;
}

export function getRoundsEntriesByAmount(amount: number) {
  const entries: GameRounds = {};

  loop(amount).forEach((index) => {
    entries[index] = {
      roundNumber: index,
      phase: 'idle',
      playersInputs: [],
      questionPremiseId: null,
    };
  });

  return entries;
}

export function updateRoundsEntries(newAmount: number, roundsEntries: GameRounds) {
  const roundsCopy = { ...roundsEntries };
  const currentAmount = Object.entries(roundsEntries).length;

  if (currentAmount === newAmount) {
    return roundsCopy;
  }

  if (newAmount > currentAmount) {
    for (let i = currentAmount; i < newAmount; i++) {
      roundsCopy[i] = {
        roundNumber: i,
        phase: 'idle',
        playersInputs: [],
        questionPremiseId: null,
      };
    }
  }

  if (newAmount < currentAmount) {
    delete roundsCopy[currentAmount - 1];
  }

  return roundsCopy;
}

export const buildRoundsFormPartial = (roundsEntries: GameRounds) => {
  return Object.entries(roundsEntries).map(([key, value]) => {
    const newControl = new FormControl({ value: value.questionPremiseId, disabled: false });
    (newControl as any)[FORM_APP_DATA] = {
      name: `Round_${key}`,
      roundIndex: +key,
    };
    return newControl;
  });
};

// export const prepareRoundsFromRemoteToUpdateForm = (roundsEntries: GameRounds) => {

// }
