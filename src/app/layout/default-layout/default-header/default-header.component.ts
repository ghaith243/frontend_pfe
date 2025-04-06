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

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [
    FormsModule, CommonModule, ContainerComponent, HeaderTogglerDirective, SidebarToggleDirective, IconDirective,
    HeaderNavComponent, NavItemComponent, NavLinkDirective, RouterLink, RouterLinkActive, NgTemplateOutlet,
    BreadcrumbRouterComponent, DropdownComponent, DropdownToggleDirective, AvatarComponent, DropdownMenuDirective,
    DropdownHeaderDirective, DropdownItemDirective, BadgeComponent, DropdownDividerDirective, RouterModule,RouterLink
  ]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit, OnDestroy {
  profilePictureUrl: string = '';
  notifications: any[] = []
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
