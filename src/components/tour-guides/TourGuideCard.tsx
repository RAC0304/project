import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Globe,
  MessageCircle,
  Calendar,
  Users,
  Clock,
  Award,
} from "lucide-react";
import { TourGuide } from "../../types";
import BookingModal from "./BookingModal";
import { useEnhancedAuth } from "../../contexts/useEnhancedAuth";

interface TourGuideCardProps {
  guide: TourGuide;
}

const TourGuideCard: React.FC<TourGuideCardProps> = ({ guide }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn } = useEnhancedAuth();

  const hasActiveTours = guide.tours && guide.tours.length > 0;

  const handleBookNowClick = () => {
    if (isLoggedIn && user) {
      setIsBookingModalOpen(true);
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

  const renderSpecialties = () => {
    return guide.specialties.map((specialty) => (
      <span
        key={specialty}
        className="inline-block px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded-full mr-1 mb-1"
      >
        {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
      </span>
    ));
  };

  const renderRating = () => {
    return (
      <div className="flex items-center">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.floor(guide.rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
                }`}
            />
          ))}
        </div>
        <span className="ml-1 text-sm text-gray-600">
          ({guide.reviewCount} reviews)
        </span>
      </div>
    );
  };

  // Format tour price range if multiple tours exist
  const getTourPriceRange = () => {
    if (!hasActiveTours) return "N/A";

    const prices = guide.tours.map((tour) => {
      const price = tour.price.replace(/[^0-9.]/g, "");
      return parseFloat(price);
    });

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `$${minPrice}`;
    }

    return `$${minPrice} - $${maxPrice}`;
  };

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl border border-gray-100">
        <div className="relative h-60">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img
            src={guide.imageUrl}
            alt={guide.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <div className="flex items-center">{renderRating()}</div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              {guide.name}
            </h3>
          </div>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{guide.location}</span>
            <span className="mx-2">•</span>
            <Globe className="w-4 h-4 mr-1" />
            <span className="text-sm">{guide.languages.join(", ")}</span>
          </div>

          <div className="mb-4">{renderSpecialties()}</div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {guide.shortBio}
          </p>

          <div className="flex flex-col space-y-2 mb-4">
            <div className="text-sm flex items-center">
              <Award className="w-4 h-4 mr-1 text-gray-500" />
              <span className="font-medium text-gray-700">
                Experience:
              </span>{" "}
              <span className="ml-1">{guide.experience} years</span>
            </div>
            <div className="text-sm flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500" />
              <span className="font-medium text-gray-700">
                Availability:
              </span>{" "}
              <span className="ml-1">{guide.availability}</span>
            </div>
          </div>

          {hasActiveTours && (
            <div className="bg-gray-50 -mx-5 px-5 py-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-500 text-xs">Price Range</span>
                  <p className="font-semibold text-gray-800">
                    {getTourPriceRange()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Available Tours</span>
                  <p className="font-semibold text-gray-800">
                    {guide.tours.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 mt-2 flex justify-between items-center">
            {hasActiveTours ? (
              <div className="text-sm text-gray-600 flex items-center">
                <Users className="w-4 h-4 mr-1 text-gray-500" />
                Max group size:{" "}
                {Math.max(...guide.tours.map((tour) => tour.maxGroupSize))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No tours available
              </div>
            )}
            <div className="flex items-center space-x-3">
              {hasActiveTours && (
                <button
                  onClick={handleBookNowClick}
                  className="inline-flex items-center bg-teal-600 text-white px-3 py-1.5 rounded-full text-sm hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Book Now</span>
                </button>
              )}
              <Link
                to={`/tour-guides/${guide.id}`}
                className="inline-flex items-center text-teal-600 hover:text-teal-800 transition-colors"
              >
                <span className="font-medium text-sm">View profile</span>
                <MessageCircle className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isBookingModalOpen && (
        <BookingModal
          guide={guide}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}

      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 animate-fadeIn shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <MessageCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authentication Required
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Please login to book a tour with our guides.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={handleLoginClick}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-teal-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleCancelClick}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TourGuideCard;
