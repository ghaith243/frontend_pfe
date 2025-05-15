import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
export interface AppNotification {
  id: number;
  message: string;
  createdAt: string; // Date sous forme de string
  read: boolean; // ✅ Ajout de la propriété "read"
}

@Injectable({
  providedIn: 'root'
})

export class NotificationsService {
  private stompClient!: Client;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private apiUrl = 'http://localhost:8092/notifications'; // API Backend
  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    this.connect();
    this.loadStoredNotifications();
  }

  private connect() {
    const socket = new SockJS('http://localhost:8092/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      console.log('✅ Connecté au WebSocket');

      // Abonnement aux notifications générales
      this.stompClient.subscribe('/topic/notifications', (message) => {
        const notification = JSON.parse(message.body);
        console.log('📩 Notification générale reçue:', notification);
        this.addNotification(notification);
      });

      // Abonnement aux notifications pour l'utilisateur spécifique
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.stompClient.subscribe(`/topic/user/${userId}`, (message) => {
          const parsed = JSON.parse(message.body); // ✅ parse the string
          this.notificationsSubject.next([parsed, ...this.notificationsSubject.value]);
          console.log("🧪 Raw WebSocket message:", message);
          console.log("🧪 Body:", message.body);
          console.log('📩 Notification utilisateur reçue:', message.body);
        });
      }
    };

    this.stompClient.activate();
  }

private addNotification(notification: any) {
    try {
        // Si la notification est une chaîne JSON, la parser
        const parsedNotification = typeof notification === 'string' ? 
         JSON.parse(notification) :  notification;
        
        if (!parsedNotification.read) {
            const currentNotifications = this.notificationsSubject.value;
            // S'assurer que la notification a une date valide
            if (!parsedNotification.createdAt) {
                parsedNotification.createdAt = new Date().toISOString();
            }
            const updatedNotifications = [parsedNotification, ...currentNotifications];
            this.notificationsSubject.next(updatedNotifications);
        }
    } catch (error) {
        console.error('Erreur de traitement de la notification:', error, notification);
    }
}
  
  

  // Récupérer les notifications stockées
  private loadStoredNotifications() {
    this.http.get<AppNotification[]>(this.apiUrl, { headers: this.headers }).subscribe({
      next: (notifications) => {
        console.log('🔄 Toutes les notifications récupérées:', notifications);
        // Trier : d'abord les non lues, puis les lues
        this.notificationsSubject.next(notifications.sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1)));
      },
      error: (error) => console.error('❌ Erreur lors de la récupération des notifications:', error)
    });
  }
  // Charger toutes les notifications (lues et non lues)
  loadAllNotifications() {
    this.http.get<Notification[]>(`${this.apiUrl}/all`, { headers: this.headers }).subscribe({
      next: (notifications) => {
        console.log('🔄 Toutes les notifications récupérées:', notifications);
        this.notificationsSubject.next(notifications);
      },
      error: (error) => console.error('❌ Erreur lors de la récupération des notifications:', error)
    });
  }
  

  // Marquer toutes les notifications comme lues
  markAllAsRead() {
    this.http.put(`${this.apiUrl}/mark-all-as-read`, {}, { headers: this.headers }).subscribe({
      next: () => {
        console.log('✅ Toutes les notifications marquées comme lues');
        const updatedNotifications = this.notificationsSubject.value.map(notif => ({
          ...notif,
          read: true // Marque comme lue
        }));
        this.notificationsSubject.next(updatedNotifications);
      },
      error: (error) => console.error('❌ Erreur lors du marquage des notifications:', error)
    });
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl, { headers: this.headers });
  }
  
  
}
