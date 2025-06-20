import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { signalTransformBoolean } from '@shared/utils/common.util';

@Component({
  selector: 'app-basic-button',
  imports: [CommonModule],
  templateUrl: './basic-button.component.html',
  styleUrl: './basic-button.component.scss',

  host: {
    role: 'button',
    '[tabIndex]': 'disabled ? -1 : 0',
  },
})
export class BasicButtonComponent {
  sizeVariant = input<'small' | 'normal'>('normal');
  disabled = input(false, { transform: signalTransformBoolean });
  label = input('');
  colorCode = input('var(--app_orange)');
  borderColor = input('#fff');
  clicked = output<void>();

  get fontSize() {
    const variant = this.sizeVariant();

    if (variant === 'normal') {
      return '1.1rem';
    }

    if (variant === 'small') {
      return '0.96rem';
    }

    return '';
  }
}
