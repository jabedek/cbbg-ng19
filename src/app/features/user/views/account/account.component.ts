import { Component } from '@angular/core';
import { FriendsListComponent } from '../../components/friends-list/friends-list.component';

@Component({
  selector: 'app-account',
  imports: [FriendsListComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {}
