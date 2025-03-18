import _ from 'lodash';
import { FullAuthData } from '@shared/types/auth.type';
import { CurrentlyAssembledGame, CurrentlyPlayedGame, State } from './state.type';
import { computed, effect, Injectable, Injector, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';

export const DEFAULT_STATE: State = {
  authData: undefined,
  currentlyAssembledGame: undefined,
  currentlyPlayedGame: undefined,
};

@Injectable({
  providedIn: 'root',
})
export class AppStore implements OnDestroy {
  readonly state = {
    authData: signal(DEFAULT_STATE.authData, { equal: _.isEqual }),
    currentlyAssembledGame: signal(DEFAULT_STATE.currentlyAssembledGame, { equal: _.isEqual }),
    currentlyPlayedGame: signal(DEFAULT_STATE.currentlyPlayedGame, { equal: _.isEqual }),
  };

  // readonly state: Signal<State> = computed(() => {
  //   return {
  //     authData: this.state.authData(),
  //     currentlyAssembledGame: this.state.currentlyAssembledGame(),
  //     currentlyPlayedGame: this.state.currentlyPlayedGame(),
  //   };
  // });

  constructor(private injector: Injector) {
    // console.log(this.state.authData());
  }

  ngOnDestroy(): void {}

  updateAuth(data: FullAuthData): void {
    this.state.authData.set(data);
  }

  updateGameAssembled(data: CurrentlyAssembledGame): void {
    this.state.currentlyAssembledGame.set(data);
  }

  updateGamePlayed(data: CurrentlyPlayedGame): void {
    this.state.currentlyPlayedGame.set(data);
  }

  private handleAuthDataChange = effect(
    () => {
      const authData = this.state.authData();
      // console.log(`The auth data is: ${authData}`);
    },
    { injector: this.injector },
  );

  private handleLoggedStateChange = effect(
    () => {
      const logged = this.state.authData()?.appAccount?.logged;
      // console.log(`The loggedks state is: ${logged}`);
    },
    { injector: this.injector },
  );
}
