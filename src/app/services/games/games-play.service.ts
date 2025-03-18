import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GamesPlayService {
  constructor() {}

  makeMove(gameId: string, moveData: any): Observable<any> {
    return {} as any;
  }

  getGameState(gameId: string): Observable<any> {
    return {} as any;
  }

  endGame(gameId: string): Observable<void> {
    return {} as any;
  }
}
