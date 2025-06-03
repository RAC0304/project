import React, { useState } from "react";
import { Booking } from "../../../types/tourguide";
import { formatCurrency } from "../../../utils/statusHelpers";
import Toast from "../../common/Toast";

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (
    bookingId: string,
    newStatus: "confirmed" | "cancelled"
  ) => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const [toast, setToast] = useState({
    isVisible: false,
    type: "success" as const,
    message: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !booking) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status color for UI display
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      case "completed":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Handlers for accepting or rejecting bookings
  const handleAccept = () => {
    if (!booking || !onStatusUpdate) return;
    setIsProcessing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      onStatusUpdate(booking.id, "confirmed");
      setToast({
        isVisible: true,
        type: "success",
        message: `Pemesanan wisata ${booking.tourName} dari ${booking.userName} telah berhasil diterima!`,
      });
      setIsProcessing(false);
    }, 500);
  };

  const handleReject = () => {
    if (!booking || !onStatusUpdate) return;
    setIsProcessing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      onStatusUpdate(booking.id, "cancelled");
      setToast({
        isVisible: true,
        type: "success",
        message: `Pemesanan wisata ${booking.tourName} dari ${booking.userName} telah ditolak`,
      });
      setIsProcessing(false);
    }, 500);
  };

  return (
    <>
      <Toast
        isVisible={toast.isVisible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Booking Details
            </h2>
            <button
              onClick={onClose}
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
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700">Tour Information</h3>
              <p className="text-gray-600">Tour Name: {booking.tourName}</p>
              <p className="text-gray-600">Date: {formatDate(booking.date)}</p>
              <p className="text-gray-600">
                Status:{" "}
                <span
                  className={`font-medium ${getStatusColor(booking.status)}`}
                >
                  {booking.status}
                </span>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                Client Information
              </h3>
              <p className="text-gray-600">Name: {booking.userName}</p>
              <p className="text-gray-600">Email: {booking.userEmail}</p>
              <p className="text-gray-600">Phone: {booking.userPhone}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">
              Booking Details
            </h3>
            <p className="text-gray-600">
              Number of Participants: {booking.participants}
            </p>
            <p className="text-gray-600">
              Total Amount: {formatCurrency(booking.totalAmount)}
            </p>
            <p className="text-gray-600">
              Payment Status: {booking.paymentStatus}
            </p>
          </div>

          {booking.specialRequests && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">
                Special Requests
              </h3>
              <p className="text-gray-600">{booking.specialRequests}</p>
            </div>
          )}

          <div className="mt-6 border-t pt-4 flex justify-between">
            {" "}
            {/* Action buttons for pending bookings */}
            {booking.status === "pending" && onStatusUpdate && (
              <div className="flex space-x-2">
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Tolak Pemesanan
                  {isProcessing && <span className="ml-2 animate-spin">⟳</span>}
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Terima Pemesanan
                  {isProcessing && <span className="ml-2 animate-spin">⟳</span>}
                </button>
              </div>
            )}{" "}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingDetailsModal;
