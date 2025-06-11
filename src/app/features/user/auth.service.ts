import { inject, Injectable, OnDestroy } from '@angular/core';
import { GoogleAuthProvider, User, signInWithPopup, signOut } from 'firebase/auth';
import { generateDocumentId } from 'frotsi';
import { Router } from '@angular/router';
import { FirebaseCoreService } from '../firebase/firebase-core';
import { AppAccount } from '@shared/models/auth.model';
import { catchError, defer, EMPTY, of, Subject, takeUntil, tap } from 'rxjs';
import { FirebaseDataService } from '../firebase/firebase-data.service';
import { consoleError, tryCatch } from '@shared/utils/dev.util';
import { generateUserDisplayName } from '@shared/utils/user.util';
import { authState, idToken, user } from '@angular/fire/auth';
import { MOCK_main_user } from '@shared/utils/mockups';
import { SETTINGS } from 'src/app/app.settings';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  settings = inject(SETTINGS);
  private destroy$ = new Subject<void>();
  private firebaseCore = inject(FirebaseCoreService);
  fireAuthService = this.firebaseCore.__firebaseAuth;

  authState$ = authState(this.fireAuthService).pipe(tap((authState) => this.provideAppAccount(authState)));
  appAccount?: AppAccount;

  get currentUserId() {
    return this.appAccount?._id;
  }

  constructor(
    private router: Router,
    private firebaseData: FirebaseDataService,
  ) {
    if (this.settings.USE_REAL_AUTH) {
      this.authState$.pipe(takeUntil(this.destroy$)).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * After successfull Firebase Account authentication,
   * create and/or get App Account data.
   * After that, complete further login process.
   */
  private async provideAppAccount(firebaseUser: User | null) {
    if (!firebaseUser) {
      return;
    }

    const email = firebaseUser.email;
    const uid = firebaseUser.uid;
    const displayName = firebaseUser?.displayName || email?.split('@')[0];

    if (email) {
      // 1. Check if App Account already exists
      let account: AppAccount | undefined | void = await this.getAppAccountByEmail(email);

      if (!account) {
        consoleError('', '[AuthService#provideAppAccount]', '<Check if acc already exists>');
      }

      if (account) {
        this.appAccount = account;
      } else {
        // 2. If not - create it
        const [_unused1, createResultError] = await tryCatch(this.createAppAccount(uid, email, displayName));

        if (createResultError) {
          consoleError(createResultError, '[AuthService#provideAppAccount]', '<Creating new acc>');
        }

        // 2.1. Check if successfully created
        if (!createResultError) {
          const accountNew: AppAccount | undefined | void = await this.getAppAccountByEmail(email);

          if (!accountNew) {
            consoleError('', '[AuthService#provideAppAccount]', '<New acc created>');
          }

          if (accountNew) {
            this.appAccount = accountNew;
          }
        }
      }
      if (this.appAccount) {
        this.router.navigateByUrl('/lobby');
      }
    } else {
      return undefined;
    }
  }

  private async getAppAccountByEmail(firebaseUserEmail: string) {
    return this.firebaseData
      .readOneBy<AppAccount>('users', {
        key: 'email',
        value: firebaseUserEmail,
      })
      .catch((error) => console.error('Nie znaleziono konta.', error));
  }

  private async createAppAccount(googleUid: string, email: string, displayName = '') {
    if (!displayName) {
      displayName = generateUserDisplayName(email);
    }
    const _id = generateDocumentId('user');
    const newAppAccount: AppAccount = {
      _id,
      googleUid,
      email,
      displayName,
      active: true,
      logged: true,
      appData: {
        activeGameId: null,
        friendsData: {
          contacts: [],
          invitesReceived: [],
          invitesSent: [],
        },
        gamesInvites: [],
        chatData: {
          openTalksIds: [],
          lastTenContactedFriendsIds: [],
        },
      },
    };

    return this.firebaseData
      .insertData('users', _id, newAppAccount)
      .catch((error) => console.error('Nie udało się utworzyć konta.', error));
  }

  async logout() {
    if (this.settings.USE_REAL_AUTH) {
      const appAccId = this.currentUserId;

      if (appAccId) {
        signOut(this.firebaseCore.__firebaseAuth).then(() =>
          this.firebaseData.updateData('users', appAccId, { logged: false }).then(() => {
            this.appAccount = undefined;
            this.router.navigateByUrl('/');
          }),
        );
      }
    } else {
      this.appAccount = undefined;
      this.router.navigateByUrl('/');
    }
  }

  loginGoogle() {
    if (this.settings.USE_REAL_AUTH) {
      const auth = this.firebaseCore.__firebaseAuth;
      const provider = this.firebaseCore.__googleProvider; // from @angular/fire/auth
      const res = () => signInWithPopup(auth, provider);
      return defer(res).pipe(
        catchError((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);

          // ...
          return of([errorCode, errorMessage, email]);
        }),
      );
    } else {
      this.router.navigateByUrl('/');
      this.appAccount = MOCK_main_user;
      return EMPTY.pipe(tap(() => {}));
    }
  }
}
