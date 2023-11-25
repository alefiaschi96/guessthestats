import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericResponse } from '../models/genericResponse';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FutDbService {

  private apiUrl = 'https://futdb.app/api';

  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'X-AUTH-TOKEN': '04a0ffa2-7331-4e01-af05-b54386239fd3',
  });
  options = { headers: this.headers };

  constructor(private http: HttpClient) { }

  getPlayersList(page: number): Observable<GenericResponse> {
    const url = `${this.apiUrl}/players?page=${page}`;
    return this.http.get<GenericResponse>(url, this.options).pipe(
      catchError(this.handleError)
    );
  }

  getPlayerImage(playerId?: number): Observable<Blob> {
    const url = `${this.apiUrl}/players/${playerId}/image`;

    const options = {
      headers: new HttpHeaders({
        'Accept': 'image/png',
        'Content-Type': 'image/png',
        'X-AUTH-TOKEN': '04a0ffa2-7331-4e01-af05-b54386239fd3',
      }),
      responseType: 'blob' as 'json', // Specifica il tipo di risposta come blob
    };

    return this.http.get<Blob>(url, options).pipe(
      catchError(this.handleError)
    );
  }

  getPlayerNation(nationId?: number): Observable<Blob> {
    const url = `${this.apiUrl}/nations/${nationId}/image`;

    const options = {
      headers: new HttpHeaders({
        'Accept': 'image/png',
        'Content-Type': 'image/png',
        'X-AUTH-TOKEN': '04a0ffa2-7331-4e01-af05-b54386239fd3',
      }),
      responseType: 'blob' as 'json', // Specifica il tipo di risposta come blob
    };

    return this.http.get<Blob>(url, options).pipe(
      catchError(this.handleError)
    );
  }

  getClubImage(clubId?: number): Observable<Blob> {
    const url = `${this.apiUrl}/clubs/${clubId}/image`;

    const options = {
      headers: new HttpHeaders({
        'Accept': 'image/png',
        'Content-Type': 'image/png',
        'X-AUTH-TOKEN': '04a0ffa2-7331-4e01-af05-b54386239fd3',
      }),
      responseType: 'blob' as 'json', // Specifica il tipo di risposta come blob
    };

    return this.http.get<Blob>(url, options).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred', error);
    throw new Error('Something went wrong. Please try again later.');
  }
}
