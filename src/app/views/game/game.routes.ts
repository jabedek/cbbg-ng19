import { Routes } from '@angular/router';
import { AuthGuard } from '@shared/guards/auth.guard';
import { AssemblyComponent } from './assembly/assembly.component';
import { PlayComponent } from './play/play.component';
import { SummaryComponent } from './summary/summary.component';
import { ReviewComponent } from './review/review.component';
import { GameComponent } from './game.component';

export const gameRoutes: Routes = [
  {
    canActivateChild: [AuthGuard],
    path: ':gameId',
    title: 'Game',
    component: GameComponent,
    children: [
      {
        path: 'assembly',
        component: AssemblyComponent,
      },
      {
        path: 'play',
        component: PlayComponent,
      },
      {
        path: 'review',
        component: ReviewComponent,
      },
      {
        path: 'summary',
        component: SummaryComponent,
      },
    ],
  },
];
