import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://localhost:8092/employee';
  private profilePictureUrlSubject = new BehaviorSubject<string>('');
  profilePictureUrl$ = this.profilePictureUrlSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Met à jour l'URL de l'image de profil
  setProfilePictureUrl(url: string): void {
    this.profilePictureUrlSubject.next(url);
  }

  // Récupère l'URL actuelle de l'image de profil
  getProfilePictureUrl(): string {
    return this.profilePictureUrlSubject.value;
  }

  // Téléverse une nouvelle image de profil
  uploadProfilePicture(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${userId}/upload-profile-picture`, formData);
  }

  // Récupère l'image de profil depuis le serveur
  getProfilePicture(userId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${userId}/profile-picture`, { responseType: 'blob' });
  }
  updateEmployee(userId: number, updatedUser: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/updateemployee`, updatedUser);
}

}