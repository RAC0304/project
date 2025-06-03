import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tourGuides } from "../data/tourGuides";
import { Star, MapPin, Globe, MessageCircle, Calendar } from "lucide-react";
import { recentReviews } from "../data/tourGuideDashboardData";
import BookingModal from "../components/tour-guides/BookingModal";

const TourGuideProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guide = tourGuides.find((guide) => guide.id === id);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleBookNowClick = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
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

  if (!guide) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Tour guide not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row items-center md:items-start bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
        <img
          src={guide.imageUrl}
          alt={guide.name}
          className="w-full md:w-1/3 h-[500px] object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
        />
        <div className="p-10 md:w-2/3">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {guide.name}
          </h1>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{guide.location}</span>
          </div>
          <div className="flex items-center text-gray-600 mb-4">
            <Globe className="w-5 h-5 mr-2" />
            <span>{guide.languages.join(", ")}</span>
          </div>
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(guide.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-gray-600">
              ({guide.reviewCount} reviews)
            </span>
          </div>
          <p className="text-gray-700 mb-4">{guide.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {guide.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <span className="font-medium text-gray-800">Experience:</span>{" "}
              {guide.experience} years
            </p>
            <p>
              <span className="font-medium text-gray-800">Availability:</span>{" "}
              {guide.availability}
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={handleBookNowClick}
              className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span>Book Now</span>
            </button>
          </div>

          {isBookingModalOpen && (
            <BookingModal
              guide={guide}
              onClose={() => setIsBookingModalOpen(false)}
            />
          )}

          {showWarningModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4 animate-fadeIn">
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
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">User Reviews</h2>
        <div className="space-y-6">
          {recentReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200"
            >
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2">
                    {review.rating >= 4 ? "😊" : review.rating >= 3 ? "😐" : "😞"}
                  </span>
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {review.clientName} -{" "}
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
              <p className="text-sm text-gray-500 italic">
                Tour: {review.tour}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TourGuideProfile;