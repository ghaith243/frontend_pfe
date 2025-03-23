import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
 
  private apiUrl = 'http://localhost:8092'; // Remplacez par l'URL de votre backend

  constructor(private http: HttpClient) {}

  // Méthode pour se connecter
  login(credentials: { email: string; motDePasse: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        // Stocker le rôle dans le localStorage après la connexion
        if (response && response.role) {
          localStorage.setItem('user', JSON.stringify(response)); // Sauvegarder toutes les données utilisateur, y compris le rôle
        }
      })
    );
  }
  

  // Méthode pour récupérer les données de l'utilisateur
  getEmployeeData(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/employee/me`, { headers });
  }
  getUserRole(): string {
    const userData = localStorage.getItem('user'); 
    if (userData) {
      const user = JSON.parse(userData);
      return user.role || '';  // Retourne le rôle de l'utilisateur
    }
    return ''; // Rôle par défaut si non trouvé
  }
    // Récupérer l'ID de l'utilisateur connecté
    getUserId(): number | null {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || null; // Retourne l'ID de l'utilisateur
      }
      return null;
    }
  

  // Méthode pour récupérer le token depuis localStorage
  getToken(): string {
    return localStorage.getItem('authToken') || ''; // Assurez-vous que le token est stocké
  }
}
