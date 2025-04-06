import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { CongesService } from 'app/services/conges.service';
import { UserserviceService } from 'app/services/userservice.service';

@Component({
  selector: 'app-submitleave',
  imports: [FormsModule,CommonModule],
  templateUrl: './submitleave.component.html',
  styleUrl: './submitleave.component.scss'
})
export class SubmitleaveComponent   {
  conge = {
    dateDebut: '',
    dateFin: '',
    motif: '',
    type: ''
  };
  
  utilisateurId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

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

    this.userservice.getEmployeeData(token).subscribe(
      (data) => {
        this.utilisateurId = data.id;
      },
      (error) => {
        console.error('Erreur lors de la récupération des données utilisateur', error);
        this.showError('Erreur lors de la récupération des données utilisateur.');
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
        this.conge = { type: '', dateDebut: '', dateFin: '', motif: '' }; // Réinitialisation du formulaire
      },
      (error) => {
        console.error('Erreur lors de la soumission de la demande de congé', error);
        this.showError('Une erreur est survenue lors de la soumission.');
      }
    ).add(() => {
      this.isLoading = false;
    });
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