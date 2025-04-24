import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthRequest, User } from 'app/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminserviceService {
  private baseUrl = 'http://localhost:8092/employee';

  constructor(private http: HttpClient) {}

  // Get all users
  getAllUsers(): Observable<User[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    });
    return this.http.get<User[]>(`${this.baseUrl}/users`, { headers });
  }

  // Add a new user
  addUser(authRequest: AuthRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    });
    return this.http.post(`${this.baseUrl}/ajouteruser`, authRequest, { headers,responseType:'text' });
  }

  // Update an existing user
  updateUser(userId: number, authRequest: AuthRequest): Observable<User> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    });
    return this.http.put<User>(`${this.baseUrl}/${userId}/updateemployee`, authRequest, { headers });
  }

  // Delete a user
  deleteUser(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    });
    return this.http.delete(`${this.baseUrl}/deleteuser/${userId}`, { headers ,responseType: 'text'});
  }
}