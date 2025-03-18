import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <h1
      class="text-app_yellow drop-shadow-logo_text_shadow cursor-pointer text-center font-[Signika_Negative] text-3xl font-semibold select-none"
      [routerLink]="'/'">
      CBBG
    </h1>
  `,
})
export class LogoComponent {}
