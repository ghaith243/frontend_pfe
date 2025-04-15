export interface ChatMessage {
    id?: number;
    sender: string;
    recipient: string;
    content: string;
    timestamp: string;
    justArrived?: boolean; // ✅ Add this line
  }
  