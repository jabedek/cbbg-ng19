import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, input, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ControlContainer,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatLabel } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { RoundLengthsOptions } from '@shared/models/rounds-questions.model';
import { GamesService } from 'src/app/features/game/games.service';

export const BasicsFormName = 'Basics' as const;

@Component({
  selector: 'app-basics',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatLabel,
    MatRadioModule,
  ],
  templateUrl: './basics.component.html',
  styleUrl: './basics.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class BasicsComponent implements AfterViewInit, OnDestroy {
  formEditable = input<boolean>();
  private destroy$ = new Subject<void>();
  protected RoundLengthsOptions = RoundLengthsOptions;

  get formName() {
    return BasicsFormName;
  }

  get form() {
    return this.controlContainer.control?.get(this.formName) as FormGroup;
  }

  get parentForm() {
    return this.controlContainer.control as FormGroup;
  }

  constructor(
    public games: GamesService,
    private controlContainer: FormGroupDirective,
  ) {}

  ngAfterViewInit(): void {
    // console.log(this.parentForm);
    // console.log(this.form);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
