import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Globe, MessageCircle, Calendar } from "lucide-react";
import { TourGuide } from "../../types";
import BookingModal from "./BookingModal";

interface TourGuideCardProps {
  guide: TourGuide;
}

const TourGuideCard: React.FC<TourGuideCardProps> = ({ guide }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
              className={`w-4 h-4 ${
                i < Math.floor(guide.rating)
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

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
        <div className="relative h-60">
          <img
            src={guide.imageUrl}
            alt={guide.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              {guide.name}
            </h3>
            {renderRating()}
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
            <div className="text-sm">
              <span className="font-medium text-gray-700">Experience:</span>{" "}
              {guide.experience} years
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Availability:</span>{" "}
              {guide.availability}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {guide.tours.length} tour{guide.tours.length !== 1 ? "s" : ""}{" "}
              available
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center bg-teal-600 text-white px-3 py-1.5 rounded-full text-sm hover:bg-teal-700 transition-colors"
              >
                <Calendar className="w-4 h-4 mr-1" />
                <span>Book Now</span>
              </button>
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
    </>
  );
};

export default TourGuideCard;
