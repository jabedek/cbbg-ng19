import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { GameRound, QuestionPremiseId } from '@shared/models/rounds-questions.model';
import { PlayerSeat } from '@shared/models/seats.model';

export function allowedValuesValidator(values: any[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const allowedValuesType = typeof values[0];
    let controlValue = control.value;
    if (allowedValuesType === 'string') {
      controlValue = String(controlValue);
    }

    if (allowedValuesType === 'number') {
      controlValue = Number(controlValue);
    }

    const valid = values.includes(controlValue);
    // console.log(valid, valid ? null : { allowedValues: { value: values } });

    return valid ? null : { allowedValues: { value: values } };
  };
}

export function roundsQuestionsCheck(rounds: GameRound[]) {
  return rounds.every((round) => !!round.questionPremiseId);
}

export function seatsCheck(seats: PlayerSeat[]) {
  const validPlayers: PlayerSeat[] = [];

  seats.forEach((seat) => {
    if (seat.takenInfo?.userId) {
      validPlayers.push(seat);
    }
  });

  return validPlayers.length >= 3;
}
