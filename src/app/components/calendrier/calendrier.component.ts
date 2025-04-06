import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarOptions } from '@fullcalendar/core';
import { CongesService } from 'app/services/conges.service';
import { UserserviceService } from 'app/services/userservice.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendrier',
  imports: [FormsModule, CommonModule, FullCalendarModule],
  templateUrl: './calendrier.component.html',
  styleUrl: './calendrier.component.scss'
})
export class CalendrierComponent {
  userConges: any[] = [];
  utilisateurId: number = 0;
  isLoading: boolean = false;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    locale: 'fr',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: []
  };

  constructor(
    private userservice: UserserviceService,
    private router: Router,
    private congeservice: CongesService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.userservice.getEmployeeData(token).subscribe(
      (data) => {
        this.utilisateurId = data.id;
        this.getConges();
      },
      (error) => {
        console.error('Erreur lors de la récupération des données utilisateur', error);
        this.isLoading = false;
      }
    );
  }

  getConges(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.congeservice.getCongesByUtilisateur(this.utilisateurId, token).subscribe(
      (data) => {
        this.userConges = data;
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.userConges.map(conge => ({
            title: conge.type + ' - ' + conge.motif,
            start: conge.dateDebut,
            end: conge.dateFin,
            color: conge.status === 'APPROUVE' ? 'green' : 'red'
          }))
        };
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors de la récupération des congés', error);
        this.isLoading = false;
      }
    );
  }
}

