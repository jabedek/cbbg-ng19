import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { GoogleAuthProvider, Unsubscribe, User, signInWithCredential, signInWithPopup, signOut } from 'firebase/auth';
import { LocalStorage, generateDocumentId } from 'frotsi';
import { Router } from '@angular/router';
import { FirebaseCoreService } from '../firebase/firebase-core';
import { StorageItem } from '@shared/types/storage-items.enum';
import { AppAccount, FullAuthData } from '@shared/types/auth.type';
import { BehaviorSubject, filter, Subject, takeUntil, tap } from 'rxjs';
import { FirebaseDataService } from '../firebase/firebase-data.service';
import { consoleError, tryCatch } from '@shared/utils/dev.util';
import { generateUserDisplayName } from '@shared/utils/user.util';
import { AppStore } from '../store/store';

const AuthDataDefault = {
  firebaseAccount: undefined,
  appAccount: undefined,
  appData: undefined,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private firebaseCore = inject(FirebaseCoreService);
  private firebaseAuthUnsub?: Unsubscribe;

  // private store = inject(AppStore);

  private _authData = signal<FullAuthData>(AuthDataDefault);

  authData = computed(() => this._authData());

  appAccount = computed(() => this._authData()?.appAccount);

  currentUserId = computed(() => this.appAccount()?._id);

  // get authData(): FullAuthData {
  //   return this._authData;
  // }

  // private authData_ = new BehaviorSubject<FullAuthData>(AuthDataDefault);
  // authData$ = this.authData_.asObservable().pipe(
  //   takeUntil(this.destroy$),
  //   tap((data) => (this._authData = data)),
  // );

  // authDataReady$ = this.authData_.asObservable().pipe(
  //   takeUntil(this.destroy$),
  //   filter((data) => !!data?.appAccount),
  // );

  constructor(
    private router: Router,
    // private invites: InvitationsService,
    private firebaseData: FirebaseDataService,
  ) {
    // this.authData$.subscribe();
    this.listenToFirebaseAuth();
    this.tryLoginWithLocalStorageData();

    // console.log(generateUserDisplayName('dyplomowa.app@gmail.com'));
    // consoleError('Treść', '[AuthService#provideUserData]', '<Check if acc already exists>');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.firebaseAuthUnsub) {
      this.firebaseAuthUnsub();
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
        friendsIds: [],
        chatInfo: {
          openTalksIds: [],
          lastTenContactedFriendsIds: [],
        },
      },
    };

    return this.firebaseData
      .insertData('users', _id, newAppAccount)
      .catch((error) => console.error('Nie udało się utworzyć konta.', error));
  }

  private async listenToFirebaseAuth() {
    if (this.firebaseAuthUnsub) {
      this.firebaseAuthUnsub();
    }

    this.firebaseAuthUnsub = this.firebaseCore.__firebaseAuth.onAuthStateChanged(async (user: User | null) => {
      if (user) {
        this.provideUserData(user);
      } else {
        this._authData.update((authData) => ({
          ...authData,
          firebaseAccount: { ...authData?.firebaseAccount, user },
        }));

        this.router.navigate(['/']);
      }
    });
  }

  /**
   * After successfull Firebase Account authentication,
   * create and/or get App Account data.
   * After that, complete further login process.
   */
  private async provideUserData(firebaseUser: User) {
    const email = firebaseUser.email;
    const uid = firebaseUser.uid;
    const displayName = firebaseUser?.displayName || email?.split('@')[0];

    if (email) {
      let account: AppAccount | undefined;
      // 1. Check if App Account already exists
      const [getResult, getResultError] = await tryCatch(this.getAppAccountByEmail(email));

      if (getResultError) {
        consoleError(getResultError, '[AuthService#provideUserData]', '<Check if acc already exists>');
      }

      if (getResult) {
        account = getResult;
      } else {
        // 2. If not - create it
        const [_unused1, createResultError] = await tryCatch(this.createAppAccount(uid, email, displayName));

        if (createResultError) {
          consoleError(createResultError, '[AuthService#provideUserData]', '<Creating new acc>');
        }

        // 2.1. Check if successfully created
        if (!createResultError) {
          const [retryResult, retryResultError] = await tryCatch(this.getAppAccountByEmail(email));

          if (retryResultError) {
            consoleError(retryResultError, '[AuthService#provideUserData]', '<New acc created>');
          }

          if (retryResult) {
            account = retryResult;
          }
        }
      }

      // 3. load app account data to cache and update 'logged' state in database
      if (account) {
        this.firebaseData.updateData('users', account._id, { logged: true }).then(() => {
          this._authData.update((authData) => ({
            ...authData,
            appAccount: { ...account, logged: true },
          }));

          const redirectToAfter = LocalStorage.getItem(StorageItem.REDIRECT_TO_AFTER);

          if (redirectToAfter) {
            this.router.navigate([redirectToAfter]);
            LocalStorage.removeItem(StorageItem.REDIRECT_TO_AFTER);
          } else {
            this.router.navigate(['/account']);
          }
        });
      }
    } else {
      return undefined;
    }
  }

  async tryLoginWithLocalStorageData() {
    const accessToken = LocalStorage.getItem(StorageItem.ACCESS_TOKEN);
    const idToken = LocalStorage.getItem(StorageItem.ID_TOKEN);

    if (typeof idToken === 'string' && typeof accessToken === 'string') {
      signInWithCredential(this.firebaseCore.__firebaseAuth, GoogleAuthProvider.credential(idToken, accessToken))
        .then(() => {
          this._authData.update((authData) => ({
            ...authData,
            firebaseAccount: { ...authData?.firebaseAccount, accessToken, idToken },
          }));
        })
        .catch((err) => {
          this._authData.set(AuthDataDefault);
          consoleError(err, '[AuthService#tryLoginWithLocalStorageData]', '<signInWithCredential>');
          LocalStorage.removeItem(StorageItem.ACCESS_TOKEN);
          LocalStorage.removeItem(StorageItem.ID_TOKEN);
          LocalStorage.removeItem(StorageItem.USER);
        });
    }
  }

  async forceRefreshAppAccount() {
    const email = this.appAccount()?.email;

    if (!email) {
      return undefined;
    }

    return tryCatch(this.getAppAccountByEmail(email)).then(([getResult, getResultError]) => {
      if (getResult) {
        this._authData.update((authData) => ({
          ...authData,
          appAccount: getResult,
        }));
      }
    });
  }

  async handleLoginButton() {
    signInWithPopup(this.firebaseCore.__firebaseAuth, this.firebaseCore.__googleProvider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;
        const idToken = credential?.idToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
        LocalStorage.setItem(StorageItem.ACCESS_TOKEN, accessToken);
        LocalStorage.setItem(StorageItem.ID_TOKEN, idToken);
        LocalStorage.setItem(StorageItem.USER, user);

        this._authData.update((authData) => ({
          ...authData,
          firebaseAccount: { credential, accessToken, idToken, user },
        }));
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  async handleLogoutButton() {
    const appAccId = this.appAccount()?._id;

    if (appAccId) {
      signOut(this.firebaseCore.__firebaseAuth).then(() =>
        this.firebaseData.updateData('users', appAccId, { logged: false }).then(() => {
          LocalStorage.removeItem(StorageItem.ACCESS_TOKEN);
          LocalStorage.removeItem(StorageItem.ID_TOKEN);
          LocalStorage.removeItem(StorageItem.USER);

          this._authData.update((authData) => ({
            appAccount: undefined,
            firebaseAccount: undefined,
          }));
        }),
      );
    }
  }

  async updateAppAccount(key: string, value: string) {
    const appAccount = this.appAccount();
    if (appAccount) {
      return this.firebaseData.updateData('users', appAccount._id, { [key]: value }).then(() => {
        this._authData.update((authData) => ({
          ...authData,
          appAccount: { ...appAccount, displayName: value },
        }));
      });
    }
  }
}
