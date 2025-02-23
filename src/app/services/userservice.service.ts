import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserserviceService {
  private apiUrl = 'http://localhost:8092'; // Remplacez par l'URL de votre backend

  constructor(private http: HttpClient) {}

  // Méthode pour se connecter
 
  // Méthode pour récupérer les données de l'utilisateur
  getEmployeeData(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/employee/me`, { headers });
  }

}
