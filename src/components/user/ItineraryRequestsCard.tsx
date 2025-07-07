import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEnhancedAuth } from '../../contexts/useEnhancedAuth';
import { getUserItineraryRequests } from '../../services/itineraryBookingService';
import { ItineraryRequest } from '../../services/itineraryBookingService';

const ItineraryRequestsCard: React.FC = () => {
    const { user, isLoggedIn } = useEnhancedAuth();
    const [requests, setRequests] = useState<ItineraryRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoggedIn && user) {
            loadRequests();
        }
    }, [isLoggedIn, user]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getUserItineraryRequests(user!.id.toString());
            setRequests(data);
        } catch (err) {
            console.error('Error loading itinerary requests:', err);
            setError('Failed to load your booking requests');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!isLoggedIn) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Your Itinerary Requests
                </h3>
                <div className="text-center py-8">
                    <p className="text-gray-600">Please log in to view your booking requests.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    Your Itinerary Requests
                </h3>
                <button
                    onClick={loadRequests}
                    disabled={loading}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-24"></div>
                        </div>
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">No booking requests yet</p>
                    <p className="text-sm text-gray-500">
                        Start planning your next adventure by browsing our itineraries!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 mb-1">
                                        {/* You might want to join with itinerary data to show title */}
                                        Itinerary Request #{request.id}
                                    </h4>
                                    <div className="flex items-center text-sm text-gray-600 gap-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {request.group_size} travelers
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                    {getStatusIcon(request.status)}
                                </div>
                            </div>

                            {request.additional_requests && (
                                <div className="text-sm text-gray-600 mb-3">
                                    <strong>Special requests:</strong> {request.additional_requests}
                                </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Submitted: {formatDate(request.created_at)}</span>
                                <span>Last updated: {formatDate(request.updated_at)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ItineraryRequestsCard;
