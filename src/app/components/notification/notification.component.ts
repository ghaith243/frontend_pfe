import { CommonModule } from "@angular/common"
import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { AuthService } from "app/services/authservice.service"
import  { AppNotification } from "app/services/notifications.service"
import { NotificationsService } from "app/services/notifications.service"
import { Subscription } from "rxjs"

@Component({
  selector: "app-notification",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = []
  unreadNotificationsCount = 0
  isLoading = true

  private subscriptions = new Subscription()

  constructor(
    private notifciationservice:NotificationsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Subscribe to real-time notifications
    const realtimeSub = this.notifciationservice.notifications$.subscribe({
      next: (notifications) => {
        this.isLoading = false
        this.notifications = notifications
        this.unreadNotificationsCount = notifications.filter((n) => !n.read).length
      },
      error: (err) => {
        this.isLoading = false
        console.error("❌ Erreur WebSocket notifications:", err)
      },
    })

    this.subscriptions.add(realtimeSub)
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe() // ✅ Nettoyage mémoire
  }

  markAllAsRead() {
    this.notifciationservice.markAllAsRead()
  }

  markAsRead(notificationId: number) {
    if (notificationId) {
      this.notifciationservice.markAsRead(notificationId)
    }
  }

  formatNotificationTime(dateString: string): string {
    if (!dateString) return "Date invalide"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.warn("⚠️ Date parsing failed for:", dateString)
        return "Date invalide"
      }

      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      // Format time
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      const timeStr = `${hours}:${minutes}`

      if (diffMinutes < 1) return "À l'instant"
      if (diffMinutes < 60) return `Il y a ${diffMinutes} min`
      if (diffHours < 24) return `Il y a ${diffHours} h`
      if (diffDays === 1) return `Hier à ${timeStr}`

      // Format date for older notifications
      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      return `${day}/${month} à ${timeStr}`
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return "Date invalide"
    }
  }
}
