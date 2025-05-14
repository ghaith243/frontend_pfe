import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { NotificationsService } from 'app/services/notifications.service';
import { ProfileService } from 'app/services/profile.service';
import { AuthService } from 'app/services/authservice.service';
import { NotificationComponent } from 'app/components/notification/notification.component';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [
    FormsModule, CommonModule, ContainerComponent, HeaderTogglerDirective, SidebarToggleDirective, IconDirective,
    HeaderNavComponent, NavItemComponent, NavLinkDirective, RouterLink, RouterLinkActive, NgTemplateOutlet,
    BreadcrumbRouterComponent, DropdownComponent, DropdownToggleDirective, DropdownMenuDirective,
    DropdownHeaderDirective, DropdownItemDirective, BadgeComponent, DropdownDividerDirective, RouterModule,RouterLink
  ]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit, OnDestroy {
  profilePictureUrl: string = '';
  notifications: any[] = [];
  userRole: string = '';
  userInitials: string = '';
  userColor: string = '#0d6efd'; // Default color
  private subscription!: Subscription;
  private notificationsSubscription!: Subscription;
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  constructor(
    private notificationsService: NotificationsService,
    private profileService: ProfileService,private authService: AuthService,private router:Router
  ) {
    super();
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    // Récupérer le rôle de l'utilisateur
    this.userRole = this.authService.getUserRole();
    this.userInitials = this.getUserInitials()
    this.userColor = this.generateColorFromEmail(this.userInitials);

  
    
    // 📌 Écoute des notifications stockées + en temps réel
    this.notificationsSubscription = this.notificationsService.notifications$.subscribe((notifications) => {
      // Trier pour afficher les nouvelles notifications en premier
      this.notifications = [...notifications].sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1));
    });

    const profileSub = this.profileService.profilePictureUrl$.subscribe((url) => {
      this.profilePictureUrl = url || './assets/images/avatars/8.jpg'; // Image par défaut
    });
  
    this.subscription.add(profileSub);
  

  }
  getUserInitials(): string {
    const userEmail = localStorage.getItem('userEmail') || '';
    return userEmail ? userEmail.substring(0, 2).toUpperCase() : 'UN'; // UN for Unknown

  }
   // Fonction pour générer une couleur basée sur l'email
   private generateColorFromEmail(email: string): string {
    if (!email) return '#0d6efd'; // Couleur par défaut si pas d'email

    // Liste de couleurs prédéfinies
    const colors = [
      '#FF6F61', // Coral
      '#6B5B95', // Purple
      '#88B04B', // Green
      '#F7CAC9', // Pink
      '#92A8D1', // Blue
      '#FFCC5C', // Yellow
      '#D4A5A5', // Light Red
      '#9B59B6', // Violet
    ];

    // Calculer un hash simple basé sur l'email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Mapper le hash à un index dans la liste des couleurs
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  formatNotificationTime(dateString: string): string {
    if (!dateString) return 'Maintenant';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Maintenant';
        
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'À l\'instant';
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
        if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
        
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Maintenant';
    }
}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
  loadAllNotifications() {
    this.notificationsService.loadAllNotifications();
  }

  markAllAsRead() {
    this.notificationsService.markAllAsRead();
  }
  logout() {
    
    this.authService.logout();
}
  sidebarId = input('sidebar1');
 
  }
