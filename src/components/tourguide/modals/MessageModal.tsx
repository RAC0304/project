import React, { useState, useRef, useContext } from "react";
import { BookingWithDetails } from "../../../services/bookingDetailsService";
import { sendMessage } from "../../../services/messageService";
import { AuthContext } from "../../../contexts/EnhancedAuthContext";

interface MessageModalProps {
  booking: BookingWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageSent?: (message: string) => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  booking,
  isOpen,
  onClose,
  onMessageSent,
}) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current user from AuthContext
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  if (!isOpen || !booking) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleClose = () => {
    setError(null);
    setMessage("");
    setFiles(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in to send messages");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {      // Send message using messageService
      const result = await sendMessage(
        Number(currentUser.id),
        Number(booking.user_id), // customer user_id from booking
        message,
        // We'll need to get tour_guide_id from booking or user profile
      );

      if (result.success) {
        // Reset form
        setMessage("");
        setFiles(null);

        // Call the callback to show success notification in parent
        if (onMessageSent) {
          onMessageSent(message);
        }        // Close modal
        handleClose();
      } else {
        setError(result.error || "Failed to send message");
      }
    } catch (error) {
      setError("An error occurred while sending the message");
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Send Message</h2>          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>        <div className="mb-4">
          <p className="text-gray-600">To: {booking.userName}</p>
          <p className="text-gray-600 text-sm">Booking: {booking.tourName}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              rows={5}
              placeholder="Type your message here..."
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <div className="flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                multiple
                disabled={isSubmitting}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center bg-gray-100 text-gray-700 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                Choose Files
              </label>
              <span className="ml-3 text-sm text-gray-500">
                {files
                  ? `${files.length} file(s) selected`
                  : "No files selected"}
              </span>
            </div>
            {files && files.length > 0 && (
              <div className="mt-2">
                <ul className="text-sm text-gray-600">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="truncate">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">            <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;
