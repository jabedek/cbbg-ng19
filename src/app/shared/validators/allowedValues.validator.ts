import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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
    console.log(valid, valid ? null : { allowedValues: { value: values } });

    return valid ? null : { allowedValues: { value: values } };
  };
}
