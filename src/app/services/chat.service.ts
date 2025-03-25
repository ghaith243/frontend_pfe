import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, Message, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private stompClient!: Client;
  private messageSubject = new Subject<string>(); // Observable for received messages
  private serverUrl = 'http://localhost:8092/ws'; // Adjust if necessary

  constructor() {
    this.connect();
  }

  private connect(): void {
    const socket = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(socket);

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      
      // Subscribe to receive messages
      this.stompClient.subscribe('/topic/messages', (message: Message) => {
        this.messageSubject.next(message.body);
      });
    };

    this.stompClient.activate(); // Connect to WebSocket
  }

  sendMessage(senderId: number, receiverId: number, content: string): void {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = { senderId, receiverId, content };
      this.stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage),
      });
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  getMessages(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('Disconnected from WebSocket');
    }
  }
}
