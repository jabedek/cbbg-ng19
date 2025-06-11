import { Routes } from '@angular/router';
import { APP_SETTINGS } from './app.settings';
import { AuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { GameComponent } from './features/game/game.component';
import { gameGuard } from './features/game/game.guard';
import { GameResolver } from './features/game/game.resolve';
import { PlayComponent } from './features/game/views/play/play.component';
import { ReviewComponent } from './features/game/views/review/review.component';
import { SetupComponent } from './features/game/views/setup/setup.component';
import { SummaryComponent } from './features/game/views/summary/summary.component';
import { LayoutComponent } from './features/layout/layout.component';
import { LobbyComponent } from './features/lobby/lobby.component';
import { HomeComponent } from './features/simple-views/home/home.component';
import { NotFoundComponent } from './features/simple-views/not-found/not-found.component';
import { AccountComponent } from './features/user/views/account/account.component';

const redirectUnauthorizedToLanding = () => redirectUnauthorizedTo(['/']);

export function getRoutes(settings: APP_SETTINGS) {
  const routes: Routes = [
    {
      path: '',
      component: LayoutComponent,
      title: 'Start',

      children: [
        { path: '', pathMatch: 'full', component: HomeComponent, title: 'Home' },

        {
          path: 'account',
          canActivate: [() => (settings.USE_REAL_AUTH ? AuthGuard : undefined)],
          component: AccountComponent,
          title: 'Account',
        },
        {
          path: 'lobby',
          canActivate: [() => (settings.USE_REAL_AUTH ? AuthGuard : undefined)],
          component: LobbyComponent,
          title: 'Lobby',
        },
        {
          path: ':gameId',
          resolve: { game: GameResolver },
          component: GameComponent,
          canActivate: [() => (settings.USE_REAL_AUTH ? AuthGuard : undefined)],
          canActivateChild: [gameGuard],
          data: { authGuardPipe: redirectUnauthorizedToLanding },
          children: [
            {
              path: 'setup',
              component: SetupComponent,
              title: 'Game Setup',
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

        { path: '*', component: NotFoundComponent },
      ],
    },
  ];

  return routes;
}
