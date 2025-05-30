import React from 'react';
import { X, Calendar, MapPin, Users, Clock } from 'lucide-react';

interface TourDetailsModalProps {
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
}

const TourDetailsModal: React.FC<TourDetailsModalProps> = ({ tour, isOpen, onClose }) => {
    if (!isOpen || !tour) return null;

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
            case "confirmed": return "bg-green-100 text-green-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Tour Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Tour Header */}
                    <div className="bg-teal-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{tour.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tour.status)}`}>
                                {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">Tour ID: #{tour.id}</p>
                    </div>

                    {/* Tour Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-teal-600" />
                                <div>
                                    <div className="text-sm text-gray-500">Date</div>
                                    <div className="font-medium">{formatDate(tour.date)}</div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Clock className="w-5 h-5 text-teal-600" />
                                <div>
                                    <div className="text-sm text-gray-500">Time</div>
                                    <div className="font-medium">{tour.time}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-teal-600" />
                                <div>
                                    <div className="text-sm text-gray-500">Location</div>
                                    <div className="font-medium">{tour.location}</div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Users className="w-5 h-5 text-teal-600" />
                                <div>
                                    <div className="text-sm text-gray-500">Participants</div>
                                    <div className="font-medium">{tour.clients} clients</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Tour Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className="ml-2 font-medium">{tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Tour Type:</span>
                                <span className="ml-2 font-medium">Group Tour</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Duration:</span>
                                <span className="ml-2 font-medium">Full Day</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Language:</span>
                                <span className="ml-2 font-medium">English, Indonesian</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                            <Users className="w-4 h-4" />
                            <span>Manage Participants</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Calendar className="w-4 h-4" />
                            <span>Edit Schedule</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <MapPin className="w-4 h-4" />
                            <span>View Location</span>
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourDetailsModal;
