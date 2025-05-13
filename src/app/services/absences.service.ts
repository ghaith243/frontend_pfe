// src/app/services/absence.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface AbsenceRequest {
  employeId: number;
  motif: string;
  justifiee: boolean;
}

export interface Absence {
  id: number;
  date: string;
  motif: string;
  justifiee: boolean;
  employe: any;
  chef: any;
}
@Injectable({ providedIn: 'root' })
export class AbsencesService {
  private apiUrl = 'http://localhost:8092/api/absences';

  constructor(private http: HttpClient) {}

 
  marquerAbsence(request: AbsenceRequest): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/marquer`, request, { headers });
  }

  getAbsencesByEmploye(employeId: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`http://localhost:8092/api/absences/employe/${employeId}`, { headers });
  }
  getAbsencesByAL(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`http://localhost:8092/api/absences/all`, { headers });
  }
}
