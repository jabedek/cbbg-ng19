import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { GamesService } from 'src/app/features/game/games.service';
import {
  GameRound,
  getRoundsArrayByAmount,
  QUESTIONS_ARRAY,
  RoundLengthsOptions,
  RoundsLimits,
} from '@shared/models/rounds-questions.model';
import { Game, GameStage } from '@shared/models/game.model';
import { MatRadioModule } from '@angular/material/radio';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';
import {
  DefaultSeatsArray,
  GameInvitation,
  PlayerSeat,
  wasPlayerAlreadyInvitedOrSeated,
} from '@shared/models/seats.model';
import { roundsQuestionsCheck, seatsCheck } from '@shared/validators/validators';
import { DropdownOption } from '@shared/models/inputs.model';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { AppAccount } from '@shared/models/auth.model';
import { generateDocumentId } from 'frotsi';
import { AreYouSureDialogComponent } from '@shared/components/are-you-sure-dialog/are-you-sure-dialog.component';
import { BasicButtonComponent } from '@shared/components/basic-button/basic-button.component';
import { OperationDisplayComponent } from '@shared/components/operation-display/operation-display.component';
import { DevCommentComponent } from '@shared/dev/dev-comment/dev-comment.component';
import { SeeDataComponent } from '@shared/dev/see-data/see-data.component';
import { AuthService } from 'src/app/features/user/auth.service';
import { Games2Service } from '../../games-2.service';
import { SendGameInviteDialogComponent } from '../send-game-invite-dialog/send-game-invite-dialog.component';

export const InitGameForm = new FormGroup({
  // auto
  _id: new FormControl<string | null>(null),
  _createdAt: new FormControl<number>(-1),
  gameStage: new FormControl<GameStage>('init'),
  roundNumber: new FormControl<number>(-1),
  playerCreatorId: new FormControl<string | null>(null),
  playersHostsIds: new FormControl<string[]>([]),

  // basics
  gameName: new FormControl<string>(''),
  gamePassword: new FormControl<string>(''),
  roundLengthMS: new FormControl<number>(RoundLengthsOptions[1].value),
  roundsAmountLimit: new FormControl<number>(RoundsLimits[0], [
    Validators.min(RoundsLimits[0]),
    Validators.max(RoundsLimits[RoundsLimits.length - 1]),
  ]),

  // rounds & questions
  roundsEntries: new FormControl<GameRound[]>(getRoundsArrayByAmount(RoundsLimits[0])),

  // players & seats
  playersSeats: new FormControl<PlayerSeat[]>(DefaultSeatsArray),
});

export function getInitGameFormRaw() {
  return InitGameForm.getRawValue();
}

export type GameFormRaw = ReturnType<typeof getInitGameFormRaw>;

@Component({
  selector: 'app-new-game-form-2',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkDropList,
    CdkDrag,
    OperationDisplayComponent,
    BasicButtonComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatLabel,
    MatRadioModule,
    SeeDataComponent,
    DevCommentComponent,
  ],
  templateUrl: './new-game-form-2.component.html',
  styleUrl: './new-game-form-2.component.scss',
})
export class NewGameForm2Component implements AfterViewInit, OnDestroy {
  @ViewChildren(MatSelect) selectEls?: QueryList<MatSelect>;
  private destroy$ = new Subject<void>();
  protected readonly dialog = inject(MatDialog);

  protected roundsLimits = RoundsLimits;
  protected roundLengthsOptions = RoundLengthsOptions;
  protected questionsOptions: DropdownOption[] = QUESTIONS_ARRAY.map(({ _id, text }) => ({
    label: text,
    value: _id,
  }));

  protected gameForm = InitGameForm;

  protected get createContext() {
    return this.games2.createContext;
  }

  protected get operationDisplay() {
    return this.games2.operationDisplay;
  }

  // get gameStage() {
  //   return this.gameForm.getRawValue().gameStage;
  // }

  // get gameHasStarted() {
  //   const gameStage = this.gameStage;
  //   if (!gameStage) {
  //     return undefined;
  //   }

  //   return !['init', 'setup'].includes(gameStage);
  // }

  // get gameInSetup() {
  //   return this.gameStage === 'setup';
  // }

  // get seatsEditable() {
  //   return !this.gameHasStarted && this.userIsHost;
  // }

  // get hostPlayerId() {
  //   if (!this.gameForm.getRawValue()._id) {
  //     return undefined;
  //   }
  //   const hostsIds = this.gameForm.getRawValue()?.playersHostsIds || [];
  //   return hostsIds[hostsIds.length - 1];
  // }

  // get currentUserId() {
  //   return this.auth.currentUserId;
  // }

  // get userIsHost() {
  //   return this.currentUserId === this.hostPlayerId;
  // }

  // /** Game can't be started & User must be host */
  // formEditable = computed(() => Boolean(!this.gameHasStarted && this.userIsHost));

  get roundsFormInfo() {
    const control = this.gameForm.get('roundsEntries') as FormControl;
    const value: GameRound[] = control?.getRawValue();
    const valid = roundsQuestionsCheck(value);
    return { control, value, valid };
  }

  get seatsFormInfo() {
    const control = this.gameForm.get('playersSeats') as FormControl;
    const value: PlayerSeat[] = control?.getRawValue();
    const valid = seatsCheck(value);
    return { control, value, valid };
  }

  constructor(
    public gamesOLD: GamesService,
    public games2: Games2Service,
    private auth: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.games2.newGameModel$.pipe(takeUntil(this.destroy$)).subscribe((val: Game) => {
      // this.gameForm = transformModelToForm(val);
      this.gameForm.setValue(val, { emitEvent: false });
    });

    this.listenFormChanges();
  }

