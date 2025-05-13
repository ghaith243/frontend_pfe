import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarOptions } from '@fullcalendar/core';
import { CongesService } from 'app/services/conges.service';
import { UserserviceService } from 'app/services/userservice.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Interface pour typer les congés
interface Conge {
  id: number;
  dateDebut: string;
  dateFin: string;
  status: string;
  type: string;
  motif: string;
  [key: string]: any; // Pour les autres propriétés potentielles
}

@Component({
  selector: 'app-calendrier',
  imports: [FormsModule, CommonModule, FullCalendarModule,RouterModule],
  templateUrl: './calendrier.component.html',
  styleUrl: './calendrier.component.scss',
  standalone: true
})
export class CalendrierComponent implements OnInit {
  userConges: Conge[] = []; // Utilisation de l'interface Conge
  utilisateurId: number = 0;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Couleurs Arabsoft
  arabsoftColors = {
    blue: '#0052B4',
    orange: '#F39C12',
    gray: '#6C757D',
    lightBlue: '#3498DB',
    lightOrange: '#FFB74D'
  };

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: 'fr',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventClassNames: this.handleEventClassNames.bind(this),
    height: 'auto',
    firstDay: 1, // Lundi comme premier jour de la semaine
    dayMaxEvents: true, // Permet d'afficher "plus" pour les jours avec beaucoup d'événements
    weekends: true, // Affiche les week-ends
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    }
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
    this.errorMessage = null;
    
    this.userservice.getEmployeeData(token).subscribe(
      (data) => {
        this.utilisateurId = data.id;
        this.getConges();
      },
      (error) => {
        console.error('Erreur lors de la récupération des données utilisateur', error);
        this.errorMessage = 'Impossible de récupérer vos informations. Veuillez réessayer.';
        this.isLoading = false;
      }
    );
  }

  getConges(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.congeservice.getCongesByUtilisateur(this.utilisateurId, token).subscribe(
      (data: Conge[]) => { // Typage explicite de la réponse
        this.userConges = data;
        this.updateCalendarEvents();
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors de la récupération des congés', error);
        this.errorMessage = 'Impossible de récupérer vos congés. Veuillez réessayer.';
        this.isLoading = false;
      }
    );
  }

  updateCalendarEvents(): void {
    const events = this.userConges.map(conge => {
      // Déterminer la couleur en fonction du statut
      let color;
      const status = conge['status'];
      
      switch (status) {
        case 'APPROUVE':
          color = '#4CAF50'; // Vert
          break;
        case 'REJETE':
          color = '#FF5252'; // Rouge
          break;
        case 'EN_ATTENTE':
          color = this.arabsoftColors.blue; // Bleu Arabsoft
          break;
        default:
          color = this.arabsoftColors.gray; // Gris par défaut
      }

      // Vérifier si le congé est en cours
      const now = new Date();
      const startDate = new Date(conge['dateDebut']);
      const endDate = new Date(conge['dateFin']);
      if (status === 'APPROUVE' && now >= startDate && now <= endDate) {
        color = this.arabsoftColors.orange; // Orange pour les congés en cours
      }

      return {
        id: conge['id'].toString(),
        title: `${conge['type']} - ${conge['motif']}`,
        start: conge['dateDebut'],
        end: conge['dateFin'],
        color: color,
        extendedProps: {
          status: status,
          type: conge['type'],
          motif: conge['motif']
        }
      };
    });

    // Mettre à jour le calendrier
    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  handleEventClick(info: any): void {
    // Afficher les détails du congé sélectionné
    const congeId = parseInt(info.event.id);
    // Rediriger vers la page de détails du congé ou afficher un modal
    console.log('Congé sélectionné:', congeId);
    // this.router.navigate(['/conges', congeId]);
  }

  handleEventClassNames(info: any): string[] {
    const classes = [];
    
    // Ajouter une classe en fonction du statut
    if (info.event.extendedProps) {
      const status = info.event.extendedProps['status'];
      if (status) {
        switch (status) {
          case 'APPROUVE':
            classes.push('status-approved');
            break;
          case 'REJETE':
            classes.push('status-rejected');
            break;
          case 'EN_ATTENTE':
            classes.push('status-pending');
            break;
        }
      }
    }
    
    // Vérifier si le congé est en cours
    const now = new Date();
    const startDate = new Date(info.event.start);
    const endDate = info.event.end ? new Date(info.event.end) : startDate;
    
    if (info.event.extendedProps && 
        info.event.extendedProps['status'] === 'APPROUVE' && 
        now >= startDate && now <= endDate) {
      classes.push('status-in-progress');
    }
    
    return classes;
  }

  refreshCalendar(): void {
    this.isLoading = true;
    this.getConges();
  }

  getCongesByStatus(status: string): Conge[] {
    return this.userConges.filter(conge => conge['status'] === status);
  }
}