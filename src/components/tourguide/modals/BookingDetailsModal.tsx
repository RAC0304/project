import React from 'react';
import { Booking } from '../../../types/tourguide';
import { formatCurrency } from '../../../utils/statusHelpers';

interface BookingDetailsModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, isOpen, onClose }) => {
    if (!isOpen || !booking) return null;

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get status color for UI display
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed": return "text-green-600";
            case "pending": return "text-yellow-600";
            case "cancelled": return "text-red-600";
            case "completed": return "text-blue-600";
            default: return "text-gray-600";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-700">Tour Information</h3>
                        <p className="text-gray-600">Tour Name: {booking.tourName}</p>
                        <p className="text-gray-600">Date: {formatDate(booking.date)}</p>
                        <p className="text-gray-600">Status: <span className="font-medium">{booking.status}</span></p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-700">Client Information</h3>
                        <p className="text-gray-600">Name: {booking.userName}</p>
                        <p className="text-gray-600">Email: {booking.userEmail}</p>
                        <p className="text-gray-600">Phone: {booking.userPhone}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Booking Details</h3>
                    <p className="text-gray-600">Number of Participants: {booking.participants}</p>
                    <p className="text-gray-600">Total Amount: {formatCurrency(booking.totalAmount)}</p>
                    <p className="text-gray-600">Payment Status: {booking.paymentStatus}</p>
                </div>

                {booking.specialRequests && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-2">Special Requests</h3>
                        <p className="text-gray-600">{booking.specialRequests}</p>
                    </div>
                )}

                <div className="mt-6 border-t pt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsModal;
