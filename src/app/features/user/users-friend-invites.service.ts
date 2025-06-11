import { Injectable, OnDestroy } from '@angular/core';
import { query, or, where, getDocs, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { FriendInvitation } from '@shared/models/user.model';
import { consoleError, tryCatch } from '@shared/utils/dev.util';
import { catchError, EMPTY, from, of, Subject, switchMap } from 'rxjs';
import { UsersService } from './users.service';
import { GameInvitation } from '@shared/models/seats.model';
import { FirebaseDataService, DbResultDTO } from '../firebase/firebase-data.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersFriendInvitesService implements OnDestroy {
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

  /** Friends Invitations */
  async createFriendInvitation(invitation: FriendInvitation) {
    return this.firebaseData
      .insertData('friend_invitations', invitation._id, invitation)
      .catch((e) => console.error('[createFriendInvitation]', e));
  }

  async updateFriendInvitation(invitation: FriendInvitation) {
    return this.firebaseData
      .updateData('friend_invitations', invitation._id, invitation)
      .then(() => true)
      .catch((e) => console.error('[updateFriendInvitation]', e));
  }

  async deleteFriendInvitation(invitationId: string) {
    return this.firebaseData
      .deleteData('friend_invitations', invitationId)
      .then(() => true)
      .catch((e) => console.error('[deleteFriendInvitation]', e));
  }

  async getFriendInvitation(invitationId: string) {
    return this.firebaseData.readOneBy<FriendInvitation>('friend_invitations', {
      key: '_id',
      value: invitationId,
    });
  }

  /** Get active invitations that player have received */
  private async getPlayerFriendInvitationsReceived(playerId: string) {
    return this.firebaseData.filterManyBy<FriendInvitation>('friend_invitations', [
      { key: 'receiverPlayerId', condition: '==', value: playerId },
    ]);
  }

  /** Get active invitations that player have sent */
  private async getPlayerFriendInvitationsSent(playerId: string) {
    return this.firebaseData.filterManyBy<FriendInvitation>('friend_invitations', [
      { key: 'senderPlayerId', condition: '==', value: playerId },
    ]);
  }

  async checkIfInvitationAlreadyExists(senderId: string, receiverId: string) {
    const colRef = this.firebaseData.specialColRef('friend_invitations');
    const queryRef = query(
      colRef,
      or(
        where('senderPlayerId', 'in', [senderId, receiverId]),
        where('receiverPlayerId', 'in', [senderId, receiverId]),
      ),
    );

    const [querySnapshot] = await tryCatch(getDocs(queryRef));
    if (!querySnapshot) {
      return undefined;
    }

    const docs: DbResultDTO[] = [];
    querySnapshot.forEach((doc: any) => docs.push(doc.data() as DbResultDTO));

    return docs.filter((doc) => !!doc.active);
  }

  async befriendTwoUsers(userIdA: string, userIdB: string) {
    return Promise.allSettled([
      this.firebaseData.updateData('users', userIdA, { 'appData.friendsData.contacts': arrayUnion(userIdB) }),
      this.firebaseData.updateData('users', userIdB, { 'appData.friendsData.contacts': arrayUnion(userIdA) }),
    ]);
  }

  async splitTwoUsers(userIdA: string, userIdB: string) {
    return Promise.allSettled([
      this.firebaseData.updateData('users', userIdA, {
        'appData.friendsData.contacts': arrayRemove(userIdB),
      }),
      this.firebaseData.updateData('users', userIdB, {
        'appData.friendsData.contacts': arrayRemove(userIdA),
      }),
    ]);
  }

  async getFriendsData() {
    const appAccount = this.auth.appAccount;

    if (!appAccount) {
      return;
    }

    const invitesReceived = await this.getPlayerFriendInvitationsReceived(appAccount._id);
    const invitesSent = await this.getPlayerFriendInvitationsSent(appAccount._id);
    const friendsData = await this.users.getUsersByIds(
      appAccount.appData.friendsData.contacts.map((con) => (typeof con === 'string' ? con : con.userId)),
    );

    return { invitesReceived, invitesSent, friendsData };
  }

  /** Game Invitations */
  sendGameInvitation(invitation: GameInvitation) {
    if (!invitation?.userId) {
      return undefined;
    }

    return from(
      tryCatch(
        this.firebaseData.updateData('users', invitation.userId, { 'appData.gameInvitations': arrayUnion(invitation) }),
      ),
    ).pipe(catchError((error) => of(error)));
  }
}
