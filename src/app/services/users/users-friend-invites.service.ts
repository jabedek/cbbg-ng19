import { Injectable, OnDestroy } from '@angular/core';
import { query, or, where, getDocs, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { AuthService } from '@services/auth.service';
import { FriendInvitation } from '@shared/types/game.type';
import { tryCatch } from '@shared/utils/dev.util';
import { Subject } from 'rxjs';
import { FirebaseDataService, DbDTO } from 'src/app/firebase/firebase-data.service';
import { UsersService } from './users.service';

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

    const [querySnapshot] = await tryCatch(getDocs(queryRef), true);
    if (!querySnapshot) {
      return undefined;
    }

    const docs: DbDTO[] = [];
    querySnapshot.forEach((doc) => docs.push(doc.data() as DbDTO));

    return docs.filter((doc) => !!doc.active);
  }

  async befriendTwoUsers(userIdA: string, userIdB: string) {
    return Promise.allSettled([
      this.firebaseData.updateData('users', userIdA, { 'appData.friendsIds': arrayUnion(userIdB) }),
      this.firebaseData.updateData('users', userIdB, { 'appData.friendsIds': arrayUnion(userIdA) }),
    ]);
  }

  async splitTwoUsers(userIdA: string, userIdB: string) {
    return Promise.allSettled([
      this.firebaseData.updateData('users', userIdA, {
        'appData.friendsIds': arrayRemove(userIdB),
      }),
      this.firebaseData.updateData('users', userIdB, {
        'appData.friendsIds': arrayRemove(userIdA),
      }),
    ]);
  }

  async getFriendsData() {
    const appAccount = this.auth.authData?.appAccount;

    if (!appAccount) {
      return;
    }

    const invitesReceived = await this.getPlayerFriendInvitationsReceived(appAccount._id);
    const invitesSent = await this.getPlayerFriendInvitationsSent(appAccount._id);
    const friendsData = await this.users.getUsersByIds(appAccount.appData.friendsIds);

    return { invitesReceived, invitesSent, friendsData };
  }
}
