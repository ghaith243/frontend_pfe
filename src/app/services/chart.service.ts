import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './authservice.service';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private apiUrl = 'http://localhost:8092/charts';

  constructor(private http: HttpClient, private authService: AuthService) {}
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin`, this.getHeaders()).pipe(
      catchError(error => {
        console.error('Erreur getAdminStats:', error);
        return of(null); // Retourne null en cas d'erreur
      })
    ).pipe(response => {
      console.log("Données reçues pour Admin:", response);
      return response; // Renvoie les données reçues
    });
  }
  getChefStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chef`, this.getHeaders()).pipe(
      catchError(error => {
        console.error('Erreur getChefStats:', error);
        return of(null);
      })
    ).pipe(response => {
      console.log("Données reçues pour Chef:", response);
      return response;
    });
  }
  
  getEmployeStats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/employe/${userId}`, this.getHeaders()).pipe(
      catchError(error => {
        console.error('Erreur getEmployeStats:', error);
        return of(null);
      })
    ).pipe(response => {
      console.log("Données reçues pour Employé:", response);
      return response;
    });
  }
  

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.authService.getToken()}`,
      }),
    };
  }
}
