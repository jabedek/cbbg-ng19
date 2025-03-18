import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  forwardRef,
  Host,
  Input,
  input,
  OnInit,
  Optional,
  Renderer2,
  signal,
  SkipSelf,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlContainer,
  FormGroupDirective,
  ControlValueAccessor,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RadioOption } from '@shared/constants/inputs.const';
import { AppFormGroup } from 'form-global';
import { generateInputId } from 'frotsi';

@Component({
  selector: 'app-input-radio',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input-radio.component.html',
  styleUrl: '../../../../assets/styles/_inputs.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputRadioComponent),
      multi: true,
    },
  ],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class InputRadioComponent implements ControlValueAccessor, OnInit {
  formControlName = input('');
  required = input(false);
  label = input.required<string>();
  options = input.required<RadioOption[]>();

  public onChange = (_: any) => {};
  public onTouch = () => {};

  // this is the updated value that the class accesses
  @Input() set value(val) {
    // this value is updated by programmatic changes if( val !== undefined && this.val !== val){
    this._value = val;
    this.onChange(val);
    this.onTouch();
  }
  get value(): string {
    return this._value;
  }
  private _value = '';

  disabled = signal(false);

  id = signal('');

  public get formGroup(): AppFormGroup {
    return this.form.control as AppFormGroup;
  }

  public get getControl(): AbstractControl<any, any> | null | undefined {
    return this.form?.control?.get(this.formControlName());
  }

  protected get controlValue(): any {
    return this.getControl?.getRawValue();
  }

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    @Optional() @Host() @SkipSelf() private form: ControlContainer,
  ) {}

  ngOnInit(): void {
    if (this.getControl?.value) {
      this.value = this.getControl?.value;
    }

    this.id.set(generateInputId(this.label(), `${this.options.length}`));
  }

  // upon UI element value changes, this method gets triggered
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // upon touching the UI element, this method gets triggered
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  // this method sets the value programmatically
  writeValue(value: string): void {
    this.value = value;

    const el = (this._elementRef.nativeElement as HTMLElement).childNodes[0].childNodes[1];
    this._renderer.setProperty(el, 'value', value);
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);

    const el = (this._elementRef.nativeElement as HTMLElement).childNodes[0].childNodes[1];
    this._renderer.setProperty(el, 'disabled', disabled);
  }
}
