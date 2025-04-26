import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CongesService } from 'app/services/conges.service';

@Component({
  selector: 'app-liste-allconge',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './liste-allconge.component.html',
  styleUrl: './liste-allconge.component.scss'
})
export class ListeAllcongeComponent implements OnInit {
  filteredConges: any[] = [];
  selectedStatus: string = 'TOUS';
  isLoading: boolean = false;
  errorMessage: string = '';

  conges: any[] = [];
  token: string = '';

  constructor(private congesService: CongesService) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token') || '';
    this.loadConges();
  }

  loadConges(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.congesService.getAllConges(this.token).subscribe({
      next: (data) => {
        this.conges = data;
        this.filterCongesByStatus();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des congés', error);
        this.errorMessage = 'Impossible de charger les congés. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  filterCongesByStatus(): void {
    this.filteredConges = this.selectedStatus === 'TOUS'
      ? this.conges
      : this.conges.filter(conge => conge.status === this.selectedStatus);
  }

  calculateDuration(dateDebut: string, dateFin: string): number {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    
    // Calculate difference in days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Add 1 to include both start and end days
    return diffDays + 1;
  }
}