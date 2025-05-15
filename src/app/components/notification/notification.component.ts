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
  // const initialSub = this.notificationsService.getNotifications().subscribe({
  //   next: (notifications) => {
  //     this.notifications = notifications;
  //     this.unreadNotificationsCount = notifications.filter(n => !n.read).length;
  //   },
  //   error: (err) => console.error('❌ Erreur lors du chargement initial des notifications:', err)
  // });

   const realtimeSub = this.notificationsService.notifications$.subscribe({
    next: (notifications) => {
      this.notifications = notifications.map(n => {
      console.log('Notification date raw:', n.createdAt); // or whatever your date field is called
      return n;
      });
      this.unreadNotificationsCount = notifications.filter(n => !n.read).length;
    },
    error: (err) => console.error('❌ Erreur WebSocket notifications:', err)
  });

  this.subscriptions.add(realtimeSub);

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
  if (!dateString) return 'Date invalide';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('⚠️ Date parsing failed for:', dateString);
    return 'Date invalide';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (isToday) {
    return `- Aujourd'hui à ${hours}:${minutes}`;
  } else if (isYesterday) {
    return `- Hier à ${hours}:${minutes}`;
  } else {
    return `- ${date.toLocaleDateString()} à ${hours}:${minutes}`;
  }
}


}
