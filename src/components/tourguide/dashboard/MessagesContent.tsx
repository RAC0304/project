import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../utils/supabaseClient";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    initials: string;
    time: string;
  };
  preview: string;
  isUnread?: boolean;
  messages: {
    content: string;
    timestamp: string;
    isFromGuide: boolean;
  }[];
}

interface MessagesContentProps {
  tourGuideId: string;
}

const MessagesContent: React.FC<MessagesContentProps> = ({ tourGuideId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [refresh, setRefresh] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change or selectedMessage changes
  useEffect(() => {
    if (selectedMessage) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedMessage, selectedMessage?.messages]);

  // Gunakan kembali prop tourGuideId agar dinamis
  const effectiveTourGuideId = tourGuideId;

  useEffect(() => {
    const fetchMessages = async () => {
      console.log(
        "🔍 Fetching messages for tourGuideId:",
        effectiveTourGuideId
      );
      setIsLoading(true);

      // First get the user_id for this tour guide
      const { data: tourGuideData, error: tourGuideError } = await supabase
        .from("tour_guides")
        .select("user_id")
        .eq("id", effectiveTourGuideId)
        .single();

      if (tourGuideError || !tourGuideData) {
        console.error("❌ Error fetching tour guide user_id:", tourGuideError);
        setMessages([]);
        setIsLoading(false);
        return;
      }

      const tourGuideUserId = tourGuideData.user_id;
      console.log("✅ Found tour guide user_id:", tourGuideUserId);

      // Fetch all messages where the tour guide is either sender or receiver
      // This will show complete conversations
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          id,
          sender_id,
          receiver_id,
          tour_guide_id,
          content,
          is_read,
          sent_at,
          sender:sender_id (id, first_name, last_name),
          receiver:receiver_id (id, first_name, last_name),
          tour_guide:tour_guide_id (
            user_id,
            user:user_id (
              id,
              first_name,
              last_name
            )
          )
        `
        )
        .or(`sender_id.eq.${tourGuideUserId},receiver_id.eq.${tourGuideUserId}`)
        .order("sent_at", { ascending: false });

      console.log("📊 Supabase query result:", { data, error });

      if (error) {
        console.error("❌ Error fetching messages:", error);
        setMessages([]);
      } else {
        console.log("✅ Raw data from Supabase:", data);
        console.log("📝 Data length:", data?.length || 0);

        // Group by conversation partner (the other person in the conversation)
        const grouped: { [key: string]: Message } = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((data as any[]) || []).forEach((msg, index) => {
          console.log(`🔄 Processing message ${index + 1}:`, msg);

          // Determine who the conversation partner is
          const isFromTourGuide = msg.sender_id === tourGuideUserId;
          const conversationPartner = isFromTourGuide
            ? msg.receiver
            : msg.sender;
          const conversationPartnerId =
            conversationPartner?.id?.toString() || "";

          console.log("👤 Conversation partner:", conversationPartner);
          console.log("🆔 Conversation partner ID:", conversationPartnerId);
          console.log("📤 Is from tour guide:", isFromTourGuide);

          if (!grouped[conversationPartnerId]) {
            const messageGroup = {
              id: msg.id.toString(),
              sender: {
                id: conversationPartnerId,
                name:
                  (conversationPartner?.first_name || "") +
                  " " +
                  (conversationPartner?.last_name || ""),
                initials:
                  (conversationPartner?.first_name?.[0] || "") +
                  (conversationPartner?.last_name?.[0] || ""),
                time:
                  new Date(msg.sent_at).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }) + " WIB",
              },
              preview: msg.content?.slice(0, 60) + "...",
              isUnread: !msg.is_read && !isFromTourGuide, // Only mark as unread if it's TO the tour guide
              messages: [],
            };
            console.log(
              "📁 Creating new group for partner:",
              conversationPartnerId,
              messageGroup
            );
            grouped[conversationPartnerId] = messageGroup;
          }

          const messageItem = {
            content: msg.content,
            timestamp:
              new Date(msg.sent_at).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }) + " WIB",
            isFromGuide: isFromTourGuide,
          };
          console.log("➕ Adding message to group:", messageItem);
          grouped[conversationPartnerId].messages.push(messageItem);
        });

        // Sort messages in each conversation by timestamp (newest at bottom)
        Object.values(grouped).forEach((conversation) => {
          conversation.messages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

        const finalMessages = Object.values(grouped);
        console.log("🎯 Final grouped messages:", finalMessages);
        console.log("📊 Final messages count:", finalMessages.length);

        setMessages(finalMessages);
      }
      setIsLoading(false);
      console.log("✅ Fetch messages completed");
    };
    if (effectiveTourGuideId) {
      console.log(
        "🚀 Starting fetch messages with tourGuideId:",
        effectiveTourGuideId
      );
      fetchMessages();
    } else {
      console.log("⚠️ No tourGuideId provided");
    }
  }, [effectiveTourGuideId, refresh]);

  // Action kirim pesan ke Supabase
  const handleReply = async () => {
    console.log("📤 Sending reply...");
    console.log("Selected message:", selectedMessage);
    console.log("Reply text:", replyText);

    if (!selectedMessage || !replyText.trim()) {
      console.log("⚠️ No selected message or empty reply text");
      return;
    }

    const receiverId = selectedMessage.sender.id;
    console.log("👤 Receiver ID:", receiverId);

    if (!receiverId) {
      console.log("❌ No receiver ID found");
      return;
    }

    // We need to get the user_id of the tour guide to use as sender_id
    // The effectiveTourGuideId is the tour guide ID, but we need the user_id
    console.log("🔍 Getting user_id for tour guide ID:", effectiveTourGuideId);

    const { data: tourGuideData, error: tourGuideError } = await supabase
      .from("tour_guides")
      .select("user_id")
      .eq("id", effectiveTourGuideId)
      .single();

    if (tourGuideError || !tourGuideData) {
      console.error("❌ Error fetching tour guide user_id:", tourGuideError);
      alert("Failed to send message: Could not find tour guide information");
      return;
    }

    console.log("✅ Found tour guide user_id:", tourGuideData.user_id);

    // Sesuai struktur tabel: sender_id, receiver_id, tour_guide_id, content, is_read, sent_at (auto)
    const messageData = {
      sender_id: Number(tourGuideData.user_id), // user_id from tour_guides table
      receiver_id: Number(receiverId),
      tour_guide_id: Number(effectiveTourGuideId), // tour guide ID
      content: replyText,
      is_read: false,
    };
    console.log("📨 Sending message data:", messageData);

    const { error } = await supabase.from("messages").insert([messageData]);

    if (error) {
      console.error("❌ Error sending message:", error);
      console.error("❌ Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      alert(`Failed to send message: ${error.message || "Unknown error"}`);
    } else {
      console.log("✅ Message sent successfully");
      setReplyText("");
      setRefresh((r) => r + 1);
      // Scroll to bottom after sending message
      setTimeout(scrollToBottom, 200);
    }
  };

  const displayMessages = messages.length > 0 ? messages : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-t-2 border-teal-600 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header and Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          {/* Header */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">
              Manage communications with your clients and respond to inquiries
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-10 pr-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="important">Important</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-200">
          {/* Messages List */}
          <div className="divide-y divide-gray-200">
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer ${
                  selectedMessage?.id === message.id ? "bg-gray-50" : ""
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                      {message.sender.initials}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        {message.sender.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {message.sender.time}
                      </div>
                    </div>
                  </div>
                  {message.isUnread && (
                    <div className="flex items-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Unread
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-13">
                  <p className="text-gray-700">{message.preview}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Detail */}
          <div className="h-[calc(100vh-12rem)] flex flex-col">
            {selectedMessage ? (
              <>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Conversation
                  </h3>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                      {selectedMessage.sender.initials}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        {selectedMessage.sender.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedMessage.sender.time}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedMessage.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.isFromGuide ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.isFromGuide
                            ? "bg-teal-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.isFromGuide ? "text-teal-100" : "text-gray-500"
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Invisible div to scroll to */}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleReply}
                      className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a message to view the conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesContent;

/*
  Penting:
  - tourGuideId di sini HARUS user_id (dari tabel users),
    karena messages.sender_id = users.id
  - Jika parent mengambil dari tabel tour_guides,
    ambil field user_id-nya, bukan id-nya
  Contoh:
    const tourGuideUserId = tourGuide.user_id;
    <MessagesContent tourGuideId={tourGuideUserId} />
*/
