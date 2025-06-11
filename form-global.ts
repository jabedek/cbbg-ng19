import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { Subject } from 'rxjs';

function getErrorsFn(control: AbstractControl): any[] {
  const errors: any[] = [];

  Object.entries((control as FormGroup).controls).forEach(([name, data]) => {
    if (!!data && data.errors) {
      errors.push({ name, details: { ...data.errors } });
    }
  });

  return errors;
}

export class AppFormControl<TValue = any> extends FormControl {
  setName(name?: string) {
    this.info = Object.freeze({ ...this.info, name });
  }
  info?: Record<string, any>;

  afterReset?: CallableFunction;

  private resetted_ = new Subject<void>();
  get resetted$() {
    return this.resetted_.asObservable();
  }

  override reset(value?: TValue, options?: Object) {
    super.reset(value, options);
    this.resetted_.next();
    if (this.afterReset) {
      this.afterReset();
    }
  }
}

export class AppFormGroup<TValue = any> extends FormGroup {
  /**
   * Array of errors from all controls
   */
  get app_controlsErrors(): any[] {
    return getErrorsFn(this);
  }

  /**
   * Validity based on standard `valid` attribute and `app_controlsErrors`
   */
  get app_overallValid() {
    return this.valid && this.app_controlsErrors.length === 0;
  }

  /**
   * Invalidity based on standard `valid` attribute and `app_controlsErrors`
   */
  get app_overallInvalid() {
    return !this.valid || this.app_controlsErrors.length > 0;
  }

  setName(name?: string) {
    this.info = Object.freeze({ ...this.info, name });
  }
  info?: Record<string, any>;

  afterReset?: CallableFunction;

  private resetted_ = new Subject<void>();
  get resetted$() {
    return this.resetted_.asObservable();
  }

  override reset(value?: TValue, options?: Object) {
    super.reset(value, options);
    this.resetted_.next();
    if (this.afterReset) {
      this.afterReset();
    }
  }
}

export class AppFormArray<TValue = any> extends FormArray {
  /**
   * Array of errors from all controls
   */
  get app_controlsErrors(): any[] {
    return getErrorsFn(this);
  }

  /**
   * Validity based on standard `valid` attribute and `app_controlsErrors`
   */
  get app_overallValid() {
    return this.valid && !this.app_controlsErrors;
  }

  /**
   * Invalidity based on standard `valid` attribute and `app_controlsErrors`
   */
  get app_overallInvalid() {
    return !this.app_overallValid;
  }

  setName(name?: string) {
    this.info = Object.freeze({ ...this.info, name });
  }
  info?: Record<string, any>;

  afterReset?: CallableFunction;

  private resetted_ = new Subject<void>();
  get resetted$() {
    return this.resetted_.asObservable();
  }

  override reset(value?: TValue, options?: Object) {
    super.reset(value, options);
    this.resetted_.next();
    if (this.afterReset) {
      this.afterReset();
    }
  }
}
