import { Component, computed, DestroyRef, effect, inject, input, OnDestroy, OnInit, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@services/auth.service';
import { GamesLobbyService } from '@services/games/games-lobby.service';
import { GamesService } from '@services/games/games.service';
import { AppAccount } from '@shared/types/auth.type';
import { GameInvitation, PlayingSeat, TakenInfo } from '@shared/types/game.type';
import { generateDocumentId } from 'frotsi';
import { ReplaySubject, Subject, debounceTime, takeUntil } from 'rxjs';
import { SendGameInviteDialogComponent } from '../../dialogs/send-game-invite-dialog/send-game-invite-dialog.component';
import { KickFromGameDialogComponent } from '../../dialogs/kick-from-game-dialog/kick-from-game-dialog.component';
import { DEFAULT_SEATS } from '@shared/constants/games.const';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppFormArray, AppFormControl, AppFormGroup } from 'form-global';
import { filter } from 'lodash';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-game-lobby-seats',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTooltipModule],
  templateUrl: './game-lobby-seats.component.html',
  styleUrl: './game-lobby-seats.component.scss',
})
export class GameLobbySeatsComponents implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  seatsForm?: AppFormArray;
  invitations: (GameInvitation | undefined)[] = [];
  seatsChange = output<PlayingSeat[]>();

  currentlyCreatedGame = computed(() => this.gamesLobby.currentlyCreatedGame().data);

  readonly dialog = inject(MatDialog);

  get currentUserId() {
    return this.auth.appAccount()?._id;
  }

  get seats() {
    return this.currentlyCreatedGame()?.playersData.seats || DEFAULT_SEATS;
  }

  get gameHasStarted() {
    return this.gamesLobby.gameHasStarted();
  }

  get seatsCanBeModified() {
    return !this.gameHasStarted && this.gamesLobby.userIsHost();
  }

  get gameIsUpdatingRemotely() {
    return this.gamesLobby.gameIsUpdatingRemotely();
  }

  get gameInAssembly() {
    return this.gamesLobby.gameStage() === 'assembly';
  }

  seatsChange$ = new ReplaySubject<void>(1);

  constructor(
    public gamesLobby: GamesLobbyService,
    public auth: AuthService,
  ) {
    effect(() => {
      const inAssembly = this.gamesLobby.gameStage() === 'assembly';
      const userIsHost = this.gamesLobby.userIsHost();
      const gameIsUpdatingRemotely = this.gamesLobby.gameIsUpdatingRemotely();

      this.seatsForm?.updateValueAndValidity({ emitEvent: false });
      this.seatsForm?.markAsUntouched({ emitEvent: false });

      this.handleFormAccess(inAssembly, userIsHost, gameIsUpdatingRemotely);
    });
  }

  ngOnInit(): void {
    this.listenToSeatsChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  listenToSeatsChange() {
    this.seatsChange$
      .asObservable()
      .pipe(takeUntil(this.destroy$), debounceTime(500))
      .subscribe(() => this.seatsChange.emit([...this.seats]));
  }

  private handleFormAccess(inAssembly: boolean, userIsHost: boolean, gameIsUpdatingRemotely: boolean) {
    if ((inAssembly && userIsHost) || !inAssembly) {
      if (gameIsUpdatingRemotely) {
        this.seatsForm?.disable({ emitEvent: false });
      } else {
        this.seatsForm?.enable({ emitEvent: false });
      }
    } else {
      this.seatsForm?.disable({ emitEvent: false });
    }
  }

  processChangingAccessibility(seatIndex: number, decision: 'close' | 'open') {
    this.seats[seatIndex] = {
      ...this.seats[seatIndex],
      status: decision === 'close' ? 'closed' : 'opened-empty',
      takenInfo: null,
      invitationInfo: null,
    };

    this.seatsChange$.next();
  }

  /** Handle action "invite player" */
  processGameInvitation(seatIndex: number) {
    let seat = { ...this.seats[seatIndex] };

    const dialogRef = this.dialog.open(SendGameInviteDialogComponent, { data: { seat } });
    dialogRef.afterClosed().subscribe(async (data: AppAccount) => {
      const game = this.gamesLobby.currentlyCreatedGame().data;
      if (data && this.auth.appAccount()?._id && game && game._id) {
        const invitedOrSeated = await this.wasPlayerAlreadyInvitedOrSeated(data._id);

        if (invitedOrSeated) {
          // this.operationResult = 'User already has invitation or seat in this game.';
        }

        if (!invitedOrSeated) {
          const invitation: GameInvitation = {
            _id: generateDocumentId('ginv'),
            gameId: game?._id,
            seatIndex,
            sentTime: Date.now(),
            userId: data._id,
            userName: data.displayName,
            userEmail: data.email,
          };

          this.seats[seatIndex] = {
            ...seat,
            status: 'pending-invitation',
            takenInfo: null,
            invitationInfo: { ...invitation },
          };
        }
      }

      this.seatsChange$.next();
    });
  }

  /** Handle actions "kick player" / "revoke invitation" */
  processEmptying(seatIndex: number) {
    let seat = { ...this.seats[seatIndex] };

    const dialogRef = this.dialog.open(KickFromGameDialogComponent, { data: { seat } });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.seats[seatIndex] = {
          ...seat,
          status: 'opened-empty',
          takenInfo: null,
          invitationInfo: null,
        };
      }

      this.seatsChange$.next();
    });
  }

  private wasPlayerAlreadyInvitedOrSeated(playerId: string) {
    const game = this.gamesLobby.currentlyCreatedGame().data;

    const playerFound = !!game?.playersData.seats.find((seat) => {
      const userId = seat.invitationInfo?.userId || seat.takenInfo?.userId;
      return userId === playerId;
    });

    return playerFound;
  }
}
