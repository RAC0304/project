import React from "react";
import { itineraries } from "../data/itineraries";
import ItineraryCard from "../components/itineraries/ItineraryCard";

const ItinerariesPage: React.FC = () => {
  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Curated Itineraries
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Perfectly planned journeys to help you experience the best of
            Indonesia
          </p>
        </div>

        <div className="space-y-10">
          {itineraries.map((itinerary) => (
            <ItineraryCard key={itinerary.id} itinerary={itinerary} />
          ))}
        </div>

        {/* Custom itinerary CTA */}
      </div>
    </div>
  );
};

export default ItinerariesPage;
