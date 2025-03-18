import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-burger-menu',
  imports: [CommonModule],
  template: `
    <div class="burger" (click)="toggle()" (keydown.escape)="close()">
      <div class="burger__line" [ngClass]="{ open: burgerOpen() }"></div>
      <div class="burger__line" [ngClass]="{ open: burgerOpen() }"></div>
      <div class="burger__line" [ngClass]="{ open: burgerOpen() }"></div>
    </div>
  `,
  styleUrl: './burger-menu.component.scss',
})
export class BurgerMenuComponent {
  burgerOpen = model(false);

  open() {
    this.burgerOpen.set(true);
  }

  toggle(): void {
    this.burgerOpen.update((val) => !val);
  }

  close(): void {
    this.burgerOpen.set(false);
  }
}
