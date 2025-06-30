// src/services/chatService.ts
// Minimal stub to resolve import error. Replace with your actual implementation.

export type ChatMessage = {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_at: string;
};

export const chatService = {
  async getMessages({ userId, tourGuideId, bookingId }: { userId: number; tourGuideId: number; bookingId: number; }): Promise<ChatMessage[]> {
    // TODO: Implement actual Supabase fetch logic
    return [];
  },
  async sendMessage({ senderId, receiverId, tourGuideId, bookingId, content }: { senderId: number; receiverId: number; tourGuideId: number; bookingId: number; content: string; }): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    // TODO: Implement actual Supabase send logic
    return { success: true, message: { id: Date.now(), sender_id: senderId, receiver_id: receiverId, content, sent_at: new Date().toISOString() } };
  }
};
