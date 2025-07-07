import React, { useEffect, useState } from "react";
import { AlertCircle, Calendar, DollarSign } from "lucide-react";
import { getUserItineraryRequests } from "../../services/itineraryBookingService";

interface TripRequestsNotificationProps {
    userId: string;
    onPayNow?: (booking: {
        id: number;
        title: string;
        amount: number;
        participants: number;
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
                const data = await getUserItineraryRequests(userId);
                setRequests(data);
            } catch (err) {
                setError("Failed to load trip requests");
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchRequests();
    }, [userId]);

    // Only show confirmed requests with price info
    const confirmed = requests.filter(
        (r) => r.status === "confirmed" && r.total_price
    );

    if (loading) return null;
    if (error || confirmed.length === 0) return null;

    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="font-semibold text-yellow-800">
                    Trip Confirmation & Payment Info
                </span>
            </div>
            {confirmed.map((req) => (
                <div key={req.id} className="mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                            {req.itineraries?.title || `Trip #${req.id}`}: {req.start_date} - {req.end_date}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-green-700">
                            {req.total_price ? `Total: ${Number(req.total_price).toLocaleString()} ${req.currency || "IDR"}` : "-"}
                        </span>
                        {req.payment_due_date && (
                            <span className="ml-2 text-xs text-gray-500">
                                Pay before: {req.payment_due_date}
                            </span>
                        )}
                    </div>
                    {req.admin_notes && (
                        <div className="text-xs text-gray-600 mt-1">
                            <span className="font-semibold">Admin Notes:</span> {req.admin_notes}
                        </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                            Status: Awaiting Payment
                        </span>
                        {onPayNow && (
                            <button
                                className="ml-2 inline-flex items-center px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded transition-colors"
                                onClick={() =>
                                    onPayNow({
                                        id: req.id,
                                        title: req.itineraries?.title || `Trip #${req.id}`,
                                        amount: Number(req.total_price) || 0,
                                        participants: req.group_size || 1,
                                    })
                                }
                            >
                                💳 Bayar Sekarang
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TripRequestsNotification;
