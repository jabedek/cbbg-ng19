import { Component } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PopupComponent } from './components/popup/popup.component';
import { FooterComponent } from './components/footer/footer.component';
import { SeeDataComponent } from '../components/simple/see-data/see-data.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, HeaderComponent, PopupComponent, FooterComponent],
  template: `
    <app-header />
    <!-- <app-sidebar></app-sidebar> -->
    <div class="wrapper">
      <app-popup />
      <!-- <app-private-chat *ngIf="auth.authData" /> -->
      <!-- <app-see-data title="Layout" [data]="auth.authData" /> -->

      <router-outlet></router-outlet>
    </div>
    <app-footer />
  `,
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}
}
