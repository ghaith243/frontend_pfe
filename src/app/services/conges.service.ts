import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CongesService {
  private apiUrl = 'http://localhost:8092'; // Assurez-vous que l'URL est correcte

  constructor(private http: HttpClient) {}

  submitCongeRequest(conge: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/conges/demande`, conge, { headers, responseType: 'text' });

  }

  getCongesByUtilisateur(utilisateurId: number, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/conges/utilisateur/${utilisateurId}`, { headers });
  }

  getCongesByService(serviceId: number, token: string): Observable<any> {
    if (!token) {
      return throwError(() => new Error('Token non fourni'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/conges/service/${serviceId}`, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des congés du service:', error);
        return throwError(() => new Error('Erreur lors de la récupération des congés du service.'));
      })
    );
  }
  updateCongeStatus(congeId: number, status: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { status }; // statut 'APPROUVE' ou 'REJETE'
    return this.http.put(`${this.apiUrl}/conges/${congeId}/status`, body, {  headers,responseType: 'text'});
  }
  
}