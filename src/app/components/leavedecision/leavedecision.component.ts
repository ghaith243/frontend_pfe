import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CongesService } from 'app/services/conges.service';
import { UserserviceService } from 'app/services/userservice.service';

@Component({
  selector: 'app-leavedecision',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './leavedecision.component.html',
  styleUrls: ['./leavedecision.component.scss']
})
export class LeavedecisionComponent implements OnInit {
  serviceConges: any[] = [];
  filteredConges: any[] = [];
  selectedStatus: string = 'TOUS';
  isLoading: boolean = false;
  errorMessage: string = '';
  serviceId: number = 0;

  constructor(
    private congeservice: CongesService,
    private userservice: UserserviceService
  ) {}

  ngOnInit(): void {
    this.getUserServiceId();
  }

  getUserServiceId(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.isLoading = true;
    this.userservice.getEmployeeData(token).subscribe({
      next: (userData) => {
        this.serviceId = userData.serviceId;
        this.loadCongesByService();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des données utilisateur', err);
        this.errorMessage = 'Erreur lors de la récupération des données';
        this.isLoading = false;
      }
    });
  }

  loadCongesByService(): void {
    const token = localStorage.getItem('token');
    if (!token || !this.serviceId) return;

    this.isLoading = true;
    this.congeservice.getCongesByService(this.serviceId, token).subscribe({
      next: (data) => {
        this.serviceConges = data;
        this.filteredConges = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des congés', err);
        this.errorMessage = 'Erreur lors du chargement des congés';
        this.isLoading = false;
      }
    });
  }

  approveOrRejectConge(congeId: number, status: string): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.isLoading = true;
    this.congeservice.updateCongeStatus(congeId, status, token).subscribe({
      next: () => {
        this.loadCongesByService();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut', err);
        this.errorMessage = 'Erreur lors de la mise à jour du statut';
        this.isLoading = false;
      }
    });
  }

  filterCongesByStatus(): void {
    this.filteredConges = this.selectedStatus === 'TOUS'
      ? this.serviceConges
      : this.serviceConges.filter(conge => conge.status === this.selectedStatus);
  }
}