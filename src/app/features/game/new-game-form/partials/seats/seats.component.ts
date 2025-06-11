import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, inject, input } from '@angular/core';
import { ControlContainer, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AreYouSureDialogComponent } from '@shared/components/are-you-sure-dialog/are-you-sure-dialog.component';
import { DevCommentComponent } from '@shared/dev/dev-comment/dev-comment.component';
import { AppAccount } from '@shared/models/auth.model';
import { Subject } from 'rxjs';
import { GamesService } from 'src/app/features/game/games.service';
import { AuthService } from 'src/app/features/user/auth.service';
import { SendGameInviteDialogComponent } from '../../../components/send-game-invite-dialog/send-game-invite-dialog.component';

@Component({
  selector: 'app-seats',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTooltipModule, DevCommentComponent],
  templateUrl: './seats.component.html',
  styleUrl: `./seats.component.scss`,
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class SeatsComponent implements AfterViewInit {
  formEditable = input<boolean>();
  private destroy$ = new Subject<void>();

  readonly dialog = inject(MatDialog);

  get currentUserId() {
    return this.auth.currentUserId;
  }

  get gameHasStarted() {
    return this.games.gameHasStarted;
  }

  get seatsEditable() {
    return !this.gameHasStarted && this.games.userIsHost;
  }

  get gameRemoteUpdating() {
    return this.games.gameRemoteUpdating();
  }

  get gameInSetup() {
    return this.games.gameStage === 'setup';
  }

  get seatsData() {
    return Object.values(this.games.newGameConfig.playersSeats);
  }

  constructor(
    public games: GamesService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    // effect(() => {
    //   this.form?.updateValueAndValidity({ emitEvent: false });
    //   this.form?.markAsUntouched({ emitEvent: false });
    // });
  }

  ngAfterViewInit(): void {
    // console.log(this.parentForm);
    // console.log(this.form);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  processSeatAccess(seatIndex: number, decision: 'close' | 'open') {
    const seat = { ...this.seatsData[seatIndex] };
    this.games.processSeatAccess(seat, decision);
    this.cdr.markForCheck();
  }

  processSeatInvitation(seatIndex: number) {
    const seat = { ...this.seatsData[seatIndex] };

    const dialogRef = this.dialog.open(SendGameInviteDialogComponent, { data: { seat } });
    dialogRef.afterClosed().subscribe(async (data: AppAccount) => {
      this.games.processSeatInvitation(seat, data);
      this.cdr.markForCheck();
    });
  }

  processSeatEmptying(seatIndex: number) {
    const seat = { ...this.seatsData[seatIndex] };

    const dialogRef = this.dialog.open(AreYouSureDialogComponent, { data: { mainTitle: 'Cancel game invitation' } });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.games.processSeatEmptying(seat);
        this.cdr.markForCheck();
      }
    });
  }
}
