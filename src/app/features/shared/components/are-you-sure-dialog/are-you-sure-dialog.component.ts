import { Component, inject } from '@angular/core';
import {
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { BasicButtonComponent } from '../basic-button/basic-button.component';

export interface AreYouSureDialogData {
  mainTitle: string;
  mainQuestion?: string;
}

@Component({
  selector: 'app-are-you-sure-dialog',
  imports: [MatDialogContent, MatDialogActions, MatDialogClose, BasicButtonComponent],
  templateUrl: './are-you-sure-dialog.component.html',
  styleUrl: './are-you-sure-dialog.component.scss',
})
export class AreYouSureDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AreYouSureDialogComponent>);
  readonly data = inject<AreYouSureDialogData>(MAT_DIALOG_DATA);

  handleCancel(): void {
    this.dialogRef.close();
  }
}
