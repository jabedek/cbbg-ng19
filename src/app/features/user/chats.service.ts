import { Injectable, OnDestroy } from '@angular/core';
import { query, or, where, getDocs } from '@angular/fire/firestore';
import { tryCatch } from '@shared/utils/dev.util';
import { Subject } from 'rxjs';
import { FirebaseDataService } from '../firebase/firebase-data.service';
import { AuthService } from './auth.service';
import { StandardTalk } from '@shared/models/chat.model';
import { UsersService } from './users.service';

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

    const [querySnapshot] = await tryCatch(getDocs(queryRef));
    if (!querySnapshot) {
      return undefined;
    }

    const docs: StandardTalk[] = [];
    querySnapshot.forEach((doc: any) => docs.push(doc.data() as StandardTalk));

    return docs[0];
  }
}
