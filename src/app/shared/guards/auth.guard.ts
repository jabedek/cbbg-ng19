import { effect, inject, Injectable, signal } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  MaybeAsync,
  GuardResult,
  Router,
  CanActivateChild,
} from '@angular/router';
import { AuthService } from '@services/auth.service';
import { AppAccount, FullAuthData } from '@shared/types/auth.type';
import { StorageItem } from '@shared/types/storage-items.enum';
import { LocalStorage } from 'frotsi';
import { from, lastValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private auth = inject(AuthService);
  // private fullAuth = signal<FullAuthData | undefined>(undefined);
  // private authEffect = effect(() => this.fullAuth.set(this.auth.authData()));

  constructor(private router: Router) {}

  async getAuth() {
    const p1: AppAccount | null | undefined = await new Promise((res, rej) =>
      setTimeout(() => res(this.auth.authData()?.appAccount), 500),
    );

    const p2: AppAccount | null | undefined = await this.auth
      .tryLoginWithLocalStorageData()
      .then(() => this.auth.authData()?.appAccount);

    const acc = p1 || p2;

    if (!acc) {
      this.router.navigateByUrl('/');
      return false;
    } else {
      return true;
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    LocalStorage.setItem(StorageItem.REDIRECT_TO_AFTER, state.url);
    return this.getAuth();
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.canActivate(childRoute, state);
  }
}
