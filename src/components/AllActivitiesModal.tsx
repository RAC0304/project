import React from 'react';
import { X, CreditCard } from 'lucide-react';
import { ActivityItem } from '../services/userActivityService';

interface AllActivitiesModalProps {
    activities: ActivityItem[];
    isOpen: boolean;
    onClose: () => void;
    isLoading?: boolean;
    onPayNow?: (booking: { id: number; title: string; amount: number; participants: number }) => void;
}

const AllActivitiesModal: React.FC<AllActivitiesModalProps> = ({
    activities,
    isOpen,
    onClose,
    isLoading = false,
    onPayNow
}) => {
    if (!isOpen) return null;

    // Group activities by date for better organization
    const groupedActivities = activities.reduce((groups, activity) => {
        const date = new Date(activity.timestamp).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(activity);
        return groups;
    }, {} as Record<string, ActivityItem[]>);

    const sortedDates = Object.keys(groupedActivities).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">All Activities</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Complete history of your bookings, messages, and tour requests
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            <span className="ml-3 text-gray-600">Loading activities...</span>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-300 text-5xl mb-4">📝</div>
                            <h3 className="text-gray-700 text-lg font-medium mb-2">No activities found</h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                Start exploring and booking tours to build your activity history!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {sortedDates.map((date) => (
                                <div key={date}>
                                    {/* Date Header */}
                                    <div className="flex items-center mb-4">
                                        <div className="flex-shrink-0">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {new Date(date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </h3>
                                        </div>
                                        <div className="flex-1 ml-4 border-t border-gray-200"></div>
                                    </div>

                                    {/* Activities for this date */}
                                    <div className="space-y-3">
                                        {groupedActivities[date].map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3 flex-1">
                                                        <div className="flex-shrink-0 text-2xl">
                                                            {activity.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                    {activity.title}
                                                                </h4>
                                                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                                    {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {activity.description}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.type === 'booking' ? 'bg-blue-100 text-blue-800' :
                                                                        activity.type === 'message' ? 'bg-green-100 text-green-800' :
                                                                            activity.type === 'tour_request' ? 'bg-indigo-100 text-indigo-800' :
                                                                                'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {activity.type === 'booking' ? 'Booking' :
                                                                        activity.type === 'message' ? 'Message' :
                                                                            activity.type === 'tour_request' ? 'Tour Request' :
                                                                                activity.type}
                                                                </span>

                                                                {/* Additional details based on activity type */}
                                                                <div className="flex items-center">
                                                                    {activity.details && (
                                                                        <div className="text-xs text-gray-500">
                                                                            {activity.type === 'booking' && activity.details.status && (
                                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${activity.details.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                                                        activity.details.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                            activity.details.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                                                'bg-gray-100 text-gray-800'
                                                                                    }`}>
                                                                                    {activity.details.status}
                                                                                </span>
                                                                            )}
                                                                            {activity.type === 'tour_request' && activity.details.status && (
                                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${activity.details.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                                        activity.details.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                            activity.details.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                                                'bg-gray-100 text-gray-800'
                                                                                    }`}>
                                                                                    {activity.details.status}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Pay Now button for confirmed bookings */}
                                                                    {onPayNow &&
                                                                        activity.type === 'booking' &&
                                                                        activity.details?.status === 'confirmed' &&
                                                                        activity.details?.paymentStatus === 'pending' && (
                                                                            <button
                                                                                onClick={() => onPayNow({
                                                                                    id: activity.details.bookingId,
                                                                                    title: activity.details.tourTitle,
                                                                                    amount: activity.details.amount,
                                                                                    participants: activity.details.participants
                                                                                })}
                                                                                className="ml-2 inline-flex items-center px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded transition-colors"
                                                                            >
                                                                                <CreditCard className="w-3 h-3 mr-1" />
                                                                                Pay Now
                                                                            </button>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && activities.length > 0 && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Total activities: {activities.length}</span>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllActivitiesModal;
