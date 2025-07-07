import React, { useState, useEffect } from 'react';
import { Calendar, Users, Mail, Phone, MessageSquare, CheckCircle, XCircle, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';
import { ItineraryRequest } from '../../services/itineraryBookingService';
import { updateRequestStatus, RequestStatus } from '../../services/itineraryWorkflowService';
import { useEnhancedAuth } from '../../contexts/useEnhancedAuth';

interface ItineraryRequestWithDetails extends Omit<ItineraryRequest, 'status'> {
    status: 'pending' | 'processing' | 'confirmed' | 'approved' | 'cancelled' | 'completed';
    itinerary?: {
        id: string;
        title: string;
        duration: string;
        image_url: string;
    };
    user?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

const ItineraryRequestsAdmin: React.FC = () => {
    const { user } = useEnhancedAuth();
    const [requests, setRequests] = useState<ItineraryRequestWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [confirmationModal, setConfirmationModal] = useState<{
        show: boolean;
        requestId: string;
        requestTitle: string;
        totalPrice: number;
        paymentDueDate: string;
        adminNotes: string;
        basePrice?: number;
        guidePrice?: number;
        days?: number;
        groupSize?: number;
    } | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError(null);


            const { data, error } = await supabase
                .from('itinerary_requests')
                .select(`
          *,
          itinerary:itineraries (
            id,
            title,
            duration,
            image_url
          ),
          user:user_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setRequests(data || []);
        } catch (err) {
            console.error('Error loading requests:', err);
            setError('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatusLocal = async (requestId: string, newStatus: RequestStatus, additionalData?: any) => {
        try {
            setUpdating(requestId);

            if (!user) {
                throw new Error('User not authenticated');
            }

            await updateRequestStatus(requestId, newStatus, user.id.toString(), undefined, additionalData);

            // Update local state
            setRequests(prev =>
                prev.map(req =>
                    req.id === requestId
                        ? { ...req, status: newStatus, updated_at: new Date().toISOString() }
                        : req
                )
            );

            // Reset confirmation modal
            setConfirmationModal(null);
        } catch (err) {
            console.error('Error updating request status:', err);
            setError('Failed to update request status');
        } finally {
            setUpdating(null);
        }
    };

    const handleConfirmRequest = (request: ItineraryRequestWithDetails) => {
        // Ambil jumlah hari dari kolom duration di tabel itineraries
        let days = 1;
        if (request.itinerary?.duration) {
            // Log untuk debug
            console.log('DURATION VALUE:', request.itinerary.duration);
            // Coba ambil angka pertama dari string duration (misal: "5 days" -> 5)
            const match = /^\s*(\d+)/.exec(request.itinerary.duration);
            if (match && parseInt(match[1], 10) > 0) {
                days = parseInt(match[1], 10);
            } else {
                // Jika format duration tidak sesuai, log error
                console.warn('DURATION FORMAT INVALID:', request.itinerary.duration);
            }
        } else {
            console.warn('NO DURATION FIELD ON ITINERARY:', request.itinerary);
        }
        const groupSize = parseInt(request.group_size) || 1;
        const basePricePerDay = 150;
        const guidePricePerDay = 50;
        const basePrice = days * groupSize * basePricePerDay;
        const guidePrice = days * guidePricePerDay;
        const estimatedPrice = basePrice + guidePrice;

        // Set payment due date (7 days from now)
        const paymentDueDate = new Date();
        paymentDueDate.setDate(paymentDueDate.getDate() + 7);

        setConfirmationModal({
            show: true,
            requestId: request.id,
            requestTitle: request.itinerary?.title || 'Trip Request',
            totalPrice: estimatedPrice,
            paymentDueDate: paymentDueDate.toISOString().split('T')[0],
            adminNotes: '',
            basePrice,
            guidePrice,
            days,
            groupSize
        });
    };

    const handleProcessRequest = async (requestId: string) => {
        await updateRequestStatusLocal(requestId, 'processing');
    };

    const handleRejectRequest = async (requestId: string) => {
        await updateRequestStatusLocal(requestId, 'cancelled');
    };

    const handleConfirmWithPrice = async () => {
        if (!confirmationModal) return;

        // Ambil data request yang sedang dikonfirmasi
        const request = requests.find(r => r.id === confirmationModal.requestId);
        if (!request || !request.itinerary) {
            setError('Request or itinerary data not found');
            return;
        }

        // Insert ke itinerary_bookings
        try {
            const { error: bookingError } = await supabase
                .from('itinerary_bookings')
                .insert({
                    itinerary_id: request.itinerary.id,
                    user_id: request.user_id,
                    tour_guide_id: request.tour_guide_id || null,
                    participants: parseInt(request.group_size) || 1,
                    start_date: request.start_date,
                    end_date: request.end_date,
                    total_price: confirmationModal.totalPrice,
                    currency: 'USD',
                    status: 'confirmed',
                    special_requests: request.additional_requests || '',
                    contact_email: request.email,
                    contact_phone: request.phone || '',
                });
            if (bookingError) {
                setError('Failed to create booking: ' + bookingError.message);
                return;
            }
        } catch (err) {
            setError('Failed to create booking');
            return;
        }

        const additionalData = {
            total_price: confirmationModal.totalPrice,
            payment_due_date: confirmationModal.paymentDueDate,
            admin_notes: confirmationModal.adminNotes || 'Request confirmed with pricing details'
        };

        await updateRequestStatusLocal(confirmationModal.requestId, 'confirmed', additionalData);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'processing':
                return <Clock className="w-4 h-4 text-blue-500" />;
            case 'confirmed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
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

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Itinerary Requests Management
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-32"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Itinerary Requests Management
                </h3>
                <button
                    onClick={loadRequests}
                    disabled={loading}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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

            {requests.length === 0 ? (
                <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No booking requests found</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-medium text-gray-900">
                                            {request.itinerary?.title || `Itinerary Request #${request.id}`}
                                        </h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </span>
                                        {getStatusIcon(request.status)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    <strong>Client:</strong> {request.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Mail className="w-4 h-4" />
                                                <span>{request.email}</span>
                                            </div>
                                            {request.phone && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{request.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    <strong>Dates:</strong> {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    <strong>Group Size:</strong> {request.group_size} travelers
                                                </span>
                                            </div>
                                            {request.itinerary?.duration && (
                                                <div className="text-xs text-gray-500">
                                                    Duration: {request.itinerary.duration}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {request.additional_requests && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="w-4 h-4 text-gray-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 mb-1">Special Requests:</p>
                                            <p className="text-sm text-gray-600">{request.additional_requests}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    <span>Submitted: {formatDate(request.created_at)}</span>
                                    {request.updated_at !== request.created_at && (
                                        <span className="ml-4">Updated: {formatDate(request.updated_at)}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Process Button - for pending requests */}
                                    {request.status === 'pending' && (
                                        <button
                                            onClick={() => handleProcessRequest(request.id)}
                                            disabled={updating === request.id}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                        >
                                            {updating === request.id ? 'Processing...' : 'Start Processing'}
                                        </button>
                                    )}

                                    {/* Confirm Button - for processing requests */}
                                    {request.status === 'processing' && (
                                        <button
                                            onClick={() => handleConfirmRequest(request)}
                                            disabled={updating === request.id}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                                        >
                                            {updating === request.id ? 'Confirming...' : 'Confirm & Set Price'}
                                        </button>
                                    )}

                                    {/* Reject Button - always available for non-cancelled requests */}
                                    {request.status !== 'cancelled' && (
                                        <button
                                            onClick={() => handleRejectRequest(request.id)}
                                            disabled={updating === request.id}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                                        >
                                            {updating === request.id ? 'Rejecting...' : 'Reject'}
                                        </button>
                                    )}

                                    {/* Status Info for confirmed/completed requests */}
                                    {(request.status === 'confirmed' || request.status === 'completed') && (
                                        <div className="text-xs text-green-600 font-medium">
                                            ✓ {request.status === 'confirmed' ? 'Confirmed' : 'Completed'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmationModal?.show && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmationModal(null)} />
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Confirm Trip Request
                        </h3>
                        <div className="space-y-4">
                            <p className="text-gray-700">
                                <strong>Trip:</strong> {confirmationModal.requestTitle}
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-2">
                                <div className="mb-2 text-sm text-gray-700 font-medium">Estimated Price</div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Base price ({confirmationModal.days} days × {confirmationModal.groupSize} travelers)</span>
                                    <span>${confirmationModal.basePrice?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Tour guide ({confirmationModal.days} days)</span>
                                    <span>${confirmationModal.guidePrice?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                                    <span>Total Estimated Cost</span>
                                    <span>${confirmationModal.totalPrice?.toLocaleString() || 0}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">* This is an estimated price. Final pricing will be confirmed after consultation.</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Due Date</label>
                                <input
                                    type="date"
                                    value={confirmationModal.paymentDueDate}
                                    onChange={(e) => setConfirmationModal(prev => prev ? { ...prev, paymentDueDate: e.target.value } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                                <textarea
                                    value={confirmationModal.adminNotes}
                                    onChange={(e) => setConfirmationModal(prev => prev ? { ...prev, adminNotes: e.target.value } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    rows={3}
                                    placeholder="Additional notes for the customer..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setConfirmationModal(null)}
                                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmWithPrice}
                                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold"
                                >
                                    Confirm & Set Price
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItineraryRequestsAdmin;