  ngAfterViewInit(): void {
    // console.log(this.parentForm);
    // console.log(this.form);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenFormChanges() {
    this.gameForm.valueChanges
      .pipe(
        // tap((val) => console.log(val)),
        takeUntil(this.destroy$),
        debounceTime(2000),
      )
      .subscribe((value) => {
        const prevEntries = [...(value.roundsEntries || getRoundsArrayByAmount(RoundsLimits[0]))];

        const prevRoundsAmount = prevEntries?.length;
        const newRoundsAmount = value.roundsAmountLimit || RoundsLimits[0];

        if (newRoundsAmount < RoundsLimits[0] || newRoundsAmount > RoundsLimits[RoundsLimits.length - 1]) {
          return;
        } else {
          const diff = prevRoundsAmount - newRoundsAmount;

          let newEntries = [...prevEntries];

          if (diff < 0) {
            const toAdd = -diff;
            for (let i = 0; i < toAdd; i++) {
              newEntries.push({
                roundNumber: newEntries.length,
                phase: 'idle',
                playersInputs: [],
                questionPremiseId: null,
              });
            }
          }

          if (diff > 0) {
            newEntries = newEntries.toSpliced(diff);
          }

          this.roundsFormInfo.control?.setValue(newEntries, { emitEvent: false, emitModelToViewChange: false });

          this.cdr.markForCheck();
        }
      });
  }

  roundDrop(event: any) {
    const formVal = this.roundsFormInfo.value;
    const sourceItemPremise = formVal[event.previousIndex].questionPremiseId;
    const targetItemPremise = formVal[event.currentIndex].questionPremiseId;

    const newFormVal = [...formVal];
    newFormVal[event.previousIndex].questionPremiseId = targetItemPremise;
    newFormVal[event.currentIndex].questionPremiseId = sourceItemPremise;

    this.roundsFormInfo.control?.setValue(newFormVal);

    const selects = this.selectEls?.toArray();
    if (selects) {
      selects[event.previousIndex].value = targetItemPremise;
      selects[event.currentIndex].value = sourceItemPremise;
    }

    this.cdr.markForCheck();
  }

  roundCompareFn(o1: string, o2: string) {
    if (!(!!o1 && !!o2)) {
      return false;
    }

    return o1 === o2;
  }

  roundSelected(event: MatSelectChange, round: GameRound, index: number) {
    round.questionPremiseId = event.value;
  }

  processSeatInvitation(seatIndex: number) {
    const seat = { ...this.seatsFormInfo.value[seatIndex] };

    const dialogRef = this.dialog.open(SendGameInviteDialogComponent, { data: { seat } });
    dialogRef.afterClosed().subscribe(async (invitedUser: AppAccount) => {
      const gameId = this.gameForm.get('_id')?.getRawValue();
      const playersSeats: PlayerSeat[] = this.seatsFormInfo.value;

      const invitedOrSeated = wasPlayerAlreadyInvitedOrSeated(invitedUser._id, seat, gameId, playersSeats);
      if (invitedOrSeated) {
        this.operationDisplay.set({
          status: 'error',
          message: 'User already has invitation or seat in this game.',
        });

        return undefined;
      }

      if (!invitedOrSeated) {
        const invitation: GameInvitation = {
          _id: generateDocumentId('ginv'),
          gameId: gameId,
          seatIndex: seat.index,
          userId: invitedUser._id,
          userName: invitedUser.displayName,
        };

        const updatedSeat: PlayerSeat = {
          ...seat,
          status: 'pending-invitation',
          takenInfo: null,
          invitationInfo: { ...invitation },
        };

        playersSeats[updatedSeat.index] = updatedSeat;
        this.seatsFormInfo.control?.setValue(playersSeats);

        this.games2.processSeatInvitation(this.gameForm.getRawValue(), invitation);
      }
    });
  }

  processSeatEmptying(seatIndex: number) {
    const seat = { ...this.seatsFormInfo.value[seatIndex] };

    const dialogRef = this.dialog.open(AreYouSureDialogComponent, { data: { mainTitle: 'Cancel game invitation' } });
    dialogRef.afterClosed().subscribe(async (result) => {
      const playersSeats: PlayerSeat[] = this.seatsFormInfo.value;

      if (result) {
        const updatedSeat: PlayerSeat = {
          ...seat,
          status: 'opened-empty',
          invitationInfo: {
            _id: null,
            seatIndex: seat.index,
            gameId: null,
            userId: null,
            userName: null,
          },
          takenInfo: {
            userId: null,
            userName: null,
          },
        };

        playersSeats[updatedSeat.index] = updatedSeat;
        this.seatsFormInfo.control?.setValue(playersSeats);
        this.games2.processSeatEmptying(this.gameForm.getRawValue());
      }
    });
  }

  processSeatAccess(seatIndex: number, decision: 'close' | 'open') {
    const seat = { ...this.seatsFormInfo.value[seatIndex] };
    const playersSeats: PlayerSeat[] = this.gameForm.get('playersSeats')?.getRawValue();

    const updatedSeat: PlayerSeat = {
      ...seat,
      status: decision === 'close' ? 'closed' : 'opened-empty',
      takenInfo: null,
      invitationInfo: null,
    };

    playersSeats[updatedSeat.index] = updatedSeat;
    this.seatsFormInfo.control?.setValue(playersSeats);
    this.games2.processSeatAccess(this.gameForm.getRawValue());
  }
}
