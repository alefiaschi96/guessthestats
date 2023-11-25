import { Component } from '@angular/core';
import { FutDbService } from '../services/fut-db.service';
import { Player } from '../models/player';
import { BehaviorSubject, Observable, Subject, Subscription, catchError, map, of, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent {

  private subscription: Subscription; // Sottoscrizione per gestire l'observable.
  playersList$: Observable<Player[]> | undefined; // Observable per la lista dei giocatori.
  currentPlayer: Player | undefined; // Giocatore corrente.
  page: number = 1; // Numero di pagina per il recupero dei giocatori.
  isReady: boolean = false; // Flag che indica se il componente è pronto.

  // Costruttore del componente con iniezione dei servizi necessari.
  constructor(
    private playerService: FutDbService,
    private stateService: StateService,
  ) {
    this.subscription = new Subscription(); // Inizializza la sottoscrizione.
  }

  // Metodo chiamato durante l'inizializzazione del componente.
  ngOnInit() {
    this.subscribeToIsReady(); // Sottoscrive il componente allo stato di prontezza.
    this.fetchPlayersList(); // Recupera la lista dei giocatori.
  }

  // Sottoscrive il componente allo stato di prontezza.
  private subscribeToIsReady() {
    this.stateService.isReady$.subscribe((isReady) => {
      this.isReady = isReady; // Aggiorna lo stato di prontezza.
    });
  }

  // Recupera la lista dei giocatori dalla sorgente dati.
  private fetchPlayersList() {
    const getPlayersList$ = this.playerService.getPlayersList(this.page); // Ottiene l'observable per la lista dei giocatori.

    // Gestisce la risposta dall'observable.
    this.subscription.add(
      getPlayersList$.subscribe({
        next: (response) => {
          this.handlePlayersListResponse(response); // Gestisce la risposta per la lista dei giocatori.
        },
        error: (error) => {
          console.error('Errore durante il recupero della lista dei giocatori:', error); // Gestisce gli errori durante il recupero della lista dei giocatori.
        },
      })
    );
  }

  // Gestisce la risposta per la lista dei giocatori.
  private handlePlayersListResponse(response: any) {
    const desiredField = response.items; // Estrae il campo desiderato dalla risposta.
    this.playersList$ = of(desiredField); // Crea un observable per la lista dei giocatori.
    this.stateService.setPlayersList(desiredField); // Aggiorna lo stato con la lista dei giocatori.

    if (desiredField.length > 0) {
      this.currentPlayer = desiredField[0]; // Imposta il primo giocatore come giocatore corrente.
      this.stateService.setCurrentPlayer(this.currentPlayer!); // Aggiorna lo stato con il giocatore corrente.
      console.log('Lista dei giocatori:', desiredField); // Log della lista dei giocatori.
    } else {
      console.warn('La lista dei giocatori è vuota.'); // Avviso se la lista dei giocatori è vuota.
    }
  }

  // Passa al giocatore successivo nella lista.
  nextPlayer(): void {
    this.stateService.playersList$.pipe(take(1)).subscribe(playersList => {
      this.updatePlayerByIndex(1, playersList); // Aggiorna il giocatore corrente aumentando l'indice.
    });
  }

  // Passa al giocatore precedente nella lista.
  previousPlayer(): void {
    this.stateService.playersList$.pipe(take(1)).subscribe(playersList => {
      this.updatePlayerByIndex(-1, playersList); // Aggiorna il giocatore corrente diminuendo l'indice.
    });
  }

  // Aggiorna il giocatore corrente in base all'indice specificato.
  private updatePlayerByIndex(indexChange: number, playersList: Player[]): void {
    const currentIndex = playersList.indexOf(this.currentPlayer!); // Ottiene l'indice del giocatore corrente.
    const newIndex = (currentIndex + indexChange + playersList.length) % playersList.length; // Calcola il nuovo indice.
    this.currentPlayer = playersList[newIndex]; // Imposta il nuovo giocatore corrente.
    this.stateService.setCurrentPlayer(this.currentPlayer); // Aggiorna lo stato con il nuovo giocatore corrente.
  }

  // Metodo chiamato durante la distruzione del componente.
  ngOnDestroy() {
    this.subscription.unsubscribe(); // Disiscrive la sottoscrizione.
  }
}