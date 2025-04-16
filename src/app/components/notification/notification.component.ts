import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'app/services/authservice.service';
import { AppNotification, NotificationsService} from 'app/services/notifications.service';
import { interval, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  unreadNotificationsCount: number = 0;

  private subscriptions = new Subscription();

  constructor(
    private notificationsService: NotificationsService, 
    private authService: AuthService
  ) {}

ngOnInit(): void {
  // 🔥 Immediate load of current notifications
  const initialSub = this.notificationsService.getNotifications().subscribe({
    next: (notifications) => {
      this.notifications = notifications;
      this.unreadNotificationsCount = notifications.filter(n => !n.read).length;
    },
    error: (err) => console.error('❌ Erreur lors du chargement initial des notifications:', err)
  });

  this.subscriptions.add(initialSub);

  // 🔁 Polling every 10 seconds
  const pollSub = interval(10000) // every 10s
    .pipe(
      switchMap(() => this.notificationsService.getNotifications())
    )
    .subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadNotificationsCount = notifications.filter(n => !n.read).length;
      },
      error: (err) => console.error('❌ Erreur lors du polling des notifications:', err)
    });

  this.subscriptions.add(pollSub);
}


  ngOnDestroy() {
    this.subscriptions.unsubscribe(); // ✅ Nettoyage mémoire
  }

  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return `Aujourd'hui à ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    return `${date.toLocaleDateString()} à ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}
