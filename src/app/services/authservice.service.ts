import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Route, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
 
  private apiUrl = 'http://localhost:8092'; // Remplacez par l'URL de votre backend

  constructor(private http: HttpClient, private router: Router) {}

  // Méthode pour se connecter
  login(credentials: { email: string; motDePasse: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        console.log("Réponse du backend:", response); // Vérifie si l'ID est présent
  
        if (response && response.role && response.id) {
          localStorage.setItem('user', JSON.stringify(response));
        } else {
          console.error("Réponse invalide : ID manquant !");
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
    return userData ? JSON.parse(userData).role || '' : '';
  }

  getUserId(): number {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id && !isNaN(user.id) ? user.id : 0;
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        return 0;
      }
    }
    return 0;
  }
  

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
