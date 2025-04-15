import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbsencesService } from 'app/services/absences.service';
import { UserserviceService } from 'app/services/userservice.service';

@Component({
  selector: 'app-employe-absence',
  imports: [CommonModule],
  templateUrl: './employe-absence.component.html',
  styleUrl: './employe-absence.component.scss'
})
export class EmployeAbsenceComponent implements OnInit {
  absences: any[] = [];
  userId!: number;

  constructor(
    private absenceService: AbsencesService,
    private userService: UserserviceService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.userService.getEmployeeData(token).subscribe({
        next: (user) => {
          this.userId = user.id;

          this.absenceService.getAbsencesByEmploye(this.userId).subscribe({
            next: (data) => this.absences = data,
            error: () => alert('Erreur lors du chargement des absences')
          });
        },
        error: () => alert('Erreur lors de la récupération de l’utilisateur')
      });
    }
  }
}

