import { supabase } from "../config/supabaseClient";

export interface Message {
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
}

export interface MessageWithDetails extends Message {
    sender_name: string;
    receiver_name: string;
}

// Send a new message
export async function sendMessage(
    senderId: number,
    receiverId: number,
    content: string,
    tourGuideId?: number
): Promise<{ success: boolean; error?: string; message?: Message }> {
    try {
        const { data, error } = await supabase
            .from("messages")
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                tour_guide_id: tourGuideId,
                content: content,
                is_read: false,
            })
            .select()
            .single();

        if (error) {
            console.error("Error sending message:", error);
            return { success: false, error: error.message };
        }

        return { success: true, message: data };
    } catch (error) {
        console.error("Error sending message:", error);
        return { success: false, error: "Failed to send message" };
    }
}

// Get messages for a tour guide (both sent and received)
export async function getMessagesForTourGuide(
    tourGuideUserId: number
): Promise<{ messages: MessageWithDetails[]; error?: string }> {
    try {
        // Get messages where user is sender or receiver
        const { data: messages, error } = await supabase
            .from("messages")
            .select(`
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, email),
        receiver:users!messages_receiver_id_fkey(id, first_name, last_name, email)
      `)
            .or(`sender_id.eq.${tourGuideUserId},receiver_id.eq.${tourGuideUserId}`)
            .order("sent_at", { ascending: false });

        if (error) {
            console.error("Error fetching messages:", error);
            return { messages: [], error: error.message };
        }

        // Map messages with sender and receiver names
        const messagesWithDetails: MessageWithDetails[] = messages.map((msg: any) => ({
            ...msg,
            sender_name: msg.sender ? `${msg.sender.first_name} ${msg.sender.last_name}` : 'Unknown',
            receiver_name: msg.receiver ? `${msg.receiver.first_name} ${msg.receiver.last_name}` : 'Unknown',
        }));

        return { messages: messagesWithDetails };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { messages: [], error: "Failed to fetch messages" };
    }
}

// Get conversation between two users
export async function getConversation(
    userId1: number,
    userId2: number
): Promise<{ messages: MessageWithDetails[]; error?: string }> {
    try {
        const { data: messages, error } = await supabase
            .from("messages")
            .select(`
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, email),
        receiver:users!messages_receiver_id_fkey(id, first_name, last_name, email)
      `)
            .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
            .order("sent_at", { ascending: true });

        if (error) {
            console.error("Error fetching conversation:", error);
            return { messages: [], error: error.message };
        }

        // Map messages with sender and receiver names
        const messagesWithDetails: MessageWithDetails[] = messages.map((msg: any) => ({
            ...msg,
            sender_name: msg.sender ? `${msg.sender.first_name} ${msg.sender.last_name}` : 'Unknown',
            receiver_name: msg.receiver ? `${msg.receiver.first_name} ${msg.receiver.last_name}` : 'Unknown',
        }));

        return { messages: messagesWithDetails };
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return { messages: [], error: "Failed to fetch conversation" };
    }
}

// Mark message as read
export async function markMessageAsRead(messageId: number): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("id", messageId);

        if (error) {
            console.error("Error marking message as read:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error marking message as read:", error);
        return { success: false, error: "Failed to mark message as read" };
    }
}

// Get unread message count for a user
export async function getUnreadMessageCount(userId: number): Promise<{ count: number; error?: string }> {
    try {
        const { count, error } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", userId)
            .eq("is_read", false);

        if (error) {
            console.error("Error getting unread count:", error);
            return { count: 0, error: error.message };
        }

        return { count: count || 0 };
    } catch (error) {
        console.error("Error getting unread count:", error);
        return { count: 0, error: "Failed to get unread count" };
    }
}
