import { ChangeDetectorRef, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs';
import { GamesService } from 'src/app/features/game/games.service';
import { BasicButtonComponent } from '@shared/components/basic-button/basic-button.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { AuthService } from 'src/app/features/user/auth.service';

@Component({
  selector: 'app-header',
  imports: [LogoComponent, CommonModule, BasicButtonComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly dialog = inject(MatDialog);

  get showPlayButon() {
    const isHome = this.router.url === '/';
    const isLobby = this.router.url.includes('lobby');
    return this.userName && !isHome && !isLobby;
  }

  get userName() {
    return this.auth.appAccount?.displayName;
  }
  constructor(
    public router: Router,
    public games: GamesService,
    public auth: AuthService,
    public cdr: ChangeDetectorRef,
  ) {}

  login() {
    this.auth.loginGoogle().pipe(first()).subscribe();
  }

  async logout() {
    await this.auth.logout();
  }

  goToLobby() {
    console.log(this.router.url);

    this.router.navigateByUrl('/lobby');
  }
}
