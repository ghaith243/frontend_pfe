export interface ChatMessage {
    id?: number;
    sender: string;
    recipient?: string;
    content: string;
    timestamp: string;
    justArrived?: boolean;
    groupId?: number; // ✅ Add this line
  }

  export interface GroupMessageRequest {
    senderEmail: string;  // Email of the sender
    content: string;      // Message content
  }
  