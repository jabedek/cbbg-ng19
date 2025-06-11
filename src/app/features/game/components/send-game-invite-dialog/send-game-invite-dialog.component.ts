import { Component, inject, signal } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { BasicButtonComponent } from '@shared/components/basic-button/basic-button.component';
import { AppAccount } from '@shared/models/auth.model';
import { PlayerSeat } from '@shared/models/seats.model';
import { FriendsListComponent } from 'src/app/features/user/components/friends-list/friends-list.component';

export interface GameInviteDialogData {
  seat: PlayerSeat;
}

@Component({
  selector: 'app-send-game-invite-dialog',
  imports: [MatDialogContent, MatDialogActions, MatDialogClose, BasicButtonComponent, FriendsListComponent],
  templateUrl: './send-game-invite-dialog.component.html',
  styleUrl: './send-game-invite-dialog.component.scss',
})
export class SendGameInviteDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SendGameInviteDialogComponent>);
  readonly data = inject<GameInviteDialogData>(MAT_DIALOG_DATA);

  selectedFriend = signal<AppAccount | undefined>(undefined);

  handleCancel(): void {
    this.dialogRef.close();
  }
}
