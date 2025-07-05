import React, { useState, useEffect } from "react";
import { getAllItineraries } from "../services/itineraryService";
import { Itinerary } from "../types";
import ItineraryCard from "../components/itineraries/ItineraryCard";

const ItinerariesPage: React.FC = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItineraries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllItineraries();
        setItineraries(data);
      } catch (err) {
        console.error('Error loading itineraries:', err);
        setError(err instanceof Error ? err.message : 'Failed to load itineraries');
      } finally {
        setLoading(false);
      }
    };

    loadItineraries();
  }, []);

  if (loading) {
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

          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading itineraries...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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

          <div className="flex items-center justify-center min-h-64">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Error Loading Itineraries
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {itineraries.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Itineraries Available
              </h3>
              <p className="text-gray-600">
                We're working on adding amazing itineraries for you. Check back soon!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {itineraries.map((itinerary) => (
              <ItineraryCard key={itinerary.id} itinerary={itinerary} />
            ))}
          </div>
        )}

        {/* Custom itinerary CTA */}
        <div className="mt-16 bg-teal-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Need a Custom Itinerary?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find the perfect itinerary? Let our travel experts create a
            personalized journey just for you based on your preferences and budget.
          </p>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Request Custom Itinerary
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItinerariesPage;
