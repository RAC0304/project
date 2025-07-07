import React, { useEffect, useState } from "react";
import { AlertCircle, Calendar, DollarSign, Clock, XCircle, Info } from "lucide-react";
import { getUserItineraryRequests } from "../../services/itineraryBookingService";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { isItineraryBookingPaid } from '../../services/paymentStatusService';

interface TripRequestsNotificationProps {
    userId: string;
    onPayNow?: (booking: {
        id?: number;
        itineraryBookingId?: number;
        title: string;
        amount: number;
        participants: number;
        source?: 'bookings' | 'itinerary_bookings';
    }) => void;
}

const TripRequestsNotification: React.FC<TripRequestsNotificationProps> = ({ userId, onPayNow }) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('Fetching itinerary requests for user:', userId);
                const data = await getUserItineraryRequests(userId);
                console.log('Fetched itinerary requests:', data);
                setRequests(data);
            } catch (err) {
                setError("Failed to load trip requests");
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchRequests();
    }, [userId]);

    // Filter requests based on status and payment info
    // Improved: Use itinerary_booking for payment info if available
    const getRequestStatus = (request: any) => {
        if (request.status === 'cancelled') return 'cancelled';
        if (request.status === 'completed') return 'completed';
        if (request.payment_status === 'paid') return 'paid';
        if (request.payment_due_date && new Date(request.payment_due_date) < new Date()) return 'expired';
        // Use itinerary_booking.total_price if available
        if (request.status === 'confirmed' && (request.itinerary_booking?.total_price || request.amount)) return 'awaiting_payment';
        return 'pending';
    };

    const sortedRequests = [...requests].sort((a, b) => {
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    });

    // Helper: check payment status in payments table for itinerary_booking
    const [paidBookingIds, setPaidBookingIds] = useState<number[]>([]);

    // Perbaiki status: jika sudah ada payment completed di payments table, status = 'paid'
    const requestsWithStatus = React.useMemo(() => {
        return sortedRequests.map(req => {
            const amount = req.itinerary_booking?.total_price ?? req.amount;
            const currency = req.itinerary_booking?.currency ?? req.currency ?? 'IDR';
            const payment_due_date = req.payment_due_date;
            const isPaid = req.itinerary_booking?.id && paidBookingIds.includes(Number(req.itinerary_booking.id));
            return {
                ...req,
                amount,
                currency,
                status: isPaid ? 'paid' : getRequestStatus({ ...req, amount }),
                formattedDueDate: payment_due_date
                    ? format(new Date(payment_due_date), 'dd MMMM yyyy HH:mm', { locale: id })
                    : null
            };
        });
    }, [sortedRequests, paidBookingIds]);

    useEffect(() => {
        // After requests loaded, check payment status in payments table for each itinerary_booking
        const checkPayments = async () => {
            if (!requests.length) return;
            const ids = requests
                .map(r => r.itinerary_booking?.id)
                .filter(Boolean);
            const paidIds: number[] = [];
            for (const id of ids) {
                if (await isItineraryBookingPaid(id)) {
                    paidIds.push(Number(id));
                }
            }
            setPaidBookingIds(paidIds);
        };
        checkPayments();
    }, [requests]);

    if (loading) return null;
    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">
                        Gagal memuat data permintaan perjalanan
                    </span>
                </div>
            </div>
        );
    }

    // Only show notification if there is a request with status awaiting_payment or expired (not paid)
    const firstPendingRequest = requestsWithStatus.find(r => ['awaiting_payment', 'expired'].includes(r.status));
    if (!firstPendingRequest) return null;

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="bg-teal-600 px-4 py-3">
                <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-white mr-2" />
                    <h3 className="text-white font-medium">Pembayaran Menunggu</h3>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-gray-500" />
                        </div>
                    </div>
                    <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-medium text-gray-900">
                                {firstPendingRequest?.itineraries?.title || 'Perjalanan Anda'}
                            </h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Menunggu Pembayaran
                            </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            <p>Segera selesaikan pembayaran sebelum batas waktu yang ditentukan</p>
                        </div>
                        <div className="mt-3">
                            <div className="flex items-center text-sm">
                                <span className="text-gray-500">Total Pembayaran:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                    {firstPendingRequest?.amount
                                        ? `${firstPendingRequest.currency === 'USD' ? '$' : 'Rp'} ${Number(firstPendingRequest.amount).toLocaleString(firstPendingRequest.currency === 'USD' ? 'en-US' : 'id-ID')}`
                                        : 'Menunggu konfirmasi'}
                                </span>
                            </div>
                            {firstPendingRequest?.formattedDueDate && (
                                <div className="mt-1 flex items-center text-sm">
                                    <span className="text-gray-500">Batas Waktu:</span>
                                    <span className="ml-2 font-medium text-yellow-600">
                                        {firstPendingRequest.formattedDueDate}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    const req = firstPendingRequest;
                                    const amount = req.itinerary_booking?.total_price ?? req.amount ?? 0;
                                    if (onPayNow) {
                                        onPayNow({
                                            itineraryBookingId: Number(req.itinerary_booking?.id || req.id),
                                            title: req.itineraries?.title || 'Perjalanan Anda',
                                            amount: Number(amount) || 0,
                                            participants: req.group_size || 1,
                                            // @ts-ignore: currency is used by UserProfilePage for payment modal
                                            currency: req.currency,
                                            source: 'itinerary_bookings',
                                        });
                                    }
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                Bayar Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripRequestsNotification;
