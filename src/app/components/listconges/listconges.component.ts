import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CongesService } from '../../services/conges.service';
import { UserserviceService } from '../../services/userservice.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { trigger, style, transition, animate } from '@angular/animations'; // <<< ADD this
@Component({
  selector: 'app-listconges',
  templateUrl: './listconges.component.html',
  styleUrls: ['./listconges.component.scss'],
    imports: [FormsModule, CommonModule, FullCalendarModule],
    animations: [ // <<< ADD this
      trigger('fadeIn', [
        transition(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ])
    ],
})
export class ListcongesComponent   {
  userConges: any[] = [];
  utilisateurId: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

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
        this.showError('Erreur lors de la récupération des données utilisateur.');
        this.isLoading = false;
      }
    );
  }

  getConges(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.isLoading = true;
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
        this.showError('Erreur lors de la récupération des congés.');
        this.isLoading = false;
      }
    );
  }


  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }
}