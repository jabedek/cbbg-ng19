import { Injectable, OnDestroy } from '@angular/core';
import { query, or, where, getDocs } from '@angular/fire/firestore';
import { StandardTalk } from '@shared/types/chat.type';
import { tryCatch } from '@shared/utils/dev.util';
import { Subject } from 'rxjs';
import { FirebaseDataService } from '../firebase/firebase-data.service';
import { AuthService } from './auth.service';
import { UsersService } from './users/users.service';

@Injectable({
  providedIn: 'root',
})
export class ChatsService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private firebaseData: FirebaseDataService,
    private users: UsersService,
    private auth: AuthService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async checkAndGetExistingTalkStandard(membersIds: [string, string]) {
    const colRef = this.firebaseData.specialColRef('chat_priv_st');
    const queryRef = query(colRef, or(where('membersIds', 'array-contains', membersIds)));

    const [querySnapshot] = await tryCatch(getDocs(queryRef), true);
    if (!querySnapshot) {
      return undefined;
    }

    const docs: StandardTalk[] = [];
    querySnapshot.forEach((doc) => docs.push(doc.data() as StandardTalk));

    return docs[0];
  }
}
