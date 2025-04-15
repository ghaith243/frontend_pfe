import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChatMessage } from '../components/messagerie/messagerie.model';
import { Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import { JwtHelperService} from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:8092';
  private jwtHelper = new JwtHelperService(); 
  isWebSocketConnected: boolean = false;
  private stompClient!: Client;
  private messageSubject: Subject<ChatMessage> = new Subject<ChatMessage>();
  private typingSubjects: { [key: string]: Subject<IMessage> } = {};

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found in localStorage');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private getCurrentUser(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.email || decodedToken.sub;
    }
    throw new Error('No token found or unable to decode token');
  }

  sendMessage(message: ChatMessage): Observable<any> {
    const sender = this.getCurrentUser();
    message.sender = sender;
    return this.http.post(`${this.baseUrl}/api/send`, message, {
      headers: this.getAuthHeaders()
    });
  }

  getMessages(sender: string, recipient: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.baseUrl}/api/messages/${sender}/${recipient}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getAllUsers(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/employee/users/available`,
      { headers: this.getAuthHeaders() }
    );
  }

  connectWebSocket(userId: number): void {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8092/ws',
      webSocketFactory: () => new SockJS(`${this.baseUrl}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connected');
        this.isWebSocketConnected = true;

        this.stompClient.subscribe(`/topic/messages/${userId}`, (message: IMessage) => {
          const msg: ChatMessage = JSON.parse(message.body);
          this.messageSubject.next(msg);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.stompClient.activate();
  }

  sendViaWebSocket(message: ChatMessage): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/chat/send',
        body: JSON.stringify(message)
      });
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  sendTypingNotification(sender: string, recipient: string): void {
    if (this.isWebSocketConnected) {
      this.stompClient.publish({
        destination: '/app/typing',
        body: JSON.stringify({ sender, recipient })
      });
    } else {
      console.log('WebSocket not connected, cannot send typing notification.');
    }
  }

  subscribeToTyping(recipientEmail: string, callback: (message: IMessage) => void): void {
    const topic = `/topic/typing/${recipientEmail}`;
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe(topic, callback);
    } else {
      console.warn('WebSocket not connected yet.');
    }
  }

  onMessage(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  disconnectWebSocket(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}