import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GamesService } from 'src/app/features/game/games.service';
import { SeeDataComponent } from '@shared/dev/see-data/see-data.component';
import { AuthService } from './features/user/auth.service';
@Component({
  selector: 'app-root',
  imports: [
    RouterModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    SeeDataComponent,
  ],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  title = 'cbbg-client';

  @ViewChild('select') select?: ElementRef;

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public games: GamesService,
  ) {}

  ngAfterViewInit(): void {
    // const sel = this.select?.nativeElement as HTMLSelectElement;
    // sel.click();
    console.log();
  }

  close(event: any) {
    console.log(event);
    event.preventDefault();
  }

  compareFn(c1: any, c2: any): boolean {
    if (c1 && c2) {
      return c1.id || c2.id ? c1.id === c2.id : c1 === c2;
    }

    return false;
  }
}
