import { useState, useEffect } from "react";
import { Star, Eye, CheckCircle2 } from "lucide-react";
import { DEFAULT_AVATAR } from "../asset/image/defaultAvatar";
import { BookingStatusService } from "../services/bookingStatusService";
import {
  createBookingReview,
  getUserBookingReviews,
  ReviewWithDetails,
} from "../services/reviewService";
import { getCurrentUser } from "../services/bookingService";

interface CompletedBooking {
  id: number;
  user_id: number;
  tour_id: number;
  date: string;
  participants: number;
  status: string;
  total_amount: number;
  payment_status: string;
  tours?: {
    id: number;
    title: string;
    location: string;
    destination_id?: number;
    tour_guides?: {
      id: number;
      users?: {
        first_name: string;
        last_name: string;
        profile_picture?: string;
      };
    };
  };
}

const HistoryPage: React.FC = () => {
  const [allCompletedBookings, setAllCompletedBookings] = useState<
    CompletedBooking[]
  >([]);
  const [finishableBookings, setFinishableBookings] = useState<
    CompletedBooking[]
  >([]);
  const [selectedBooking, setSelectedBooking] =
    useState<CompletedBooking | null>(null);
  const [selectedReview, setSelectedReview] =
    useState<ReviewWithDetails | null>(null);
  const [userReviews, setUserReviews] = useState<ReviewWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<
    "bookings" | "reviews" | "finishable"
  >("bookings");
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<number>>(
    new Set()
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingToFinish, setBookingToFinish] =
    useState<CompletedBooking | null>(null);

  const satisfactionIcons = [
    { label: "Sad", emoji: "😞" },
    { label: "Neutral", emoji: "😐" },
    { label: "Happy", emoji: "😊" },
  ];

  useEffect(() => {
    loadCompletedBookings();
  }, []);

  const loadCompletedBookings = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        setNotification("Please login to view your travel history");
        setTimeout(() => setNotification(""), 3000);
        return;
      }

      setCurrentUserId(user.id);

      // Get all completed bookings
      const allCompleted = await BookingStatusService.getCompletedTours(
        user.id
      );
      setAllCompletedBookings(allCompleted);

      // Get bookings that can be finished
      const finishable = await BookingStatusService.getFinishableTours(user.id);
      setFinishableBookings(finishable);

      // Get bookings that are eligible for review (not reviewed yet)
      const eligibleForReview = await BookingStatusService.getEligibleForReview(
        user.id
      );

      // Create set of booking IDs that have been reviewed
      const eligibleIds = new Set(
        eligibleForReview.map((booking) => booking.id)
      );
      const reviewedIds = new Set(
        allCompleted
          .filter((booking) => !eligibleIds.has(booking.id))
          .map((booking) => booking.id)
      );
      setReviewedBookingIds(reviewedIds);

      // Load user's reviews
      try {
        const reviews = await getUserBookingReviews(user.id);
        setUserReviews(reviews);
      } catch (error) {
        console.error("Error loading user reviews:", error);
        // Don't fail the whole load if reviews fail
      }
    } catch (error) {
      console.error("Error loading completed bookings:", error);
      setNotification("Failed to load travel history. Please try again.");
      setTimeout(() => setNotification(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBooking = (booking: CompletedBooking) => {
    // Double check - make sure this booking hasn't been reviewed
    if (reviewedBookingIds.has(booking.id)) {
      setNotification("This booking has already been reviewed");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    setSelectedBooking(booking);
    setReviewText("");
    setReviewTitle("");
    setRating(0);
    setSelectedIcon(null);
    setNotification("");
  };

  const handleViewReview = (bookingId: number) => {
    const review = userReviews.find((r) => r.booking_id === bookingId);
    if (review) {
      setSelectedReview(review);
    }
  };

  const handleCloseReviewView = () => {
    setSelectedReview(null);
  };

  const handleFinishBooking = async (booking: CompletedBooking) => {
    if (!currentUserId) {
      setNotification("Please login to complete tours");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      setSubmitting(true);
      await BookingStatusService.finishBooking(booking.id);

      setNotification(
        "Tour completed successfully! You can now write a review."
      );
      setTimeout(() => {
        setNotification("");
        loadCompletedBookings(); // Reload to update all lists
      }, 3000);
    } catch (error) {
      console.error("Error completing tour:", error);
      setNotification(
        error instanceof Error ? error.message : "Failed to complete tour"
      );
      setTimeout(() => setNotification(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowConfirmDialog = (booking: CompletedBooking) => {
    setBookingToFinish(booking);
    setShowConfirmDialog(true);
  };

  const handleConfirmFinish = async () => {
    if (bookingToFinish) {
      setShowConfirmDialog(false);
      await handleFinishBooking(bookingToFinish);
      setBookingToFinish(null);
    }
  };

  const handleCancelFinish = () => {
    setShowConfirmDialog(false);
    setBookingToFinish(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking || !currentUserId) return;

    if (!reviewTitle.trim() || !reviewText.trim() || rating === 0) {
      setNotification("Please fill in all fields and select a rating");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      setSubmitting(true);

      await createBookingReview({
        userId: currentUserId,
        bookingId: selectedBooking.id,
        tourGuideId: selectedBooking.tours?.tour_guides?.id || 0,
        destinationId: selectedBooking.tours?.destination_id,
        rating,
        title: reviewTitle.trim(),
        content: reviewText.trim(),
        tags: [],
        images: [],
      });

      setNotification("Review submitted successfully!");
      setTimeout(() => {
        setNotification("");
        setSelectedBooking(null);
        loadCompletedBookings(); // Reload to update eligible bookings
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setNotification(
        error instanceof Error ? error.message : "Failed to submit review"
      );
      setTimeout(() => setNotification(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (num: number) => {
    setRating(num);
  };

  const handleSatisfactionClick = (emoji: string) => {
    setSelectedIcon(emoji);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDatePassed = (dateString: string) => {
    const tourDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tourDate < today;
  };

  if (loading) {
    return (
      <div className="w-full px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="text-center mt-32 mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Travel History
          </h1>
          <p className="text-lg text-gray-600">
            Loading your travel history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 md:px-12 lg:px-20 xl:px-32">
      <div className="text-center mt-32 mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Travel History
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto mb-4">
          Relive your past adventures and share your experiences with fellow
          travelers.
        </p>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "finishable"
                  ? "bg-white text-teal-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("finishable")}
            >
              Finish Tour ({finishableBookings.length})
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "bookings"
                  ? "bg-white text-teal-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("bookings")}
            >
              Trip History
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "reviews"
                  ? "bg-white text-teal-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              My Reviews ({userReviews.length})
            </button>
          </div>
        </div>

        {/* Stats - show for all tabs */}
        {(activeTab === "bookings" || activeTab === "finishable") && (
          <div className="flex justify-center space-x-6 text-sm text-gray-600 mt-6">
            {activeTab === "finishable" && (
              <div className="text-center">
                <span className="block text-2xl font-bold text-orange-600">
                  {finishableBookings.length}
                </span>
                <span>Ready to Complete</span>
              </div>
            )}
            {activeTab === "bookings" && allCompletedBookings.length > 0 && (
              <>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-teal-600">
                    {allCompletedBookings.length}
                  </span>
                  <span>Total Trips</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-green-600">
                    {reviewedBookingIds.size}
                  </span>
                  <span>Reviewed</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-orange-600">
                    {allCompletedBookings.length - reviewedBookingIds.size}
                  </span>
                  <span>Pending Review</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === "finishable" ? (
        finishableBookings.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No tours ready to finish.</p>
            <p className="text-sm text-gray-500 mt-2">
              Tours that have passed their date and need to be completed will
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-16">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-orange-600 mr-2" />
                <p className="text-orange-800 font-medium">
                  {finishableBookings.length} tour
                  {finishableBookings.length > 1 ? "s" : ""} ready to be
                  completed
                </p>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Complete these tours to write reviews and share your
                experiences.
              </p>
            </div>
            {finishableBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-6 border rounded-lg shadow-sm bg-white flex items-center justify-between w-full border-l-4 border-l-orange-500"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 relative group">
                    <img
                      src={
                        booking.tours?.tour_guides?.users?.profile_picture ||
                        DEFAULT_AVATAR
                      }
                      alt={`${booking.tours?.tour_guides?.users?.first_name} ${booking.tours?.tour_guides?.users?.last_name}`}
                      className="w-full h-full rounded-full object-cover drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-orange-500/10 pointer-events-none"></div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {booking.tours?.title || "Tour"}
                      </h2>
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                        Ready to Complete
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {booking.tours?.location}
                    </p>
                    <p className="text-sm text-gray-500">
                      Guide: {booking.tours?.tour_guides?.users?.first_name}{" "}
                      {booking.tours?.tour_guides?.users?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {formatDate(booking.date)}
                      {isDatePassed(booking.date) && (
                        <span className="ml-2 text-xs text-orange-600 font-medium">
                          (Past due)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Participants: {booking.participants}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    className={`px-4 py-2 rounded-lg text-white text-sm transition flex items-center space-x-2 ${
                      submitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    onClick={() => handleShowConfirmDialog(booking)}
                    disabled={submitting}
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {submitting ? "Completing..." : "Complete Tour"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "bookings" ? (
        allCompletedBookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No completed trips found.</p>
            <p className="text-sm text-gray-500 mt-2">
              Book a tour to start your travel journey!
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-16">
            {allCompletedBookings.map((booking) => {
              const isReviewed = reviewedBookingIds.has(booking.id);
              return (
                <div
                  key={booking.id}
                  className="p-6 border rounded-lg shadow-sm bg-white flex items-center justify-between w-full"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 relative group">
                      <img
                        src={
                          booking.tours?.tour_guides?.users?.profile_picture ||
                          DEFAULT_AVATAR
                        }
                        alt={`${booking.tours?.tour_guides?.users?.first_name} ${booking.tours?.tour_guides?.users?.last_name}`}
                        className="w-full h-full rounded-full object-cover drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-teal-500/10 pointer-events-none"></div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {booking.tours?.title || "Tour"}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {booking.tours?.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        Guide: {booking.tours?.tour_guides?.users?.first_name}{" "}
                        {booking.tours?.tour_guides?.users?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {formatDate(booking.date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Participants: {booking.participants}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isReviewed ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Reviewed
                        </span>
                        <button
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition flex items-center space-x-2"
                          onClick={() => handleViewReview(booking.id)}
                        >
                          <Eye size={16} />
                          <span>View Review</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition"
                        onClick={() => handleSelectBooking(booking)}
                      >
                        Write Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : /* Reviews Tab */
      userReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No reviews written yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Complete a trip and write your first review!
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-16">
          {userReviews.map((review) => (
            <div
              key={review.id}
              className="p-6 border rounded-lg shadow-sm bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {review.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Star
                          key={num}
                          size={16}
                          className={`${
                            num <= review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        ({review.rating}/5)
                      </span>
                    </div>
                  </div>

                  {/* Tour info */}
                  {review.bookings && (
                    <div className="text-sm text-gray-600 mb-3">
                      <p className="font-medium">
                        {review.bookings.tours?.title}
                      </p>
                      <p>{review.bookings.tours?.location}</p>
                      <p>Trip Date: {review.bookings.date}</p>
                      {review.tour_guides?.users && (
                        <p>
                          Guide: {review.tour_guides.users.first_name}{" "}
                          {review.tour_guides.users.last_name}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-gray-700 mb-3">{review.content}</p>

                  {/* Tags */}
                  {review.review_tags && review.review_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {review.review_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs"
                        >
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Images */}
                  {review.review_images && review.review_images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.review_images.map((img, index) => (
                        <img
                          key={index}
                          src={img.image_url}
                          alt={`Review ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t pt-3">
                <div className="flex justify-between items-center">
                  <span>
                    Reviewed on:{" "}
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {review.is_verified && (
                    <span className="text-green-600 font-medium">
                      ✓ Verified Review
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-xl mx-4 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 relative group mr-6">
                <img
                  src={
                    selectedBooking.tours?.tour_guides?.users
                      ?.profile_picture || DEFAULT_AVATAR
                  }
                  alt={`${selectedBooking.tours?.tour_guides?.users?.first_name} ${selectedBooking.tours?.tour_guides?.users?.last_name}`}
                  className="w-full h-full rounded-full object-cover drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-teal-500/10 pointer-events-none"></div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Review for {selectedBooking.tours?.title}
                </h2>
                <p className="text-sm text-gray-600">
                  Guide: {selectedBooking.tours?.tour_guides?.users?.first_name}{" "}
                  {selectedBooking.tours?.tour_guides?.users?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedBooking.tours?.location} •{" "}
                  {formatDate(selectedBooking.date)}
                </p>
              </div>
            </div>

            <input
              type="text"
              className="w-full p-3 border rounded-md mb-4"
              placeholder="Review title..."
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
            />

            <textarea
              className="w-full p-4 border rounded-md mb-5"
              placeholder="Share your experience..."
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <div className="mb-5">
              <p className="mb-2 font-medium">Rating: *</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={num}
                    size={24}
                    className={`cursor-pointer transition-colors ${
                      num <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleRatingClick(num)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-2 font-medium">Satisfaction:</p>
              <div className="flex space-x-6 text-2xl">
                {satisfactionIcons.map((icon, idx) => (
                  <span
                    key={idx}
                    className={`cursor-pointer p-2 rounded-full transition ${
                      selectedIcon === icon.emoji
                        ? "bg-gray-300"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleSatisfactionClick(icon.emoji)}
                  >
                    {icon.emoji}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setSelectedBooking(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white transition ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
                onClick={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-2xl mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {selectedReview.title}
                </h2>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Star
                        key={num}
                        size={20}
                        className={`${
                          num <= selectedReview.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-gray-700">
                    {selectedReview.rating}/5
                  </span>
                  {selectedReview.is_verified && (
                    <span className="text-green-600 font-medium text-sm">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={handleCloseReviewView}
              >
                ✕
              </button>
            </div>

            {/* Trip Details */}
            {selectedReview.bookings && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Trip Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium">
                      {selectedReview.bookings.tours?.title}
                    </p>
                    <p>{selectedReview.bookings.tours?.location}</p>
                  </div>
                  <div>
                    <p>Trip Date: {selectedReview.bookings.date}</p>
                    {selectedReview.tour_guides?.users && (
                      <p>
                        Guide: {selectedReview.tour_guides.users.first_name}{" "}
                        {selectedReview.tour_guides.users.last_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Review Content */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Review</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedReview.content}
              </p>
            </div>

            {/* Tags */}
            {selectedReview.review_tags &&
              selectedReview.review_tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.review_tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                      >
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Images */}
            {selectedReview.review_images &&
              selectedReview.review_images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReview.review_images.map((img, index) => (
                      <img
                        key={index}
                        src={img.image_url}
                        alt={`Review ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Review Date */}
            <div className="text-sm text-gray-500 border-t pt-4">
              Review written on:{" "}
              {new Date(selectedReview.created_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                onClick={handleCloseReviewView}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && bookingToFinish && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md mx-4 shadow-lg">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Complete Tour?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to mark "{bookingToFinish.tours?.title}"
                as completed? This action cannot be undone, but you'll be able
                to write a review afterwards.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  onClick={handleCancelFinish}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-2 rounded-lg text-white transition ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  onClick={handleConfirmFinish}
                  disabled={submitting}
                >
                  {submitting ? "Completing..." : "Yes, Complete Tour"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white px-10 py-6 rounded-lg shadow-md text-center max-w-xs relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setNotification("")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <p
              className={`text-lg font-semibold ${
                notification.includes("success") ||
                notification.includes("completed") ||
                notification.includes("successfully")
                  ? "text-green-600"
                  : notification.includes("Failed") ||
                    notification.includes("error") ||
                    notification.includes("already been reviewed")
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {notification}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
