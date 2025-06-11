import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { OperationDisplay } from '@shared/models/common.model';

@Component({
  selector: 'app-operation-display',
  imports: [CommonModule, FormsModule, MatProgressBar],
  templateUrl: './operation-display.component.html',
  styleUrl: './operation-display.component.scss',
})
export class OperationDisplayComponent {
  operationDisplay = input.required<OperationDisplay>();
}
