import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  forwardRef,
  Host,
  input,
  Input,
  OnInit,
  Optional,
  Renderer2,
  signal,
  SkipSelf,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
  ReactiveFormsModule,
  ControlContainer,
  FormGroupDirective,
  AbstractControl,
} from '@angular/forms';
import { AttributesConfig } from '@shared/constants/inputs.const';
import { AppFormGroup } from 'form-global';
import { generateInputId } from 'frotsi';

@Component({
  selector: 'app-input-text',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input-text.component.html',
  styleUrl: '../../../../assets/styles/_inputs.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
  ],

  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class InputTextComponent implements ControlValueAccessor, OnInit {
  formControlName = input('');
  required = input(false);
  placeholder = input.required<string | number>();
  label = input('');
  type = input.required<string>();
  attributesConfig = input<AttributesConfig>({});

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
    this.id.set(generateInputId(this.label(), this.type()));
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
