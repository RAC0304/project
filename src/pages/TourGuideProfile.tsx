import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Globe, MessageCircle, Calendar } from "lucide-react";
import BookingModal from "../components/tour-guides/BookingModal";
import { getTourGuideById, TourGuideData } from "../services/tourGuideService";

const TourGuideProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<TourGuideData | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTourGuideById(Number(id))
      .then((data) => {
        setGuide(data);
        setError(null);
      })
      .catch(() => setError("Tour guide not found."))
      .finally(() => setLoading(false));
  }, [id]);

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

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (error || !guide) {
    return (
      <div className="text-center py-12 mt-24">
        <p className="text-lg text-gray-600">
          {error || "Tour guide not found."}
        </p>
      </div>
    );
  }

  // Mapping Supabase data ke bentuk TourGuide (mock)
  const mapToTourGuide = (g: TourGuideData): import("../types").TourGuide => ({
    id: String(g.id),
    name:
      `${g.users?.first_name || ""} ${g.users?.last_name || ""}`.trim() || "-",
    specialties: g.specialties ? (Object.keys(g.specialties) as any) : [],
    location: g.location,
    description: g.bio || g.short_bio || "",
    shortBio: g.short_bio || g.bio || "",
    imageUrl: g.users?.profile_picture || "/default-profile.png",
    languages: g.tour_guide_languages?.map((l) => l.language) || [],
    experience: g.experience || 0,
    rating: g.rating || 0,
    reviewCount: g.review_count || 0,
    contactInfo: {
      email: g.users?.email || "",
      phone: g.users?.phone || undefined,
    },
    availability: g.availability || "",
    tours: [], // Anda bisa fetch tours jika ingin
    isVerified: g.is_verified,
    reviews: [], // Anda bisa fetch reviews jika ingin
  });

  const mappedGuide = mapToTourGuide(guide);
  const fullName = mappedGuide.name;
  const languages = mappedGuide.languages;
  const specialties = mappedGuide.specialties;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row items-center md:items-start bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
        <img
          src={mappedGuide.imageUrl}
          alt={fullName || "Tour Guide"}
          className="w-full md:w-1/3 h-[500px] object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
        />
        <div className="p-10 md:w-2/3">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {fullName || "Nama tidak tersedia"}
          </h1>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{mappedGuide.location}</span>
          </div>
          <div className="flex items-center text-gray-600 mb-4">
            <Globe className="w-5 h-5 mr-2" />
            <span>{languages.join(", ")}</span>
          </div>
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(mappedGuide.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-gray-600">
              ({mappedGuide.reviewCount || 0} reviews)
            </span>
          </div>
          <p className="text-gray-700 mb-4">
            {mappedGuide.description || mappedGuide.shortBio}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {specialties.map((specialty) => (
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
              {mappedGuide.experience} years
            </p>
            <p>
              <span className="font-medium text-gray-800">Availability:</span>{" "}
              {mappedGuide.availability}
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
              guide={mappedGuide}
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
      {/* Bagian review user bisa diisi dengan fetch review dari Supabase jika sudah ada */}
    </div>
  );
};

export default TourGuideProfile;
