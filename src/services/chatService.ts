// src/services/chatService.ts
import { supabase } from "../utils/supabaseClient";

export type ChatMessage = {
  id: number;
  sender_id: number;
  receiver_id: number;
  tour_guide_id?: number;
  content: string;
  is_read: boolean;
  sent_at: string;
  // Join fields
  sender_name?: string;
  receiver_name?: string;
};

export const chatService = {
  async getMessages({
    userId,
    tourGuideId,
    bookingId,
  }: {
    userId: number;
    tourGuideId: number;
    bookingId: number;
  }): Promise<ChatMessage[]> {
    try {
      console.log(
        "[chatService.getMessages] Starting to fetch messages for conversation:",
        {
          userId,
          tourGuideId,
          bookingId,
        }
      );

      // Get conversation between user and tour guide
      const { data: messages, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:users!messages_sender_id_fkey(id, first_name, last_name, email),
          receiver:users!messages_receiver_id_fkey(id, first_name, last_name, email)
        `
        )
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${tourGuideId}),and(sender_id.eq.${tourGuideId},receiver_id.eq.${userId})`
        )
        .order("sent_at", { ascending: true });

      if (error) {
        console.error(
          "[chatService.getMessages] Error fetching conversation:",
          error
        );
        return [];
      }

      console.log(
        "[chatService.getMessages] Raw messages from database:",
        messages
      );

      // Map messages with sender and receiver names
      const messagesWithDetails: ChatMessage[] = messages.map(
        (msg: {
          id: number;
          sender_id: number;
          receiver_id: number;
          tour_guide_id?: number;
          content: string;
          is_read: boolean;
          sent_at: string;
          sender?: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
          };
          receiver?: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
          };
        }) => ({
          ...msg,
          sender_name: msg.sender
            ? `${msg.sender.first_name} ${msg.sender.last_name}`
            : "Unknown",
          receiver_name: msg.receiver
            ? `${msg.receiver.first_name} ${msg.receiver.last_name}`
            : "Unknown",
        })
      );

      console.log(
        "[chatService.getMessages] Mapped messages with details:",
        messagesWithDetails
      );
      return messagesWithDetails;
    } catch (error) {
      console.error("[chatService.getMessages] Unexpected error:", error);
      return [];
    }
  },

  async sendMessage({
    senderId,
    receiverId,
    tourGuideId,
    bookingId,
    content,
  }: {
    senderId: number;
    receiverId: number;
    tourGuideId?: number;
    bookingId?: number;
    content: string;
  }): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    try {
      console.log("[chatService.sendMessage] Sending message:", {
        senderId,
        receiverId,
        tourGuideId,
        bookingId,
        content,
      });

      // Prepare message data, only include tour_guide_id if it's valid
      const messageData: {
        sender_id: number;
        receiver_id: number;
        content: string;
        is_read: boolean;
        tour_guide_id?: number;
      } = {
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
        is_read: false,
      };

      // Only add tour_guide_id if it's a valid number > 0
      if (tourGuideId && tourGuideId > 0) {
        messageData.tour_guide_id = tourGuideId;
      }

      console.log("[chatService.sendMessage] Final message data:", messageData);

      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select(
          `
          *,
          sender:users!messages_sender_id_fkey(id, first_name, last_name, email),
          receiver:users!messages_receiver_id_fkey(id, first_name, last_name, email)
        `
        )
        .single();

      if (error) {
        console.error(
          "[chatService.sendMessage] Error sending message:",
          error
        );
        return { success: false, error: error.message };
      }

      console.log("[chatService.sendMessage] Message sent successfully:", data);

      // Map message with sender and receiver names
      const messageWithDetails: ChatMessage = {
        ...data,
        sender_name: data.sender
          ? `${data.sender.first_name} ${data.sender.last_name}`
          : "Unknown",
        receiver_name: data.receiver
          ? `${data.receiver.first_name} ${data.receiver.last_name}`
          : "Unknown",
      };

      return { success: true, message: messageWithDetails };
    } catch (error) {
      console.error("[chatService.sendMessage] Unexpected error:", error);
      return { success: false, error: "Failed to send message" };
    }
  },
};
