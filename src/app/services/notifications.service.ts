import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private stompClient!: Client;
  private notificationsSubject = new BehaviorSubject<string[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect() {
    const socket = new SockJS('http://localhost:8092/ws'); // URL du WebSocket en backend
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Reconnexion automatique
    });

    this.stompClient.onConnect = () => {
      console.log('Connecté au WebSocket');

      // Abonnement aux notifications générales
      this.stompClient.subscribe('/topic/notifications', (message) => {
        this.addNotification(message.body);
      });

      // Abonnement aux notifications pour l'utilisateur spécifique
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.stompClient.subscribe(`/topic/user/${userId}`, (message) => {
          this.addNotification(message.body);
        });
      }
    };

    this.stompClient.activate();
  }

  private addNotification(notification: string) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }
}
