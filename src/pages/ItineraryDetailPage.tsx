import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  MapPin,
  DollarSign,
  AlertTriangle,
  Sunrise,
  Award,
  Coffee,
  Bed,
  Car,
} from "lucide-react";
import { getItineraryBySlug, getItineraryById } from "../services/itineraryService";
import { Itinerary } from "../types";
import TripPlanningModal from "../components/itineraries/TripPlanningModal";
import NotFoundPage from "./NotFoundPage";
import { useEnhancedAuth } from "../contexts/useEnhancedAuth";

const ItineraryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useEnhancedAuth();

  useEffect(() => {
    const loadItinerary = async () => {
      if (!slug) {
        console.log('❌ No slug provided');
        return;
      }

      try {
        console.log('🔄 Loading itinerary with slug:', slug);
        setLoading(true);
        setError(null);

        // First try to load by slug
        let data = await getItineraryBySlug(slug);

        // If not found and slug is numeric, try loading by ID
        if (!data && /^\d+$/.test(slug)) {
          console.log('🔄 Slug appears to be numeric, trying to load by ID:', slug);
          data = await getItineraryById(slug);

          // If found by ID, redirect to the correct slug URL
          if (data) {
            console.log('✅ Found by ID, redirecting to slug URL:', data.slug);
            navigate(`/itineraries/${data.slug}`, { replace: true });
            return;
          }
        }

        if (data) {
          console.log('✅ Itinerary loaded successfully:', data.title);
          setItinerary(data);
        } else {
          console.log('❌ No itinerary data returned');
          setItinerary(null);
        }

        // Reset active day when itinerary changes
        setActiveDay(1);

        // Scroll to top when itinerary changes
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('❌ Error loading itinerary:', err);
        setError(err instanceof Error ? err.message : 'Failed to load itinerary');
      } finally {
        console.log('🏁 Loading complete');
        setLoading(false);
      }
    };

    loadItinerary();
  }, [slug, navigate]);

  const handlePlanTripClick = () => {
    if (isLoggedIn) {
      setIsPlanningModalOpen(true);
    } else {
      setShowWarningModal(true);
    }
  };

  const handleLoginClick = () => {
    setShowWarningModal(false);
    navigate("/login");
  };

  const handleCancelClick = () => {
    setShowWarningModal(false);
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading itinerary...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
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
                  Error Loading Itinerary
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

  if (!itinerary) {
    return <NotFoundPage />;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/itineraries"
          className="inline-flex items-center mb-6 text-teal-600 hover:text-teal-800"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Itineraries
        </Link>

        {/* Hero Section */}
        <div className="relative h-[40vh] rounded-xl overflow-hidden mb-8">
          <img
            src={itinerary.imageUrl}
            alt={itinerary.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-teal-800 flex items-center w-fit mb-4">
              <Clock className="w-4 h-4 mr-2" />
              {itinerary.duration}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {itinerary.title}
            </h1>
            <div className="flex items-center text-white/90">
              <MapPin className="w-5 h-5 mr-1" />
              <span>
                {itinerary.destinations && itinerary.destinations.length > 0
                  ? `${itinerary.destinations.length} destination${itinerary.destinations.length > 1 ? "s" : ""}: `
                  : "No destinations"}
                {itinerary.destinations && itinerary.destinations.length > 0 &&
                  itinerary.destinations.map((dest, idx) => {
                    // Use a robust key: prefer dest.id, then dest.slug, then dest.name, then fallback to idx
                    const key = dest.id || dest.slug || dest.name || idx;
                    return (
                      <span key={key}>
                        {dest.name}{idx < itinerary.destinations.length - 1 ? ", " : ""}
                      </span>
                    );
                  })
                }
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Overview and Details */}
          <div className="lg:col-span-2">
            {/* Overview Section */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Overview
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {itinerary.description}
              </p>

              {/* Tour Guides */}
              <div className="mb-4">
                <span className="font-semibold text-gray-800">Tour Guides: </span>
                {itinerary.tourGuides && itinerary.tourGuides.length > 0
                  ? itinerary.tourGuides.map((tg, idx) => (
                    <React.Fragment key={tg.id || tg.name || idx}>
                      <span>
                        {tg.name}
                      </span>
                      {idx < itinerary.tourGuides.length - 1 ? ', ' : ''}
                    </React.Fragment>
                  ))
                  : <span className="text-gray-500">No tour guides assigned</span>
                }
              </div>

              {/* Destinations */}
              <div className="mb-4">
                <span className="font-semibold text-gray-800">Destinations: </span>
                {itinerary.destinations && itinerary.destinations.length > 0
                  ? itinerary.destinations.map((dest, idx) => (
                    <React.Fragment key={dest.id || dest.slug || dest.name || dest || idx}>
                      <span>{dest.name || dest}</span>
                      {idx < itinerary.destinations.length - 1 ? ', ' : ''}
                    </React.Fragment>
                  ))
                  : <span className="text-gray-500">No destinations assigned</span>
                }
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-teal-600 mr-2" />
                    <h3 className="font-semibold text-gray-800">Difficulty</h3>
                  </div>
                  <p className="text-gray-700 capitalize">
                    {itinerary.difficulty}
                  </p>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Sunrise className="w-5 h-5 text-teal-600 mr-2" />
                    <h3 className="font-semibold text-gray-800">Best Season</h3>
                  </div>
                  <p className="text-gray-700">{itinerary.bestSeason}</p>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-teal-600 mr-2" />
                    <h3 className="font-semibold text-gray-800">Budget</h3>
                  </div>
                  <p className="text-gray-700">{itinerary.estimatedBudget}</p>
                </div>
              </div>
            </div>

            {/* Daily Itinerary Section */}
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Daily Itinerary
              </h2>

              {/* Days Navigation */}
              <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
                {itinerary.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day)}
                    className={`min-w-[120px] px-4 py-2 rounded-lg flex flex-col items-center ${activeDay === day.day
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                  >
                    <span className="font-medium">Day {day.day}</span>
                    <span className="text-xs mt-1 truncate max-w-full">
                      {day.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Day Details */}
              {itinerary.days
                .filter((day) => day.day === activeDay)
                .map((day) => (
                  <div key={day.day} className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Day {day.day}: {day.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{day.description}</p>
                    </div>

                    {/* Daily Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {day.accommodation && (
                        <div className="flex items-start">
                          <div className="bg-teal-100 p-2 rounded-lg mr-3">
                            <Bed className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              Accommodation
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {day.accommodation}
                            </p>
                          </div>
                        </div>
                      )}

                      {day.meals && (
                        <div className="flex items-start">
                          <div className="bg-teal-100 p-2 rounded-lg mr-3">
                            <Coffee className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Meals</h4>
                            <p className="text-gray-600 text-sm">{day.meals}</p>
                          </div>
                        </div>
                      )}

                      {day.transportation && (
                        <div className="flex items-start">
                          <div className="bg-teal-100 p-2 rounded-lg mr-3">
                            <Car className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              Transportation
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {day.transportation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="space-y-6 mt-8">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Clock className="w-5 h-5 text-teal-600 mr-2" />
                        Daily Schedule
                      </h4>

                      <div className="space-y-6">
                        {day.activities.map((activity, index) => (
                          <div
                            key={index}
                            className="relative pl-8 pb-6 border-l-2 border-teal-200 last:border-0 last:pb-0"
                          >
                            <div className="absolute -left-2 top-0">
                              <div className="bg-teal-600 w-4 h-4 rounded-full"></div>
                            </div>
                            <div className="text-sm font-medium text-teal-700 mb-1">
                              {activity.time}
                            </div>
                            <h5 className="text-lg font-medium text-gray-800 mb-1">
                              {activity.title}
                            </h5>
                            <p className="text-gray-600 mb-2">
                              {activity.description}
                            </p>
                            {activity.location && (
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                {activity.location}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* CTA Card */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Ready for this Adventure?
              </h3>
              <p className="text-gray-600 mb-6">
                Contact our travel experts to customize this itinerary to your
                needs and preferences. We can help with bookings,
                transportation, and accommodation.
              </p>
              <button
                onClick={handlePlanTripClick}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-colors"
              >
                Plan This Trip
              </button>
            </div>

            {/* Tips Card */}
            <div className="bg-teal-50 rounded-xl p-6">
              <div className="flex items-start mb-4">
                <div className="bg-teal-100 p-2 rounded-full mr-3">
                  <Award className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Travel Tips
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="text-teal-600 mr-2">•</div>
                  <span className="text-gray-700">
                    Book accommodations in advance, especially during peak
                    season
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="text-teal-600 mr-2">•</div>
                  <span className="text-gray-700">
                    Consider hiring a local guide for a more authentic
                    experience
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="text-teal-600 mr-2">•</div>
                  <span className="text-gray-700">
                    Pack appropriate clothing for the {itinerary.difficulty}{" "}
                    difficulty level
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="text-teal-600 mr-2">•</div>
                  <span className="text-gray-700">
                    The best time to visit is during {itinerary.bestSeason}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Planning Modal */}
      {isPlanningModalOpen && itinerary && (
        <TripPlanningModal
          itinerary={itinerary}
          onClose={() => setIsPlanningModalOpen(false)}
        />
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelClick}
          />
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Authentication Required
            </h3>
            <p className="text-gray-700 mb-4">
              You need to be logged in to plan a trip. Please log in or sign up
              to continue.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelClick}
                className="px-4 py-2 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>{" "}
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetailPage;
