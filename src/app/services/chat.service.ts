import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChatMessage, GroupMessageRequest } from '../components/messagerie/messagerie.model';
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

  connectWebSocket(userId: number , groupId?: number): void {
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

         // Subscribe to the group topic if groupId is provided
      if (groupId) {
        this.stompClient.subscribe(`/topic/group/${groupId}`, (message: IMessage) => {
          const msg: ChatMessage = JSON.parse(message.body);
          this.messageSubject.next(msg);  // Update the UI with the received message
        });
        }
      },

      
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.stompClient.activate();
  }

  getGroupMessagesObservable() {
    return this.messageSubject.asObservable();
  }

  sendViaWebSocket(message: ChatMessage, groupId?: number): void {
    if (this.stompClient && this.stompClient.connected) {
      const destination = groupId
        ? `/app/group/${groupId}/send` // Send to group chat
        : '/chat/send';  // Send to private chat
  
      this.stompClient.publish({
        destination,
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
//********************************************************************************************************************************************************************** */
  // Create group chat
  createGroupChat(groupName: string, userEmails: string[]): Observable<any> {
    const body = {
      groupName,
      initialParticipants: userEmails
    };
    return this.http.post(`${this.baseUrl}/api/group-chats/create`, body, {
      headers: this.getAuthHeaders()
    });
  }

  // Get all group chats for the current user
  getMyGroupChats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/group-chats/mine`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get messages from a specific group
  getGroupMessages(groupId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/api/group-chats/${groupId}/messages`, {
      headers: this.getAuthHeaders()
    });
  }

  // Send message to a group
  sendGroupMessage(groupId: number, message: GroupMessageRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/group-chats/${groupId}/send`, message, {
      headers: this.getAuthHeaders()
    });
  }

  subscribeToGroupTopic(groupId: number, callback: (message: ChatMessage) => void): void {
    this.stompClient?.subscribe(`/topic/group/${groupId}`, (message: IMessage) => {
      const msg: ChatMessage = JSON.parse(message.body);
      callback(msg);
    });
  }

  sendGroupTypingNotification(sender: string, groupId: number): void {
    const typingPayload = {
      sender,
      groupId
    };
  
    this.stompClient?.publish({
      destination: `/app/typing/group/${groupId}`,
      body: JSON.stringify(typingPayload),
    });
  }

  subscribeToGroupTyping(groupId: number, callback: (message: IMessage) => void): void {
    this.stompClient?.subscribe(`/topic/group-typing/${groupId}`, callback);
  }
}