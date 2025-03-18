import { Injectable, OnDestroy } from '@angular/core';
import { Unsubscribe } from '@angular/fire/auth';
import { AppAccount } from '@shared/types/auth.type';
import { Subject } from 'rxjs';
import { FirebaseDataService } from 'src/app/firebase/firebase-data.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private firebaseData: FirebaseDataService) {
    this.listenToLoggedUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async getUserById(id: string): Promise<AppAccount | undefined> {
    return this.firebaseData.readOneBy<AppAccount>('users', { key: '_id', value: id });
  }

  async getUserByEmail(email: string): Promise<AppAccount | undefined> {
    return this.firebaseData.readOneBy<AppAccount>('users', { key: 'email', value: email });
  }

  async getUsersByIds(ids: string[]): Promise<AppAccount[]> {
    return this.firebaseData.readManyBy<AppAccount>('users', {
      key: '_id',
      values: ids,
    });
  }

  private listenToLoggedUsers() {
    const readDetails = { key: 'logged', values: [true] };

    this.firebaseData.listenToChangesSnapshots<AppAccount>(
      readDetails,
      'users',
      (data: AppAccount[] | undefined, unsub: Unsubscribe | undefined) => {
        if (data && unsub) {
          this.firebaseData.addFirebaseListener('LoggedUsers', unsub);
        }
      },
    );
  }
}
