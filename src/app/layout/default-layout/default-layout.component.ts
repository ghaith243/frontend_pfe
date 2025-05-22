import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { navItems, NavItem } from './_nav';
import { AuthService } from 'app/services/authservice.service';
import { UserserviceService } from 'app/services/userservice.service';
import { NotificationsService } from 'app/services/notifications.service';
import { Subscription } from 'rxjs';
import { CommonModule, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent,
    CommonModule
  ]
})
export class DefaultLayoutComponent implements OnInit  {
  public navItems: NavItem[] = [];
  public role: string = '';
  public showToast = false;
  public toastMessage = '';
  public toastType = 'info'; // 'info', 'success', 'warning', 'error'
  private notificationSubscription!: Subscription;
  http: any;
 
    // Ajoutez ces propriétés à votre classe
public userName: string = '';
public userEmail: string = '';
public userInitial: string = '';

  constructor(
    private authService: AuthService, 
    private cdRef: ChangeDetectorRef,
    private userservice: UserserviceService,
    private notificationsService: NotificationsService,
    http:HttpClient
  ) {}

  ngOnInit(): void {
    this.loadNavItems();
 

  }
   



// Modifiez la méthode loadNavItems pour récupérer les infos utilisateur
loadNavItems(): void {
  const token = localStorage.getItem('token');
  if (token) {
    this.authService.getEmployeeData(token).subscribe(
      (data) => {
        this.role = data.role;
        this.userName = data.nom; // Adaptez selon votre structure de données
        this.userEmail = data.email;
       this.userInitial =  data.nom?.charAt(0)?.toUpperCase()+data.nom?.charAt(1).toUpperCase() || 'U';

        console.log('Données utilisateur reçues:', data);

        if (data.id) {
          localStorage.setItem('userId', data.id.toString());
          console.log('User ID stored in localStorage:', data.id);
        } else {
          console.warn('ID utilisateur non trouvé dans les données');
        }
        
        if (data.serviceId) {
          localStorage.setItem('serviceId', data.serviceId.toString());
        }
        if (this.role) {
          this.navItems = navItems[this.role.toUpperCase()] || navItems['EMPLOYEE'];
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