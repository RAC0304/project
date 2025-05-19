import React from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import { Itinerary } from "../../types";

interface ItineraryCardProps {
  itinerary: Itinerary;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="md:flex">
        <div className="md:w-2/5 relative">
          <img
            src={itinerary.imageUrl}
            alt={itinerary.title}
            className="w-full h-64 md:h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-teal-800 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {itinerary.duration}
          </div>
        </div>

        <div className="p-6 md:w-3/5">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {itinerary.title}
          </h3>

          <div className="mb-4 flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>
              {itinerary.destinations.length} destination
              {itinerary.destinations.length > 1 ? "s" : ""}
            </span>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-3">
            {itinerary.description}
          </p>

          <div className="mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">
                <span className="text-gray-500">Difficulty:</span>
                <span className="ml-2 font-medium text-gray-700 capitalize">
                  {itinerary.difficulty}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Best Season:</span>
                <span className="ml-2 font-medium text-gray-700">
                  {itinerary.bestSeason}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Budget:</span>
                <span className="ml-2 font-medium text-gray-700">
                  {itinerary.estimatedBudget}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {itinerary.days.slice(0, 3).map((day) => (
              <span
                key={day.day}
                className="px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full"
              >
                Day {day.day}: {day.title}
              </span>
            ))}
            {itinerary.days.length > 3 && (
              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                +{itinerary.days.length - 3} more days
              </span>
            )}
          </div>

          <Link
            to={`/itineraries/${itinerary.id}`}
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          >
            View Itinerary
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard;
