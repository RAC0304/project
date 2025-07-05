import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Info,
  ChevronRight,
  ChevronLeft,
  Map,
  ThumbsUp,
  Flag,
} from "lucide-react";
import { getDestinationById } from "../services/destinationService";
import {
  getDestinationReviews,
  getDestinationRating,
  markReviewHelpful,
  DestinationReview,
} from "../services/reviewService";
import { Destination, DestinationCategory } from "../types";
import NotFoundPage from "./NotFoundPage";

const DestinationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [reviews, setReviews] = useState<DestinationReview[]>([]);
  const [rating, setRating] = useState<{
    averageRating: number;
    totalReviews: number;
  }>({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const loadDestination = async () => {
      if (!id) {
        setError("No destination ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const destinationData = await getDestinationById(id);

        if (destinationData) {
          // Convert category to array if it's an object
          if (
            destinationData.category &&
            typeof destinationData.category === "object" &&
            !Array.isArray(destinationData.category)
          ) {
            // Handle case where category is an object with boolean values
            const categoryObj = destinationData.category as Record<
              string,
              unknown
            >;
            const categoryKeys = Object.keys(categoryObj);
            const categoryValues = categoryKeys
              .filter(
                (key) =>
                  categoryObj[key] === true ||
                  categoryObj[key] === 1 ||
                  categoryObj[key] === "true"
              )
              .filter((key) =>
                [
                  "beach",
                  "mountain",
                  "cultural",
                  "adventure",
                  "historical",
                  "nature",
                  "city",
                ].includes(key)
              ) as DestinationCategory[];

            // Set to filtered values or empty array
            destinationData.category =
              categoryValues.length > 0 ? categoryValues : [];
          } else if (
            destinationData.category &&
            typeof destinationData.category === "string"
          ) {
            // Jika string, jadikan array satu elemen (dengan validasi)
            const validCategories = [
              "beach",
              "mountain",
              "cultural",
              "adventure",
              "historical",
              "nature",
              "city",
            ];
            destinationData.category = validCategories.includes(
              destinationData.category
            )
              ? [destinationData.category as DestinationCategory]
              : [];
          } else if (!destinationData.category) {
            destinationData.category = [];
          }

          setDestination(destinationData);
        } else {
          setError("Destination not found");
        }
      } catch (err) {
        console.error("Error loading destination:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load destination"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDestination();
  }, [id]);

  // Load reviews when destination is loaded or when reviews section is activated
  useEffect(() => {
    const loadReviews = async () => {
      if (!destination?.id) return;

      try {
        setReviewsLoading(true);

        // Load reviews and rating in parallel
        const [reviewsData, ratingData] = await Promise.all([
          getDestinationReviews(destination.id).catch(() => []),
          getDestinationRating(destination.id).catch(() => ({
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

    if (destination && (activeSection === "reviews" || reviews.length === 0)) {
      loadReviews();
    }
  }, [destination, activeSection, reviews.length]);

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

  useEffect(() => {
    // Reset active image when destination changes
    setActiveImageIndex(0);

    // Scroll to top when destination changes
    window.scrollTo(0, 0);
  }, [destination]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail destinasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-4">
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
              Terjadi Kesalahan
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return <NotFoundPage />;
  }

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "attractions", label: "Attractions" },
    { id: "activities", label: "Activities" },
    { id: "tips", label: "Travel Tips" },
    { id: "reviews", label: "Reviews" }, // Add Reviews tab
  ];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % destination.images.length);
  };

  const prevImage = () => {
    setActiveImageIndex(
      (prev) =>
        (prev - 1 + destination.images.length) % destination.images.length
    );
  };

  return (
    <div className="pt-25 pb-16" style={{ paddingTop: "0.65rem" }}>
      {/* Hero Section */}
      <div className="relative h-[65vh]">
        <div className="absolute inset-0">
          <img
            src={destination.images[activeImageIndex]}
            alt={destination.name}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.7)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        </div>

        {/* Image navigation */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          onClick={prevImage}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          onClick={nextImage}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
          {destination.images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === activeImageIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setActiveImageIndex(index)}
            ></button>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-2">{destination.name}</h1>
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{destination.location}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {destination.category &&
                Array.isArray(destination.category) &&
                destination.category.length > 0 &&
                destination.category.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 relative z-10">
        {/* Navigation tabs */}
        <div className="bg-white rounded-t-xl shadow-md p-1 flex overflow-x-auto sticky top-16 z-20">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                activeSection === section.id
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-xl shadow-md p-6">
          {/* Overview Section */}
          <div
            id="overview"
            className={activeSection === "overview" ? "block" : "hidden"}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {destination.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Calendar className="w-5 h-5 text-teal-600 mr-2" />
                  Best Time to Visit
                </h3>
                <p className="text-gray-700">{destination.bestTimeToVisit}</p>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <MapPin className="w-5 h-5 text-teal-600 mr-2" />
                  Location
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">{destination.location}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      destination.location
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-teal-600 hover:text-teal-800 transition-colors"
                  >
                    <Map className="w-4 h-4 mr-1" />
                    <span>View on Map</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Attractions Section */}
          <div
            id="attractions"
            className={activeSection === "attractions" ? "block" : "hidden"}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Top Attractions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destination.attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={attraction.imageUrl}
                      alt={attraction.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {attraction.name}
                    </h3>
                    <p className="text-gray-600">{attraction.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activities Section */}
          <div
            id="activities"
            className={activeSection === "activities" ? "block" : "hidden"}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Popular Activities
            </h2>
            <div className="space-y-6">
              {destination.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row"
                >
                  <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                    <img
                      src={activity.imageUrl}
                      alt={activity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {activity.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{activity.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 text-teal-600 mr-2" />
                        <span>{activity.duration}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <DollarSign className="w-4 h-4 text-teal-600 mr-2" />
                        <span>{activity.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Tips Section */}
          <div
            id="tips"
            className={activeSection === "tips" ? "block" : "hidden"}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Travel Tips
            </h2>
            <div className="bg-teal-50 p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <Info className="w-6 h-6 text-teal-600 mr-3 mt-0.5" />
                <p className="text-gray-700 italic">
                  Make the most of your trip to {destination.name} with these
                  local recommendations and practical tips.
                </p>
              </div>
              <ul className="space-y-3">
                {destination.travelTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center bg-teal-600 text-white rounded-full w-6 h-6 text-xs font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reviews Section */}
          <div
            id="reviews"
            className={activeSection === "reviews" ? "block" : "hidden"}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
              {rating.totalReviews > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {rating.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">
                    dari {rating.totalReviews} review
                    {rating.totalReviews > 1 ? "s" : ""}
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
                            src={review.userAvatar || "/default-avatar.png"}
                            alt={review.userName}
                            className="w-12 h-12 rounded-full mr-3 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/default-avatar.png";
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

                      {review.tourGuide && (
                        <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">
                            Tour Guide
                          </h5>
                          <div className="flex items-center">
                            <img
                              src={
                                review.tourGuide.avatar || "/default-avatar.png"
                              }
                              alt={review.tourGuide.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/default-avatar.png";
                              }}
                            />
                            <div>
                              <div className="font-medium text-gray-800">
                                {review.tourGuide.name}
                              </div>
                              <span className="text-sm text-gray-600">
                                {review.tourGuide.specialty}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={() => handleMarkHelpful(review.id)}
                          className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Helpful ({review.helpfulCount})
                        </button>
                        <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
                          <Flag className="w-4 h-4" />
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
                        Belum ada review
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Jadilah yang pertama memberikan review untuk{" "}
                        {destination.name}
                      </p>
                      <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                        Tulis Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related content section */}
      <div className="container mx-auto px-4 mt-12">
        <div className="bg-teal-50 rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Ready to Experience {destination.name}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/itineraries"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-start"
            >
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Browse Itineraries
                </h3>
                <p className="text-gray-600">
                  Discover curated travel plans including {destination.name} and
                  other amazing destinations.
                </p>
              </div>
            </Link>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-start">
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <MapPin className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Plan Your Visit
                </h3>
                <p className="text-gray-600 mb-3">
                  Get practical information on how to reach {destination.name}{" "}
                  and where to stay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationPage;
