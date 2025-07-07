import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Globe, MessageCircle, Calendar } from "lucide-react";
import BookingModal from "../components/tour-guides/BookingModal";
import { getTourGuideById, TourGuideData } from "../services/tourGuideService";
import {
  getTourGuideReviews,
  getTourGuideRating,
  markReviewHelpful,
  DestinationReview
} from "../services/reviewService";
import { useEnhancedAuth } from "../contexts/useEnhancedAuth";

const TourGuideProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();
  const [guide, setGuide] = useState<TourGuideData | null>(null);
  const [reviews, setReviews] = useState<DestinationReview[]>([]);
  const [rating, setRating] = useState<{
    averageRating: number;
    totalReviews: number;
  }>({ averageRating: 0, totalReviews: 0 });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    console.log("🔍 Loading tour guide ID:", id); // Debug log
    getTourGuideById(Number(id))
      .then((data) => {
        console.log("📦 Raw tour guide data:", data); // Debug log
        console.log("🎯 Tours found:", data?.tours); // Debug log
        setGuide(data);
        setError(null);
      })
      .catch((err) => {
        console.error("❌ Error loading tour guide:", err); // Debug log
        setError("Tour guide not found.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Load reviews when guide is loaded
  useEffect(() => {
    const loadReviews = async () => {
      if (!guide?.id) return;

      try {
        setReviewsLoading(true);

        // Load reviews and rating in parallel
        const [reviewsData, ratingData] = await Promise.all([
          getTourGuideReviews(guide.id.toString()).catch(() => []),
          getTourGuideRating(guide.id.toString()).catch(() => ({
            averageRating: 0,
            totalReviews: 0,
          })),
        ]);

        setReviews(reviewsData || []);
        setRating(ratingData || { averageRating: 0, totalReviews: 0 });
      } catch (err) {
        console.error("Error loading reviews:", err);
        // Set empty values in case of error
        setReviews([]);
        setRating({ averageRating: 0, totalReviews: 0 });
      } finally {
        setReviewsLoading(false);
      }
    };

    if (guide) {
      loadReviews();
    }
  }, [guide]);

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const success = await markReviewHelpful(reviewId);
      if (success) {
        // Update the review's helpful count locally
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? { ...review, helpfulCount: review.helpfulCount + 1 }
              : review
          )
        );
      }
    } catch (err) {
      console.error("Error marking review helpful:", err);
    }
  };

  const handleBookNowClick = () => {
    if (user) {
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
  // Default profile image generator (same as other components)
  const getDefaultProfileImage = (g: TourGuideData) => {
    const firstName = g.users?.first_name || "";
    const lastName = g.users?.last_name || "";
    const seed = firstName || lastName || "default";
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  };

  // Mapping Supabase data ke bentuk TourGuide (mock)
  const mapToTourGuide = (g: TourGuideData): import("../types").TourGuide => {
    console.log("🗺️ Mapping guide data:", g); // Debug log
    console.log("🎪 Raw tours before mapping:", g.tours); // Debug log

    const mappedTours =
      g.tours
        ?.filter((tour) => tour.is_active)
        .map((tour) => ({
          id: String(tour.id),
          title: tour.title,
          description: tour.description,
          duration: tour.duration,
          price: `$${Number(tour.price).toFixed(2)}`,
          maxGroupSize: tour.max_group_size,
        })) || [];

    console.log("🎯 Mapped tours:", mappedTours); // Debug log

    return {
      id: String(g.id),
      name:
        `${g.users?.first_name || ""} ${g.users?.last_name || ""}`.trim() ||
        "-",
      specialties: g.specialties
        ? (Object.keys(
          g.specialties
        ) as import("../types").TourGuideSpecialty[])
        : [],
      location: g.location,
      description: g.bio || g.short_bio || "",
      shortBio: g.short_bio || g.bio || "",
      imageUrl: g.users?.profile_picture || getDefaultProfileImage(g),
      languages: g.tour_guide_languages?.map((l) => l.language) || [],
      experience: g.experience || 0,
      rating: g.rating || 0,
      reviewCount: g.review_count || 0,
      contactInfo: {
        email: g.users?.email || "",
        phone: g.users?.phone || undefined,
      },
      availability: g.availability || "",
      tours: mappedTours,
      isVerified: g.is_verified,
      reviews: [], // Anda bisa fetch reviews jika ingin
    };
  };

  const mappedGuide = mapToTourGuide(guide);
  const fullName = mappedGuide.name;
  const languages = mappedGuide.languages;
  const specialties = mappedGuide.specialties;

  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
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
                className={`w-5 h-5 ${i < Math.floor(mappedGuide.rating)
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
          </div>{" "}
          <div className="mt-6">
            {mappedGuide.tours && mappedGuide.tours.length > 0 ? (
              <button
                onClick={handleBookNowClick}
                className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span>Book Now</span>
              </button>
            ) : (
              <span className="text-orange-500 italic">
                No tours available for booking
              </span>
            )}
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
      {/* Bagian review user - Reviews Section */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
            {rating.totalReviews > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {rating.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">
                  dari {rating.totalReviews} review{rating.totalReviews > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                <span>Memuat reviews...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <img
                          src={
                            review.userAvatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(review.userName)}`
                          }
                          alt={review.userName}
                          className="w-12 h-12 rounded-full mr-3 object-cover"
                          onError={(e) => {
                            // Fallback to dicebear avatar if image fails to load
                            const target = e.target as HTMLImageElement;
                            const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(review.userName)}`;
                            if (target.src !== fallbackUrl) {
                              target.src = fallbackUrl;
                            }
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-gray-800">
                              {review.userName}
                            </div>
                            {review.isVerified && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500 font-bold mr-2">
                          {"★".repeat(Math.floor(review.rating))}
                          {"☆".repeat(5 - Math.floor(review.rating))}
                        </span>
                        <span className="text-gray-500">
                          ({review.rating})
                        </span>
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {review.title}
                      </h4>
                    )}

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {review.content}
                    </p>

                    {review.images && review.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {review.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={image}
                            alt={`Review image ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(image, "_blank")}
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => handleMarkHelpful(review.id)}
                        className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v4M9 7H5.5a2 2 0 00-2 2v6a2 2 0 002 2H9m0-10V5a2 2 0 012-2h2.096c.5 0 .904.405.904.904 0 .464.116.92.34 1.328L16 7H9z" />
                        </svg>
                        Helpful ({review.helpfulCount})
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6v1a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        Report
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-lg p-8">
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
                          d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Be the first to leave a review for {mappedGuide.name} by clicking the "Book Now" button above to start your adventure!
                    </p>

                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourGuideProfile;
