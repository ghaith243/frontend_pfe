import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from './messagerie.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { interval, Subscription } from 'rxjs';
import { IMessage } from '@stomp/stompjs';
import { ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './messagerie.component.html',
  styleUrls: ['./messagerie.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MessagerieComponent implements OnInit, OnDestroy ,AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  messages: ChatMessage[] = [];
  newMessage = '';
  myUsername = localStorage.getItem('username') || 'iyed';
  recipient: string | null = null;
  users: { email: string; name: string }[] = [];
  pollingSubscription!: Subscription;
  typingUser: string | null = null;
  isTyping = false;
  typingTimeout: any;
  private jwtHelper = new JwtHelperService();

  constructor(private chatService: ChatService) {}

  ngAfterViewChecked(): void {}

  scrollToBottom(force: boolean = false): void {
    const el = this.messagesContainer.nativeElement;
  
    const isNearBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
  
    if (force || isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }
  
  

  ngOnInit(): void {
    this.getMyUsername();
    this.connectToWebSocket();
    this.loadUsers();

    setInterval(() => this.loadMessages(), 60000);

    this.pollingSubscription = interval(3000).subscribe(() => {
      if (this.recipient) {
        this.fetchMessages(this.recipient);
      }
    });
  }

  getMyUsername(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.myUsername = decodedToken.email || decodedToken.sub;
    }
  }

  connectToWebSocket(): void {
    const userId = parseInt(localStorage.getItem('userId') || '0', 10);
    this.chatService.connectWebSocket(userId);

    this.chatService.onMessage().subscribe((msg: ChatMessage) => {
      if (
        (msg.sender === this.recipient && msg.recipient === this.myUsername) ||
        (msg.sender === this.myUsername && msg.recipient === this.recipient)
      ) {
        this.messages.push({ ...msg, justArrived: true });
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });

    setTimeout(() => {
      this.chatService.subscribeToTyping(this.myUsername, (message: IMessage) => {
        const data = JSON.parse(message.body);
        if (data.sender === this.recipient) {
          this.typingUser = data.sender;
          this.isTyping = true;

          clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            this.typingUser = null;
          }, 4000);
        }
      });
    }, 2000); // Wait for WebSocket to connect
  }

  fetchMessages(recipient: string): void {
    this.chatService.getMessages(this.myUsername, recipient).subscribe((data) => {
      this.messages = data;
    });
  }

  loadMessages(): void {
    if (this.recipient) {
      this.fetchMessages(this.recipient);
    }
  }

  loadUsers(): void {
    this.chatService.getAllUsers().subscribe((usersMap) => {
      this.users = Object.entries(usersMap).map(([email, name]) => ({ email, name }));
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.recipient) return;

    const message: ChatMessage = {
      sender: this.myUsername,
      recipient: this.recipient,
      content: this.newMessage,
      timestamp: new Date().toISOString(),
    };

    this.chatService.sendMessage(message).subscribe(() => {
      message['justArrived'] = true;
      this.messages.push(message);
      this.newMessage = '';

      setTimeout(() => {
        message['justArrived'] = false;
        this.scrollToBottom();
      }, 500);
      
      this.fetchMessages(this.recipient!);
      setTimeout(() => this.scrollToBottom(true), 100);
    });
  }

  selectRecipient(user: string): void {
    this.recipient = user;
    this.loadMessages();
  }

  onTyping(): void {
    if (this.recipient) {
      this.chatService.sendTypingNotification(this.myUsername, this.recipient);
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    this.chatService.disconnectWebSocket();
  }

  trackByMessageId(index: number, msg: ChatMessage): string {
    return msg.timestamp + '-' + msg.sender;
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;
  
    const currentDate = new Date(this.messages[index].timestamp).toDateString();
    const previousDate = new Date(this.messages[index - 1].timestamp).toDateString();
  
    return currentDate !== previousDate;
  }
  
  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  getUsernameByEmail(email: string | null): string {
    if (!email) return '';
    const user = this.users.find(u => u.email === email);
    return user ? user.name : email;
  }
  
}
