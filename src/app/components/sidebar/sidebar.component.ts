import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'app/services/authservice.service';
import { CommonModule } from '@angular/common';
import { FormModule } from '@coreui/angular';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,FormModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  visible: boolean = true;
  role: string = '';
  navItems: any[] = [];
  @Input() isOpen = true; // Propriété pour gérer l'affichage
  @Output() toggle = new EventEmitter<void>(); // Événement pour fermer/ouvrir la sidebar

  closeSidebar() {
    this.toggle.emit(); // Émet l'événement pour fermer la sidebar
  }

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.getUserRole();
  }

  getUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getEmployeeData(token).subscribe(user => {
        this.role = user.role;
        this.setNavItems();
      });
    }
  }

  setNavItems() {
    if (this.role === 'EMPLOYE') {
      this.navItems = [
        { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-home' },
        { label: 'Mes demandes de congé', route: '/conges', icon: 'fas fa-calendar' },
        { label: 'Faire une demande', route: '/conges/new', icon: 'fas fa-plus' }
      ];
    } else if (this.role === 'CHEF') {
      this.navItems = [
        { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-home' },
        { label: 'Demandes des employés', route: '/conges/validation', icon: 'fas fa-user-check' }
      ];
    } else if (this.role === 'ADMIN') {
      this.navItems = [
        { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-home' },
        { label: 'Toutes les demandes', route: '/conges/all', icon: 'fas fa-list' },
        { label: 'Gestion des employés', route: '/employees', icon: 'fas fa-users' }
      ];
    }
  }

  toggleSidebar() {
    this.visible = !this.visible;
  }
}


