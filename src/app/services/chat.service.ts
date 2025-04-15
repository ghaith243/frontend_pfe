import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: Client;
  private messageSubject = new BehaviorSubject<any>(null);

  public message$ = this.messageSubject.asObservable();

  constructor(private http: HttpClient) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      this.stompClient.subscribe('/topic/messages', (message: Message) => {
        this.messageSubject.next(JSON.parse(message.body));
      });
    };

    this.stompClient.activate();
  }

  sendMessage(message: any) {
    return this.http.post('http://localhost:8092/api/send', message);
  }

  getChatHistory(sender: string, recipient: string) {
    return this.http.get<any[]>(`http://localhost:8092/api/messages/${sender}/${recipient}`);
  }

  getUsers() {
    return this.http.get<any[]>('http://localhost:8092/employee/users');
  }
}
