import React from 'react';
import ItineraryRequestsAdmin from './ItineraryRequestsAdmin';

const ItineraryRequestsContent: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Trip Requests Management
                    </h1>
                    <p className="text-gray-600">
                        Manage customer itinerary requests and bookings. Process, confirm, and track all trip requests from customers.
                    </p>
                </div>

                <ItineraryRequestsAdmin />
            </div>
        </div>
    );
};

export default ItineraryRequestsContent;
