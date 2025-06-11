import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BasicButtonComponent } from '@shared/components/basic-button/basic-button.component';
import { AuthService } from '../../user/auth.service';

@Component({
  selector: 'app-home',
  imports: [BasicButtonComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(
    public router: Router,
    // public gamesData: GamesDataService,
    public auth: AuthService,
    // public cdr: ChangeDetectorRef,
  ) {}
}
