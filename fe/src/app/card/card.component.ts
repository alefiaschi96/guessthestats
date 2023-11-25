import { Component, Input, SimpleChanges } from '@angular/core';
import { Player } from '../models/player';
import { FutDbService } from '../services/fut-db.service';
import { Observable, Subject, Subscription, forkJoin, map, mergeMap, of, shareReplay, takeUntil, tap } from 'rxjs';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})// Questa classe rappresenta il componente della carta del giocatore.
export class CardComponent {
  player: Player | undefined; // Informazioni sul giocatore corrente.
  private subscription: Subscription; // Sottoscrizione per gestire l'observable.
  cardPath: string | undefined; // Percorso dell'immagine della carta.
  playerName: string | undefined; // Nome del giocatore.
  playerImage$: Observable<string> | undefined; // Observable per l'immagine del giocatore.
  nationImage$: Observable<string> | undefined; // Observable per l'immagine della nazione.
  clubImage$: Observable<string> | undefined; // Observable per l'immagine del club.
  isReady: boolean = false; // Flag che indica se il componente è pronto.
  private unsubscribe$ = new Subject<void>(); // Subject per gestire la disiscrizione agli observables.

  // Costruttore del componente con iniezione dei servizi necessari.
  constructor(
    private service: FutDbService,
    private stateService: StateService
  ) {
    this.subscription = new Subscription(); // Inizializza la sottoscrizione.
  }

  // Metodo chiamato durante l'inizializzazione del componente.
  ngOnInit() {
    this.initPlayerSubscription(); // Inizializza la sottoscrizione al giocatore corrente.
    this.initStateSubscription(); // Inizializza la sottoscrizione allo stato di prontezza.
  }

  // Inizializza la sottoscrizione alle informazioni sul giocatore corrente.
  private initPlayerSubscription() {
    this.stateService.currentPlayer$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((player) => {
        this.player = player;
        if (this.player) {
          this.getImages(this.player); // Ottiene le immagini associate al giocatore.
        }
      });
  }

  // Inizializza la sottoscrizione allo stato di prontezza.
  private initStateSubscription() {
    this.stateService.isReady$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isReady) => {
        this.isReady = isReady; // Aggiorna lo stato di prontezza.
      });
  }

  // Ottiene le immagini associate al giocatore.
  private getImages(player: Player): void {
    console.log(player)
    this.stateService.setIsReady(false); // Imposta lo stato di prontezza a false.

    // Determina il percorso dell'immagine della carta in base alla rarità del giocatore.
    this.cardPath = player.rarity === 12 ? "./../../assets/svg/icon-card.svg" : "./../../assets/svg/gold-card.svg";
    this.playerName = this.getPlayerNameFormatted(player); // Ottiene il nome formattato del giocatore.

    // if (!player.playerImage || !player.nationImage || !player.clubImage) {

    //   if (!this.playerImage$) {
    //     const getPlayerImage$ = this.getImageObservable(this.service.getPlayerImage(player.id)).subscribe((playerImageUrl) => {
    //       this.playerImage$ = this.createImageObservable(playerImageUrl); // Crea l'observable per l'immagine del giocatore.
    //       this.player!.playerImage = this.playerImage$;
    //     });
    //   }
    //   this.stateService.updatePlayer(player)
    //   this.stateService.setIsReady(true); // Imposta lo stato di prontezza a true.
    // }
    // else {
    //   this.playerImage$ = player.playerImage;
    // }

    // Ottiene gli observables per le immagini del giocatore, della nazione e del club.
    const getPlayerImage$ = this.getImageObservable(this.service.getPlayerImage(player.id));
    const getNationImage$ = this.getImageObservable(this.service.getPlayerNation(player.nation));
    const getClubImage$ = this.getImageObservable(this.service.getClubImage(player.club));

    // Combina gli observables e gestisce il risultato.
    this.subscription.add(
      forkJoin([getPlayerImage$, getNationImage$, getClubImage$]).subscribe(([playerImageUrl, nationImageUrl, clubImageUrl]) => {
        this.playerImage$ = this.createImageObservable(playerImageUrl); // Crea l'observable per l'immagine del giocatore.
        this.nationImage$ = this.createImageObservable(nationImageUrl); // Crea l'observable per l'immagine della nazione.
        this.clubImage$ = this.createImageObservable(clubImageUrl); // Crea l'observable per l'immagine del club.
        this.player!.playerImage = this.playerImage$;
        this.player!.nationImage = this.nationImage$;
        this.player!.clubImage = this.clubImage$;
        this.stateService.setIsReady(true); // Imposta lo stato di prontezza a true.
        this.stateService.updatePlayer(player)
      })
    );
  }

  // Formatta il nome del giocatore.
  private getPlayerNameFormatted(player: Player): string {
    return player?.lastName?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
  }

  // Ottiene un observable per l'URL dell'immagine.
  private getImageObservable(observable: Observable<Blob>): Observable<string> {
    return observable.pipe(
      map((data: Blob) => URL.createObjectURL(data))
    );
  }

  // Crea un observable per l'URL dell'immagine con cache.
  private createImageObservable(imageUrl: string): Observable<string> {
    return of(imageUrl).pipe(shareReplay(1));
  }

  // Disiscrive l'observable dell'immagine.
  private unsubscribeImage(image$: Observable<string> | null): void {
    if (image$) {
      image$.subscribe((url) => URL.revokeObjectURL(url));
    }
  }

  // Metodo chiamato durante la distruzione del componente.
  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Invia un segnale di disiscrizione agli observables.
    this.unsubscribe$.complete(); // Completa il processo di disiscrizione.
    this.subscription.unsubscribe(); // Disiscrive la sottoscrizione principale.

    // Disiscrive gli observables delle immagini.
    this.unsubscribeImage(this.playerImage$!);
    this.unsubscribeImage(this.nationImage$!);
    this.unsubscribeImage(this.clubImage$!);
  }
}