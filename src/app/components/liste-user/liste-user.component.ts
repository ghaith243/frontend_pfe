import { Component, OnInit } from '@angular/core';
import { AdminserviceService } from 'app/services/adminservice.service';
import { AuthRequest, User } from 'app/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-liste-user',
  templateUrl: './liste-user.component.html',
  styleUrls: ['./liste-user.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ListeUserComponent implements OnInit {
  users: User[] = [];
  token: string = localStorage.getItem('token') || '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedUser: User | null = null;
  errorMessage: string = '';

  // Form data for adding/updating user
  newUser: AuthRequest = {
    nom: '',
    email: '',
    motDePasse: '',
    role: '',
    serviceId: 0
  };
isLoading: any;

  constructor(private adminService: AdminserviceService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        this.errorMessage = 'Erreur lors de la récupération des utilisateurs';
      }
    });
  }

  // Open Add User Modal
  openAddModal() {
    this.newUser = { nom: '', email: '', motDePasse: '', role: '', serviceId: 0 };
    this.errorMessage = '';
    this.showAddModal = true;
  }

  // Close Add User Modal
  closeAddModal() {
    this.showAddModal = false;
    this.errorMessage = '';
  }

  // Add User
  addUser() {
    this.adminService.addUser(this.newUser).subscribe({
      next: () => {
        this.fetchUsers();
        this.closeAddModal();
        alert('Utilisateur ajouté avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
        this.errorMessage = err.error || 'Erreur lors de l\'ajout de l\'utilisateur';
      }
    });
  }

  // Open Edit User Modal
  openEditModal(user: User) {
    this.selectedUser = user;
    this.newUser = {
      nom: user.nom,
      email: user.email,
      motDePasse: '',
      role: user.role.name,
      serviceId: user.service.id
    };
    this.errorMessage = '';
    this.showEditModal = true;
  }

  // Close Edit User Modal
  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
    this.errorMessage = '';
  }

  // Update User
  updateUser() {
    if (this.selectedUser) {
      this.adminService.updateUser(this.selectedUser.id, this.newUser).subscribe({
        next: () => {
          this.fetchUsers();
          this.closeEditModal();
          alert('Utilisateur mis à jour avec succès !');
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
          this.errorMessage = err.error || 'Erreur lors de la mise à jour de l\'utilisateur';
        }
      });
    }
  }

  // Delete User
  deleteUser(userId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.fetchUsers();
          alert('Utilisateur supprimé avec succès !');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'utilisateur:', err);
          this.errorMessage = err.error || 'Erreur lors de la suppression de l\'utilisateur';
        }
      });
    }
  }
}