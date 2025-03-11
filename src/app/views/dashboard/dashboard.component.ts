import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CongesService } from '../../services/conges.service';
import { UserserviceService } from '../../services/userservice.service';
import { NotificationsService } from 'app/services/notifications.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, FullCalendarModule]
})
export class DashboardComponent implements OnInit {
  user: any = {};
  userConges: any[] = [];
  serviceConges: any[] = [];
  filteredConges: any[] = [];
  notifications: string[] = [];
  conge = {
    dateDebut: '',
    dateFin: '',
    motif: '',
    type: ''
  };
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
  utilisateurId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  role: string = '';
  serviceId: number = 0;
  isLoading: boolean = false;
  selectedStatus: string = 'TOUS';

  constructor(
    private userservice: UserserviceService,
    private router: Router,
    private congeservice: CongesService,
    private notificationService: NotificationsService
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
        console.log('Données utilisateur reçues:', data);
        this.user = data;
        this.role = data.role;
        this.utilisateurId = data.id;
        this.serviceId = data.serviceId;
  
        // Stocker l'ID de l'utilisateur pour la souscription des notifications
        localStorage.setItem('userId', this.utilisateurId.toString());
  
        if (this.role === 'CHEF' && this.serviceId) {
          this.loadCongesByService();
        } else {
          this.getConges();
        }
  
        // Subscribe to notifications
        if (this.role === 'CHEF' || this.role === 'ADMIN') {
          this.notificationService.notifications$.subscribe((msgs) => {
            console.log('Notifications reçues:', msgs); // Debugging
            this.notifications = msgs;
  
            // Auto-remove notifications after 10 seconds
            msgs.forEach((_, index) => {
              setTimeout(() => {
                this.removeNotification(index);
              }, 10000);
            });
          });
        }
  
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors de la récupération des données utilisateur', error);
        this.showError('Erreur lors de la récupération des données utilisateur.');
        this.isLoading = false;
      }
    );
  }


  // Function to manually remove a notification
  removeNotification(index: number): void {
    const notificationElements = document.querySelectorAll('.notification');
    if (notificationElements[index]) {
      notificationElements[index].classList.add('fade-out'); // Apply fade-out effect
      setTimeout(() => {
        this.notifications.splice(index, 1);
      }, 500); // Wait for animation to finish before removing
    }
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

  loadCongesByService(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.isLoading = true;
    this.congeservice.getCongesByService(this.serviceId, token).subscribe(
      (data) => {
        console.log('Données reçues pour le service:', data);
        this.serviceConges = data;
        this.filteredConges = [...data];
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors de la récupération des congés du service', error);
        this.showError('Erreur lors de la récupération des congés du service.');
        this.isLoading = false;
      }
    );
  }

  soumettreConge(): void {
    if (!this.conge.dateDebut.trim() || !this.conge.dateFin.trim() ||
        !this.conge.type.trim() || !this.conge.motif.trim()) {
      this.showError('Veuillez remplir tous les champs.');
      return;
    }

    const dateDebut = new Date(this.conge.dateDebut);
    const dateFin = new Date(this.conge.dateFin);
    const dateActuelle = new Date();

    if (dateDebut < dateActuelle) {
      this.showError('La date de début ne peut pas être antérieure à aujourd\'hui.');
      return;
    }

    if (dateDebut > dateFin) {
      this.showError('La date de début doit être antérieure à la date de fin.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.showError('Utilisateur non authentifié.');
      return;
    }

    this.isLoading = true;
    this.congeservice.submitCongeRequest(this.conge, token).subscribe(
      (response) => {
        console.log('Réponse du serveur:', response);
        this.showSuccess('Demande de congé soumise avec succès !');
        this.conge = { type: '', dateDebut: '', dateFin: '', motif: '' };
        this.getConges();
      },
      (error) => {
        console.error('Erreur lors de la soumission de la demande de congé', error);
        this.showError('Une erreur est survenue lors de la soumission.');
      }
    ).add(() => {
      this.isLoading = false;
    });
  }

  approveOrRejectConge(congeId: number, status: string): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.isLoading = true;
    this.congeservice.updateCongeStatus(congeId, status, token).subscribe(
      (response) => {
        console.log('Réponse serveur:', response);
        this.showSuccess('Le statut du congé a été mis à jour.');
        this.loadCongesByService();
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du statut', error);
        this.showError('Erreur lors de la mise à jour du statut.');
      }
    ).add(() => {
      this.isLoading = false;
    });
  }

  filterCongesByStatus(): void {
    this.filteredConges = this.selectedStatus === 'TOUS'
      ? this.serviceConges
      : this.serviceConges.filter(conge => conge.status === this.selectedStatus);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 5000);
  }
}
