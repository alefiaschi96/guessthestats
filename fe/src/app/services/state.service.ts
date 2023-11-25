import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private playersListSubject = new BehaviorSubject<Player[]>([]);
  playersList$ = this.playersListSubject.asObservable();

  private currentPlayerSubject = new BehaviorSubject<Player | any>(null);
  currentPlayer$ = this.currentPlayerSubject.asObservable();

  private isReadySubject = new BehaviorSubject<boolean | any>(null);
  isReady$ = this.isReadySubject.asObservable();

  setPlayersList(playersList: Player[]) {
    this.playersListSubject.next(playersList);
  }

  setCurrentPlayer(player: Player) {
    this.currentPlayerSubject.next(player);
  }

  setIsReady(isReady: boolean) {
    this.isReadySubject.next(isReady);
  }

  updatePlayer(player: Player) {
    // Aggiorna la lista dei giocatori nello stato.
    const updatedPlayersList = this.playersListSubject.value.map((p) => {
      if (p.id === player.id) {
        return player;
      }
      return p;
    });
    this.setPlayersList(updatedPlayersList);
  }
}
