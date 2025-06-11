import {
  AfterViewInit,
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { DropdownOption, RadioOption } from '@shared/models/inputs.model';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GamesService } from 'src/app/features/game/games.service';
import { QUESTIONS_ARRAY } from '@shared/models/rounds-questions.model';

export const RoundsFormName = 'Rounds' as const;

@Component({
  selector: 'app-questions',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CdkDropList,
    CdkDrag,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class QuestionsComponent implements AfterViewInit, OnDestroy {
  @ViewChildren(MatSelect) selectEls?: QueryList<MatSelect>;
  formEditable = input<boolean>();
  private destroy$ = new Subject<void>();

  questionsList = QUESTIONS_ARRAY;
  questionsOptions: DropdownOption[] = QUESTIONS_ARRAY.map(({ _id, text }) => ({
    label: text,
    value: _id,
  }));

  chosenRoundsLimit = computed(() => this.games.newGameConfig.roundsAmountLimit);

  get gameRemoteUpdating() {
    return this.games.gameRemoteUpdating();
  }

  get formName() {
    return RoundsFormName;
  }

  get form() {
    return this.controlContainer.control?.get(this.formName) as FormArray;
  }

  get formControls() {
    return this.form.controls;
  }

  get parentForm() {
    return this.controlContainer.control as FormGroup;
  }

  constructor(
    private fb: FormBuilder,
    public games: GamesService,
    private controlContainer: FormGroupDirective,
  ) {}

  ngAfterViewInit(): void {
    // console.log(this.parentForm);
    // console.log(this.form);
    // console.log(this.selectEls);
    // const selectedIds = this.form.getRawValue();
    // const anySelected = selectedIds.some((item) => !!item);
    // const selectElements = this.selectEls;
    // if (selectElements && anySelected) {
    //   selectedIds.forEach((id, index) => {
    //     if (id) {
    //       const elem = selectElements.get(index);
    //       if (!elem) {
    //         return undefined;
    //       }
    //     }
    //   });
    // }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  drop(event: any) {
    const formVal = this.form.getRawValue();

    const itemA = formVal[event.previousIndex];
    const itemB = formVal[event.currentIndex];

    this.formControls[event.currentIndex].setValue(itemA);
    this.formControls[event.previousIndex].setValue(itemB);
  }

  compareFn(o1: string, o2: string) {
    if (!(!!o1 && !!o2)) {
      return false;
    }

    return o1 === o2;
  }

  // drop(event: any) {
  //   const formVal = this.form.getRawValue();

  //   const itemA = formVal[event.previousIndex]?.questionPremiseId;
  //   const itemB = formVal[event.currentIndex]?.questionPremiseId;

  //   this.formControls[event.currentIndex].patchValue({ questionPremiseId: itemA });
  //   this.formControls[event.previousIndex].patchValue({ questionPremiseId: itemB });
  // }
}
