import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { DEFAULT_AVATAR } from "../asset/image/defaultAvatar";
import { BookingStatusService } from "../services/bookingStatusService";
import { createBookingReview } from "../services/reviewService";
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
  const [completedBookings, setCompletedBookings] = useState<
    CompletedBooking[]
  >([]);
  const [selectedBooking, setSelectedBooking] =
    useState<CompletedBooking | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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
        return;
      }

      setCurrentUserId(user.id);
      const completed = await BookingStatusService.getCompletedTours(user.id);
      setCompletedBookings(completed);
    } catch (error) {
      console.error("Error loading completed bookings:", error);
      setNotification("Failed to load travel history");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBooking = (booking: CompletedBooking) => {
    setSelectedBooking(booking);
    setReviewText("");
    setReviewTitle("");
    setRating(0);
    setSelectedIcon(null);
    setNotification("");
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Relive your past adventures and share your experiences with fellow
          travelers.
        </p>
      </div>

      {completedBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No completed trips found.</p>
          <p className="text-sm text-gray-500 mt-2">
            Book a tour to start your travel journey!
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-16">
          {completedBookings.map((booking) => (
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
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition"
                onClick={() => handleSelectBooking(booking)}
              >
                Write Review
              </button>
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

      {notification && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white px-10 py-6 rounded-lg shadow-md text-center max-w-xs">
            <p
              className={`text-lg font-semibold ${
                notification.includes("success")
                  ? "text-green-600"
                  : notification.includes("Failed") ||
                    notification.includes("error")
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
