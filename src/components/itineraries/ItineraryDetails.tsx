import React from "react";
import { Link } from "react-router-dom";
import { Itinerary } from "../../types";

interface ItineraryDetailsProps {
    itinerary: Itinerary;
}

const ItineraryDetails: React.FC<ItineraryDetailsProps> = ({ itinerary }) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
            <img
                src={itinerary.imageUrl}
                alt={itinerary.title}
                className="h-64 w-full object-cover"
            />
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {itinerary.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                    {itinerary.description}
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4">
                    <span>Duration: {itinerary.duration}</span>
                    <span>• Difficulty: {itinerary.difficulty}</span>
                    <span>• Budget: {itinerary.estimatedBudget}</span>
                </div>
                <Link
                    to={`/itineraries/${itinerary.id}`}
                    className="mt-auto inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium text-center transition-colors"
                >
                    View Itinerary
                </Link>
            </div>
        </div>
    );
};

export default ItineraryDetails;
