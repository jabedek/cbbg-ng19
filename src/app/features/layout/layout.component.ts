import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../user/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <div class="wrapper">
      <!-- <app-popup /> -->

      <router-outlet></router-outlet>
    </div>
    <!-- <app-footer /> -->
  `,
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}
}
