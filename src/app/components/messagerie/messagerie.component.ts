import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ChatMessage, GroupMessageRequest } from './messagerie.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { interval, Subscription } from 'rxjs';
import { IMessage } from '@stomp/stompjs';
import { ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AuthService } from '../../services/authservice.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';


@Component({
  selector: 'app-chat',
  templateUrl: './messagerie.component.html',
  styleUrls: ['./messagerie.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})


export class MessagerieComponent implements OnInit, OnDestroy ,AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('createGroupChatModal') createGroupChatModal!: ElementRef;
  private shouldScroll = false;
  isModalOpen = false;
  isNearBottom =  true;
  messages: ChatMessage[] = [];
  newMessage = '';
  myEmail! : string;
  recipient: string | null = null;
  users: { email: string; name: string }[] = [];
  pollingSubscription!: Subscription;
  typingUser: string | null = null;
  isTyping = false;
  typingTimeout: any;
  private jwtHelper = new JwtHelperService();
  groupName: string = '';
  selectedUserIds: number[] = [];
  selectedUserEmails: string[] = [];
  groupChats: any[] = [];
  selectedGroupId: number | null = null;
  isChefOrAdmin: boolean = false;
  userGroups: Group[] = []; // Populate from backend
  typingUsers: string[] = [];
  isSendingMessage: boolean = false;
  


  constructor(private chatService: ChatService , private authService: AuthService) {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  
  openCreateGroupChatModal() {
    const modal = this.createGroupChatModal.nativeElement;
    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';  // Prevent scrolling
  }

  onUserCheckboxChange(event: any, email: string) {
    if (event.target.checked) {
      this.selectedUserEmails.push(email); // Add the email to selected list
    } else {
      this.selectedUserEmails = this.selectedUserEmails.filter(
        (selectedEmail) => selectedEmail !== email
      ); // Remove the email from selected list
    }
  }
  
  toggleUserSelection(userEmail: string, isChecked: boolean): void {
    if (isChecked) {
      this.selectedUserEmails.push(userEmail);
    } else {
      this.selectedUserEmails = this.selectedUserEmails.filter(email => email !== userEmail);
    }
  }

  closeCreateGroupChatModal() {
    const modal = this.createGroupChatModal.nativeElement;
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = '';  // Restore body scroll
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }, 0); // use 0 for immediate, or 100 if needed
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
  
  

  ngOnInit(): void {
    this.getMyUsername();
    this.connectToWebSocket();
    this.isChefOrAdmin = this.authService.isChefOrAdmin();
    this.loadUsers();
    this.loadGroupChats();
    // setInterval(() => this.loadMessages(), 60000);
  
    this.pollingSubscription = interval(3000).subscribe(() => {
      if (this.recipient) {
        this.fetchMessages(this.recipient);
      }
    });
    const email = localStorage.getItem('email');
    if (email) {
      this.myEmail = email;
    } else {
      // Optional: redirect to login or show error
      console.warn('User email not found in localStorage!');
    }
  

  }
  

  getMyUsername(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.myEmail = decodedToken.email || decodedToken.sub;
    }
  }

  connectToWebSocket(): void {
    const userId = parseInt(localStorage.getItem('userId') || '0', 10);
    const groupIds = this.userGroups.map(group => group.id);
    this.chatService.connectWebSocket(userId);

    this.chatService.onMessage().subscribe((msg: ChatMessage) => {
      const isCurrentChat =
        (msg.sender === this.recipient && msg.recipient === this.myEmail) ||
        (msg.sender === this.myEmail && msg.recipient === this.recipient);
    
      if (isCurrentChat) {
        this.messages.push({ ...msg, justArrived: true });
        this.shouldScroll = true;
      } else {
        // Optionally: notify user of a new message in another chat
        console.log('📩 New message received but not in current chat');
      }
    });

    setTimeout(() => {
      this.chatService.subscribeToTyping(this.myEmail, (message: IMessage) => {
        const data = JSON.parse(message.body);
        if (data.sender === this.recipient) {
          this.typingUser = data.sender;
          this.isTyping = true;
      
          clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            this.typingUser = null;
            this.shouldScroll = true; // trigger scroll after typing bubble disappears
          }, 4000);
        }
      });
    }, 2000);
    
    this.userGroups.forEach(group => {
      this.chatService.subscribeToGroupTopic(group.id, (msg: ChatMessage) => {
        if (msg.groupId === this.selectedGroupId) {
          this.messages.push({ ...msg, justArrived: true });
          this.shouldScroll = true;
        } else {
          console.log('📨 New group message in another group');
        }
      });
    });// Wait for WebSocket to connect
  }

  

  fetchMessages(recipient: string): void {
    this.chatService.getMessages(this.myEmail, recipient).subscribe((data) => {
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

  loadGroupChats(): void {
    this.chatService.getMyGroupChats().subscribe((chats) => {
      console.log('Fetched group chats:', chats);
      this.groupChats = chats;
      this.userGroups = chats;
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) 
      return;

    if (this.isSendingMessage) return; // Prevent duplicate sending
  
    if (this.selectedGroupId) {
      const groupMessage: GroupMessageRequest = {
        senderEmail: this.myEmail,
        content: this.newMessage
      };
      console.log(`📨 Sending to group ${this.selectedGroupId}`);
      // If it's a group message, send to group
      this.chatService.sendGroupMessage(this.selectedGroupId, groupMessage).subscribe(() => {
        // Push message to messages array and clear the input
        this.messages.push({
          ...groupMessage, justArrived: true,
          sender: this.myEmail,
          timestamp: new Date().toISOString()
        });
        this.newMessage = '';
        this.shouldScroll = true;
        this.isSendingMessage = false;
      });
    } else if (this.recipient) {
    // Construct the message object
    const message: ChatMessage = {
      sender: this.myEmail,
      content: this.newMessage,
      timestamp: new Date().toISOString(),
    };
      // If it's a private message, send to recipient
      message.recipient = this.recipient;
      console.log(`📨 Sending private message to ${this.recipient}`);
      this.chatService.sendMessage(message).subscribe(() => {
        // Push message to messages array and clear the input
        this.messages.push({ ...message, justArrived: true });
        this.newMessage = '';
        this.shouldScroll = true;
        this.isSendingMessage = false;  // Reset flag after sending
      }, err => {
        console.error('❌ Error sending private message:', err);
      });
    } else {
      console.warn('❌ No recipient or group selected');
    }
  }
  
  

  selectRecipient(user: string): void {
    this.recipient = user;
    this.selectedGroupId = null;
    this.messages = []; // Clear previous messages
    this.loadMessages();
  }

  selectGroup(groupId: number): void {
    this.selectedGroupId = groupId;
    this.recipient = null;
    this.messages = []; // Clear previous messages
    this.chatService.getGroupMessages(groupId).subscribe((msgs) => {
      // Filter out duplicate messages based on timestamp or a unique ID
      msgs.forEach((msg: ChatMessage) => {
        const messageExists = this.messages.some((m) => m.timestamp === msg.timestamp);
        if (!messageExists) {
          this.messages.push(msg);
        }
      });
      });
  
    this.chatService.subscribeToGroupTyping(groupId, (message: IMessage) => {
      const data = JSON.parse(message.body);
      if (data.sender !== this.myEmail) {
        this.typingUser = data.sender;
        this.isTyping = true;
  
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
          this.isTyping = false;
          this.typingUser = null;
        }, 4000);
      }
    });
  }

  
  

  onTyping(): void {
    if (this.recipient) {
      this.chatService.sendTypingNotification(this.myEmail, this.recipient);
    } else if (this.selectedGroupId) {
      this.chatService.sendGroupTypingNotification(this.myEmail, this.selectedGroupId);
    }
  }

  onScroll(): void {
    const container = this.messagesContainer.nativeElement;
    const threshold = 150; // pixels from bottom
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;
    this.isNearBottom = position > height - threshold;
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

  senderDisplayName(msg: ChatMessage): string {
    if (this.selectedGroupId) {
      return this.getUsernameByEmail(msg.sender);
    }
    return msg.sender === this.myEmail ? 'You' : this.getUsernameByEmail(msg.sender);
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

  createGroupChat(): void {
    const currentUserEmail = localStorage.getItem('userEmail') || '';
    const participantEmails = [currentUserEmail, ...this.selectedUserEmails];
  
    if (!this.groupName.trim() || participantEmails.length < 2) return;
  
    this.chatService.createGroupChat(this.groupName, participantEmails).subscribe({
      next: (response) => {
        console.log('✅ Group chat created successfully:', response); // 👈 Logs the result
        alert('Group chat created successfully!');
        this.groupName = '';
        this.selectedUserEmails = [];
        // this.loadGroupChats(); // Refresh group chat list
      },
      error: (error) => {
        console.error('❌ Failed to create group chat:', error); // 👈 Logs the error
        alert('Failed to create group chat!');
      }
    });
  }

  get typingUsersText(): string {
    return this.typingUsers.map(u => this.getUsernameByEmail(u)).join(', ');
  }

  getGroupNameById(groupId: number | null): string {
    const group = this.groupChats.find(g => g.id === groupId);
    return group ? group.name : '';
  }
  
}
