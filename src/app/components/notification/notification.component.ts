import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'app/services/authservice.service';
import { NotificationsService} from 'app/services/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  //notifications: UserNotification[] = []; // ✅ Correction du typage

  private subscriptions = new Subscription();

  constructor(
    private notificationsService: NotificationsService, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    // 🔥 Stocker l'abonnement pour un désabonnement propre
    const sub = this.notificationsService.notifications$.subscribe({
      next: (notifications) => {
        //this.notifications = notifications;
      },
      error: (err) => console.error('❌ Erreur lors de la récupération des notifications:', err)
    });

    this.subscriptions.add(sub);
   // this.notificationsService.fetchNotificationsFromBackend(); // 🔥 Charger les notifications depuis le backend
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe(); // ✅ Nettoyage mémoire
  }
}
