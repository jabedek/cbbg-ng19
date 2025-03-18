import { ChangeDetectorRef, Component, computed, inject, input, signal } from '@angular/core';
import { LogoComponent } from '../../../components/simple/logo/logo.component';
import { Router, RouterLink } from '@angular/router';
import { BurgerMenuComponent } from '../../../components/simple/burger-menu/burger-menu.component';
import { CommonModule } from '@angular/common';
import { OutclickDirective } from '@shared/directives/outclick.directive';
import { AuthService } from '@services/auth.service';
import { GamesService } from '@services/games/games.service';
import { MatDialog } from '@angular/material/dialog';
import { BasicButtonComponent } from '../../../components/simple/basic-button/basic-button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [
    LogoComponent,
    RouterLink,
    BurgerMenuComponent,
    CommonModule,
    OutclickDirective,
    BasicButtonComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  burgerOpen = signal(false);

  readonly dialog = inject(MatDialog);

  userName = computed(() => this.auth.appAccount()?.displayName || '');

  constructor(
    public router: Router,
    public games: GamesService,
    public auth: AuthService,
  ) {}

  login() {
    this.auth.handleLoginButton();
  }

  logout() {
    this.auth.handleLogoutButton();
  }
}
