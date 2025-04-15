import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormModule } from '@coreui/angular';
import { AbsenceRequest, AbsencesService } from 'app/services/absences.service';
import { UserserviceService } from 'app/services/userservice.service';

@Component({
  selector: 'app-absences',
  templateUrl: './absences.component.html',
  styleUrls: ['./absences.component.scss'],
  standalone: true,
  imports: [FormModule, CommonModule, ReactiveFormsModule,FormsModule]
})
export class AbsencesComponent implements OnInit {
  form: FormGroup;
  employes: any[] = [];
  absences: any[] = [];

  constructor(
    private fb: FormBuilder,
    private absenceService: AbsencesService,
    private employeservice: UserserviceService,
     
  ) {
    this.form = this.fb.group({
      employeId: [null, Validators.required],
      motif: ['', Validators.required],
      justifiee: [false]
    });
  }

  ngOnInit(): void {
    this.employeservice.getAllEmployes().subscribe({
      next: (data) => {
        this.employes = data;
        console.log('Employés chargés', this.employes); // ✅ test
      },
      error: () => {
        alert('Erreur lors du chargement des employés'); // ✅ remplacement de toastr.error
      }
      
    });
     
    this.getALLabsence();
    this.refresh();      
   
  }

  onSubmit(): void {
    if (this.form.valid) {
      const request: AbsenceRequest = this.form.value;

      this.absenceService.marquerAbsence(request).subscribe({
        next: () => {
          alert('Absence enregistrée !'); // ✅ remplacement de toastr.success
          this.form.reset({ justifiee: false });
          this.getALLabsence();
        },
        error: () => {
          alert("Erreur lors de l'enregistrement de l'absence"); // ✅ remplacement de toastr.error
        }
      });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.'); // ✅ remplacement de toastr.warning
    }
  }
  filtreEmploye: string = '';
  filtreDate: string = '';
  filteredAbsences: any[] = [];
  loading: boolean = false;
  triAsc: boolean = true;
  filtreEmployeId: number | null = null;
  
  getALLabsence(): void {
    this.loading = true;
    const token = localStorage.getItem('token');
  
    if (token) {
      this.employeservice.getEmployeeData(token).subscribe({
        next: (user) => {
          this.absenceService.getAbsencesByAL().subscribe({
            next: (data) => {
              this.absences = data;
              this.filteredAbsences = data;
              this.loading = false;
            },
            error: () => {
              alert('Erreur lors du chargement des absences');
              this.loading = false;
            }
          });
        },
        error: () => {
          alert('Erreur lors de la récupération de l’utilisateur');
          this.loading = false;
        }
      });
    }
  }
  refresh():void{
    this.getALLabsence();
  }
  
  filtrerAbsences(): void {
    this.filteredAbsences = this.absences.filter(abs => {
      const employeMatch = this.filtreEmployeId ? abs.employe.id === this.filtreEmployeId : true;
      const dateMatch = this.filtreDate ? abs.date.startsWith(this.filtreDate) : true;
      return employeMatch && dateMatch;
    });
  }
  
  
  trierParNom(): void {
    this.triAsc = !this.triAsc;
    this.filteredAbsences.sort((a, b) => {
      const nameA = a.employe.nom.toLowerCase();
      const nameB = b.employe.nom.toLowerCase();
      return this.triAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }
}
     
  

