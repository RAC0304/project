import React, { useState } from "react";
import { Calendar, Clock, CheckCircle, Star } from "lucide-react";
import { useBookingStatus } from "../../hooks/useBookingStatus";
import { BookingWithDetails } from "../../services/bookingStatusService";
import ReviewModal from "./ReviewModal";

interface BookingStatusTabsProps {
  userId: number;
  hideReviewNeeded?: boolean;
}

const BookingStatusTabs: React.FC<BookingStatusTabsProps> = ({
  userId,
  hideReviewNeeded = false,
}) => {
  const {
    upcomingTours,
    todayTours,
    completedTours,
    eligibleForReview,
    loading,
    error,
  } = useBookingStatus(userId);

  const [activeTab, setActiveTab] = useState<
    "upcoming" | "today" | "completed" | "review"
  >("upcoming");
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithDetails | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const allTabs = [
    {
      id: "upcoming",
      label: "Upcoming Tours",
      count: upcomingTours.length,
      icon: Calendar,
    },
    { id: "today", label: "Today", count: todayTours.length, icon: Clock },
    {
      id: "completed",
      label: "Completed",
      count: completedTours.length,
      icon: CheckCircle,
    },
    {
      id: "review",
      label: "Review Needed",
      count: eligibleForReview.length,
      icon: Star,
    },
  ];

  // Filter tabs based on hideReviewNeeded prop
  const tabs = hideReviewNeeded
    ? allTabs.filter((tab) => tab.id !== "review")
    : allTabs;

  const handleWriteReview = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const renderBookingCard = (
    booking: BookingWithDetails,
    showReviewButton = false
  ) => (
    <div
      key={booking.id}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {booking.tours?.title || "Tour Title"}
          </h3>
          <p className="text-gray-600">
            {booking.tours?.location || "Location"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-medium">
            {new Date(booking.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <img
          src={
            booking.tours?.tour_guides?.users?.profile_picture ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.tours?.tour_guides?.users?.first_name}`
          }
          alt="Tour Guide"
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <p className="font-medium">
            {booking.tours?.tour_guides?.users?.first_name}{" "}
            {booking.tours?.tour_guides?.users?.last_name}
          </p>
          <p className="text-sm text-gray-500">Tour Guide</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              booking.status === "confirmed"
                ? "bg-blue-100 text-blue-800"
                : booking.status === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {booking.status}
          </span>
        </div>
        {showReviewButton && (
          <button
            onClick={() => handleWriteReview(booking)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Show contact info for today's tours */}
      {activeTab === "today" && booking.tours?.tour_guides?.users?.phone && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Contact: {booking.tours.tour_guides.users.phone}
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        <span className="ml-3 text-gray-600">Loading booking status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(
                tab.id as "upcoming" | "today" | "completed" | "review"
              )
            }
            className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "upcoming" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Upcoming Tours</h2>
            {upcomingTours.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming tours</p>
                <p className="text-sm text-gray-400 mt-2">
                  Book a tour to see it here!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingTours.map((booking) => renderBookingCard(booking))}
              </div>
            )}
          </div>
        )}

        {activeTab === "today" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Today's Tours</h2>
            {todayTours.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tours today</p>
                <p className="text-sm text-gray-400 mt-2">
                  Enjoy your free day!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {todayTours.map((booking) => renderBookingCard(booking))}
              </div>
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Completed Tours</h2>
            {completedTours.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No completed tours</p>
                <p className="text-sm text-gray-400 mt-2">
                  Complete a tour to see it here!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {completedTours.map((booking) => renderBookingCard(booking))}
              </div>
            )}
          </div>
        )}

        {activeTab === "review" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Write Reviews</h2>
            {eligibleForReview.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tours awaiting review</p>
                <p className="text-sm text-gray-400 mt-2">
                  Complete tours will appear here for review!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {eligibleForReview.map((booking) =>
                  renderBookingCard(booking, true)
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          onReviewSubmitted={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
            // Refresh data akan terjadi otomatis via subscription
          }}
        />
      )}
    </div>
  );
};

export default BookingStatusTabs;
