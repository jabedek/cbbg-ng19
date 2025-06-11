import { Component, inject, input, model, OnDestroy, OnInit, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from 'src/app/features/user/users.service';
import { AppAccount } from '@shared/models/auth.model';
import { OperationDisplay } from '@shared/models/common.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GamesService } from 'src/app/features/game/games.service';
import { OperationDisplayComponent } from '@shared/components/operation-display/operation-display.component';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-friends-list',
  imports: [OperationDisplayComponent, MatTooltipModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.scss',
})
export class FriendsListComponent implements OnInit, OnDestroy {
  private interval?: NodeJS.Timeout;
  readonly dialog = inject(MatDialog);
  gameInvitationMode = input(false);
  selectedFriend = model<AppAccount | undefined>(undefined);

  searchTerm: string = '';
  filteredFriends: AppAccount[] = [];
  // friends: ContentListItem<AppAccount>[] = [];
  // received: ContentListItem<FriendInvitation>[] = [];
  // sent: ContentListItem<FriendInvitation>[] = [];

  friendEmail = '';

  get operationDisplay(): OperationDisplay {
    return { status: 'none' };
    return this.games.operationDisplay();
  }

  constructor(
    public games: GamesService,
    private users: UsersService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    // this.keepUpdatingFriendsData();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
