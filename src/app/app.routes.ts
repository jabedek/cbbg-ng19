import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from '@shared/guards/auth.guard';
import { AccountComponent } from './views/account/account.component';
import { HomeComponent } from './views/home/home.component';
import { LobbyComponent } from './views/lobby/lobby.component';
import { NotFoundComponent } from './views/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    title: 'Start',
    children: [
      { path: '', pathMatch: 'full', component: HomeComponent },
      {
        path: 'account',
        canActivate: [AuthGuard],
        component: AccountComponent,
      },
      {
        path: 'lobby',
        canActivate: [AuthGuard],
        component: LobbyComponent,
      },
      {
        path: 'game',
        canActivate: [AuthGuard],
        loadChildren: () => import('./views/game/game.routes').then((m) => m.gameRoutes),
      },
      { path: '*', component: NotFoundComponent },
    ],
  },
];
