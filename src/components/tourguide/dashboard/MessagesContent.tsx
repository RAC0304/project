import React, { useState, useEffect } from "react";

interface Message {
  id: string;
  sender: {
    name: string;
    initials: string;
    time: string;
  };
  subject: string;
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

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/messages/${tourGuideId}`);
        const data = await res.json();
        // Transform Supabase data to Message[]
        const transformed: Message[] = (data || []).map((msg: any) => ({
          id: msg.id.toString(),
          sender: {
            name:
              msg.sender?.first_name + " " + msg.sender?.last_name || "Unknown",
            initials:
              (msg.sender?.first_name?.[0] || "") +
              (msg.sender?.last_name?.[0] || ""),
            time: new Date(msg.sent_at).toLocaleString(),
          },
          subject: msg.subject || "No Subject",
          preview: msg.content?.slice(0, 60) + "...",
          isUnread: !msg.is_read,
          messages: [
            {
              content: msg.content,
              timestamp: new Date(msg.sent_at).toLocaleString(),
              isFromGuide: msg.sender_id === Number(tourGuideId),
            },
          ],
        }));
        setMessages(transformed);
      } catch (e) {
        setMessages([]);
      }
      setIsLoading(false);
    };
    if (tourGuideId) fetchMessages();
  }, [tourGuideId]);

  const handleReply = () => {
    if (!selectedMessage || !replyText.trim()) return;

    const updatedMessages = messages.length > 0 ? [...messages] : [];
    const messageIndex = updatedMessages.findIndex(
      (m) => m.id === selectedMessage.id
    );

    if (messageIndex !== -1) {
      updatedMessages[messageIndex].messages.push({
        content: replyText,
        timestamp: "Just now",
        isFromGuide: true,
      });
      setSelectedMessage(updatedMessages[messageIndex]);
      setReplyText("");
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
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>{message.subject}</strong>
                  </p>
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
                    {selectedMessage.subject}
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
