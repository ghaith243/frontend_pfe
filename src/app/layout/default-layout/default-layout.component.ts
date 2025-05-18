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
    IconDirective,NgClass,CommonModule
  ]
})
export class DefaultLayoutComponent implements OnInit {
  public navItems: NavItem[] = [];
  public role: string = '';
  public showToast = false;
  public toastMessage = '';
  public toastType = 'info'; // 'info', 'success', 'warning', 'error'
  private notificationSubscription!: Subscription;
  http: any;
   notifications: any[] = [];

  constructor(
    private authService: AuthService, 
    private cdRef: ChangeDetectorRef,
    private userservice: UserserviceService,
    private notificationsService: NotificationsService,
    http:HttpClient
  ) {}

  ngOnInit(): void {
    this.loadNavItems();
   this.notificationsService.notifications$.subscribe((msgs) => {
          console.log('Notifications reçues:', msgs);
          this.notifications = msgs.filter(notification => !notification.read);
          this.cdRef.detectChanges(); // Détection des changements manuelle

          // Auto-suppression après 10 secondes
          this.notifications.forEach((_, index) => {
            setTimeout(() => this.removeNotification(index), 10000);
          });
        });

  }
   removeNotification(index: number): void {
    const notificationElements = document.querySelectorAll('.notification');
    if (notificationElements[index]) {
      notificationElements[index].classList.add('fade-out'); // Animation CSS
      setTimeout(() => {
        this.notifications.splice(index, 1);
        this.cdRef.detectChanges();
      }, 500);
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  loadNavItems(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getEmployeeData(token).subscribe(
        (data) => {

          this.role = data.role;

          console.log('Données utilisateur reçues:', data);

          this.role = data.role; // Récupérer le rôle de l'utilisateur depuis la réponse de l'API
          console.log('Rôle validé :', this.role);

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


  setupNotificationListener(): void {
    this.notificationSubscription = this.notificationsService.notifications$.subscribe(notifications => {
      if (notifications && notifications.length > 0) {
        const latestNotification = notifications[0]; // Prendre la notification la plus récente
        if (!latestNotification.read) {
          this.showToastNotification(latestNotification.message);
        }
      }
    });
  }

  showToastNotification(message: string, type: string = 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }

  onScrollbarUpdate($event: any): void {
    // Logique de mise à jour du scrollbar (facultatif)
  }
}