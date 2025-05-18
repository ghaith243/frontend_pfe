import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { BehaviorSubject, type Observable } from "rxjs"

export interface AppNotification {
  id?: number
  message: string
  createdAt: string // Date sous forme de string
  read: boolean
}

@Injectable({
  providedIn: "root",
})
export class NotificationsService {
  private stompClient!: Client
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([])
  notifications$ = this.notificationsSubject.asObservable()
  private apiUrl = "http://localhost:8092/notifications" // API Backend
  private headers: HttpHeaders

  constructor(private http: HttpClient) {
    const token = localStorage.getItem("token")
    this.headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    })
    this.waitForUserIdAndConnect()
    this.loadStoredNotifications()
  }

  private connect() {
    const socket = new SockJS("http://localhost:8092/ws")
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => {
        console.log("STOMP Debug:", msg)
      },
    })

    this.stompClient.onConnect = () => {
      console.log("✅ Connecté au WebSocket")

      // Abonnement aux notifications générales
     /* this.stompClient.subscribe("/topic/notifications", (message) => {
        console.log("📩 Notification générale reçue:", message.body)
        try {
          const notification = JSON.parse(message.body)
          this.addNotification(notification)
        } catch (error) {
          console.error("Error parsing general notification:", error)
        }
      })*/

      // Abonnement aux notifications pour l'utilisateur spécifique
      const currentuserId = localStorage.getItem("userId")
   console.log("🧪 Abonnement à /topic/user/", localStorage.getItem("userId"))

      if (currentuserId) {
        this.stompClient.subscribe(`/topic/user/${currentuserId}`, (message) => {
          console.log("📩 Notification utilisateur reçue:", message.body)
          try {
            const notification = JSON.parse(message.body)
            this.addNotification(notification)
          } catch (error) {
            console.error("Error parsing user notification:", error)
          }
        })
      }
    }

    this.stompClient.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"], frame.body)
    }

    this.stompClient.activate()
  }
private waitForUserIdAndConnect() {
  const checkInterval = setInterval(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
      clearInterval(checkInterval)
      console.log("👤 userId trouvé:", userId)
      this.connect()
    }
  }, 100)
}
  private addNotification(notification: any) {
    try {
      // Ensure notification has the correct structure
      const formattedNotification: AppNotification = {
        id: notification.id,
        message: notification.message || "No message",
        createdAt: notification.createdAt || new Date().toISOString(),
        read: notification.read || false,
      }

      // Add to the current notifications list
      const currentNotifications = this.notificationsSubject.value

      // Check if notification already exists (by id or content)
      const exists = currentNotifications.some(
        (n) =>
          (n.id && n.id === formattedNotification.id) ||
          (n.message === formattedNotification.message && n.createdAt === formattedNotification.createdAt),
      )

      if (!exists) {
        // Add new notification at the beginning of the array
        const updatedNotifications = [formattedNotification, ...currentNotifications]
        this.notificationsSubject.next(updatedNotifications)
      }
    } catch (error) {
      console.error("Erreur de traitement de la notification:", error, notification)
    }
  }

  private loadStoredNotifications() {
    this.http.get<AppNotification[]>(this.apiUrl, { headers: this.headers }).subscribe({
      next: (notifications) => {
        console.log("🔄 Toutes les notifications récupérées:", notifications)
        // Trier : d'abord les non lues, puis les lues
        const sortedNotifications = notifications.sort((a, b) =>
          a.read === b.read
            ? // If read status is the same, sort by date (newest first)
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : // Otherwise, unread first
              a.read
              ? 1
              : -1,
        )
        this.notificationsSubject.next(sortedNotifications)
      },
      error: (error) => console.error("❌ Erreur lors de la récupération des notifications:", error),
    })
  }

  // Charger toutes les notifications (lues et non lues)
  loadAllNotifications() {
    this.http.get<AppNotification[]>(`${this.apiUrl}/all`, { headers: this.headers }).subscribe({
      next: (notifications) => {
        console.log("🔄 Toutes les notifications récupérées:", notifications)
        const sortedNotifications = notifications.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        this.notificationsSubject.next(sortedNotifications)
      },
      error: (error) => console.error("❌ Erreur lors de la récupération des notifications:", error),
    })
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead() {
    this.http.put(`${this.apiUrl}/mark-all-as-read`, {}, { headers: this.headers }).subscribe({
      next: () => {
        console.log("✅ Toutes les notifications marquées comme lues")
        const updatedNotifications = this.notificationsSubject.value.map((notif) => ({
          ...notif,
          read: true, // Marque comme lue
        }))
        this.notificationsSubject.next(updatedNotifications)
      },
      error: (error) => console.error("❌ Erreur lors du marquage des notifications:", error),
    })
  }

  // Marquer une notification spécifique comme lue
  markAsRead(notificationId: number) {
    this.http.put(`${this.apiUrl}/${notificationId}/mark-as-read`, {}, { headers: this.headers }).subscribe({
      next: () => {
        console.log(`✅ Notification ${notificationId} marquée comme lue`)
        const updatedNotifications = this.notificationsSubject.value.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif,
        )
        this.notificationsSubject.next(updatedNotifications)
      },
      error: (error) => console.error(`❌ Erreur lors du marquage de la notification ${notificationId}:`, error),
    })
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl, { headers: this.headers })
  }
}