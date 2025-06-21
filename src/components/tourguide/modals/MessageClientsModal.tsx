import React, { useState } from "react";
import { X, Send, MessageSquare, Users, Calendar, MapPin } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface MessageClientsModalProps {
  tour: {
    id: number;
    title: string;
    date: string;
    time: string;
    clients: number;
    location: string;
    status: "confirmed" | "pending" | "cancelled";
  } | null;
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  loading?: boolean;
}

const MessageClientsModal: React.FC<MessageClientsModalProps> = ({
  tour,
  isOpen,
  onClose,
  clients,
  loading = false,
}) => {
  const [message, setMessage] = useState("");
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleClientToggle = (clientId: number) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map((client) => client.id));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || selectedClients.length === 0) return;

    setIsSending(true);

    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);

      // Reset form after showing success
      setTimeout(() => {
        setMessage("");
        setSelectedClients([]);
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-gray-600">
            Your message has been sent to {selectedClients.length} client
            {selectedClients.length > 1 ? "s" : ""}.
          </p>
        </div>
      </div>
    );
  }

  if (!isOpen || !tour) return null;
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading clients...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Message Clients
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tour Information */}
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {tour.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(tour.date)} at {tour.time}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{tour.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{tour.clients} clients</span>
              </div>
            </div>
          </div>

          {/* Client Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">Select Recipients</h4>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-teal-600 hover:underline"
              >
                {selectedClients.length === clients.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {clients.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  No clients found for this tour.
                </div>
              ) : (
                clients.map((client) => (
                  <label
                    key={client.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleClientToggle(client.id)}
                      className="form-checkbox h-4 w-4 text-teal-600"
                    />
                    {client.avatar && (
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <span className="text-gray-900 text-sm">
                      {client.name || client.email}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {client.email}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Message Composition */}
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Message
              </label>
              <textarea
                id="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message to the clients..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/500 characters
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !message.trim() || selectedClients.length === 0 || isSending
                }
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageClientsModal;
