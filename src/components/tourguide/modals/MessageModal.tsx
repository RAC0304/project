import React, { useState } from 'react';
import { Booking } from '../../../types/tourguide';

interface MessageModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ booking, isOpen, onClose }) => {
    const [message, setMessage] = useState('');

    if (!isOpen || !booking) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement message sending functionality
        console.log('Sending message to:', booking.userName, 'Message:', message);
        setMessage('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Send Message</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-gray-600">To: {booking.userName}</p>
                    <p className="text-gray-600 text-sm">Booking: {booking.tourName}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            rows={5}
                            placeholder="Type your message here..."
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                            Send Message
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MessageModal;
