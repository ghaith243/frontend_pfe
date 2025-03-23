import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems, NavItem } from './_nav'; // Importer navItems et NavItem
import { AuthService } from 'app/services/authservice.service';
import { UserserviceService } from 'app/services/userservice.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    IconDirective,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent
  ]
})
export class DefaultLayoutComponent implements OnInit {
  public navItems: NavItem[] = []; // Définir explicitement navItems avec le type NavItem[]
  public role: string = ''; // Le rôle initialisé à une chaîne vide

  constructor(private authService: AuthService, private userservice: UserserviceService) {}

  ngOnInit(): void {
    this.loadNavItems(); // Charger les éléments de la sidebar à l'initialisation
  }

  loadNavItems(): void {
    const token = localStorage.getItem('token'); // Récupérer le token
    if (token) {
      this.authService.getEmployeeData(token).subscribe(
        (data) => {
          console.log('Données utilisateur reçues:', data);

          this.role = data.role; // Récupérer le rôle de l'utilisateur depuis la réponse de l'API
          console.log('Rôle validé :', this.role);

          // Mettre à jour les éléments de la sidebar en fonction du rôle
          if (this.role) {
            this.navItems = navItems[this.role.toUpperCase()] || navItems['EMPLOYEE'];
            console.log('Éléments de la sidebar pour ce rôle :', this.navItems);
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      );
    } else {
      console.error('Token manquant dans le localStorage');
    }
  }

  onScrollbarUpdate($event: any): void {
    // Logique de mise à jour du scrollbar (facultatif)
  }
}
