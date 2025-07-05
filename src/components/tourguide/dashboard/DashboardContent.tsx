import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  DollarSign,
  MessageSquare,
  Eye,
} from "lucide-react";
import { getStatusColor } from "../../../utils/statusHelpers";
import StatCard from "./StatCard";
import TourDetailsModal from "../modals/TourDetailsModal";
import MessageClientsModal from "../modals/MessageClientsModal";
import { supabase } from "../../../utils/supabaseClient";

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface GuideStats {
  totalTours: number;
  upcomingTours: number;
  totalClients: number;
  averageRating: number;
  monthlyEarnings: number;
  responseRate: number;
  monthlyBookings: number;
  bookingsTrend?: string;
  earningsTrend?: string;
  clientsTrend?: string;
  ratingTrend?: string;
}

interface UpcomingTour {
  id: number;
  title: string;
  date: string;
  time: string;
  clients: number;
  location: string;
  status: "confirmed" | "pending" | "cancelled";
  tour_id?: number; // Add tour_id for modal fetching
}

interface Review {
  id: number;
  clientName: string;
  rating: number;
  content: string;
  tour: string;
  date: string;
}

// Add Client type for modal
interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface DashboardContentProps {
  guideStats?: GuideStats;
  upcomingTours?: UpcomingTour[];
  recentReviews?: Review[];
  setActivePage?: (page: string) => void;
  loading?: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  guideStats,
  upcomingTours = [],
  recentReviews = [],
  setActivePage = () => { },
  loading = false,
}) => {
  const [selectedTour, setSelectedTour] = useState<UpcomingTour | null>(null);
  const [isTourDetailsModalOpen, setIsTourDetailsModalOpen] = useState(false);
  const [isMessageClientsModalOpen, setIsMessageClientsModalOpen] =
    useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Modal handlers
  const handleViewDetails = (tour: UpcomingTour) => {
    setSelectedTour(tour);
    setIsTourDetailsModalOpen(true);
  };
  const handleMessageClients = async (tour: UpcomingTour) => {
    setSelectedTour(tour);
    setIsMessageClientsModalOpen(true);
    setLoadingClients(true);

    // Use tour_id if available, otherwise fall back to id
    const tourIdToUse = tour.tour_id || tour.id;

    // Fetch clients who booked this tour
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        user_id,
        users (
          id,
          email,
          first_name,
          last_name,
          phone,
          profile_picture
        )
      `
      )
      .eq("tour_id", tourIdToUse)
      .eq("status", "confirmed");
    if (error) {
      setClients([]);
      setLoadingClients(false);
      return;
    } // Map to Client type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = (data || []).map((booking: any) => ({
      id: booking.users?.id || 0,
      name:
        booking.users?.first_name +
        (booking.users?.last_name ? " " + booking.users?.last_name : ""),
      email: booking.users?.email || "",
      phone: booking.users?.phone,
      avatar: booking.users?.profile_picture,
    }));
    setClients(mapped);
    setLoadingClients(false);
  };
  const closeTourDetailsModal = () => {
    setIsTourDetailsModalOpen(false);
    setSelectedTour(null);
  };
  const closeMessageClientsModal = () => {
    setIsMessageClientsModalOpen(false);
    setSelectedTour(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-gray-500">Loading dashboard data...</span>
      </div>
    );
  }

  // Semua data diambil dari props hasil fetch Supabase
  const stats = guideStats ?? {
    totalTours: 0,
    upcomingTours: 0,
    totalClients: 0,
    averageRating: 0,
    monthlyEarnings: 0,
    responseRate: 0,
    monthlyBookings: 0,
    bookingsTrend: "",
    earningsTrend: "",
    clientsTrend: "",
    ratingTrend: "",
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 ">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Tour Guide Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to your dashboard. View your stats, upcoming tours and recent
          reviews.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {" "}
        <StatCard
          key="monthly-bookings"
          title="Monthly Bookings"
          value={stats.monthlyBookings}
          icon={<Calendar className="w-6 h-6 text-teal-600" />}
          trend={stats.bookingsTrend}
          subtext={`${stats.upcomingTours} upcoming tours`}
          bgColor="bg-blue-50"
          topColor="bg-teal-500"
        />{" "}
        <StatCard
          key="monthly-earnings"
          title="Monthly Earnings"
          value={formatCurrency(stats.monthlyEarnings)}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          trend={stats.earningsTrend}
          bgColor="bg-green-50"
          topColor="bg-teal-500"
        />{" "}
        <StatCard
          key="total-clients"
          title="Total Clients"
          value={stats.totalClients}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          trend={stats.clientsTrend}
          subtext={`${stats.totalTours} total tours`}
          bgColor="bg-blue-50"
          topColor="bg-teal-500"
        />{" "}
        <StatCard
          key="guide-rating"
          title="Guide Rating"
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="w-6 h-6 text-amber-500" fill="currentColor" />}
          trend={stats.ratingTrend}
          subtext={`${stats.responseRate}% response rate`}
          bgColor="bg-amber-50"
          topColor="bg-teal-500"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Upcoming Tours */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Upcoming Tours
            </h2>
            <button
              onClick={() => setActivePage("tours")}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4 overflow-x-auto">
            {upcomingTours.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Belum ada upcoming tours.
              </div>
            ) : (
              upcomingTours.map((tour) => (
                <div
                  key={tour.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 mr-2">
                      {tour.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        tour.status
                      )}`}
                    >
                      {tour.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {tour.date ? formatDate(tour.date) : "-"}
                        {tour.time && tour.time !== "09:00" ? ` • ${tour.time}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{tour.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{tour.clients} clients</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewDetails(tour)}
                      className="flex items-center space-x-1 px-3 py-1 bg-teal-50 text-teal-700 rounded text-sm hover:bg-teal-100 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleMessageClients(tour)}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-700 rounded text-sm hover:bg-gray-100 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Message Clients</span>
                    </button>{" "}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Recent Reviews
            </h2>
            <button
              onClick={() => setActivePage("reviews")}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4 overflow-x-auto">
            {recentReviews.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Belum ada review.
              </div>
            ) : (
              recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {review.clientName}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={`${review.id}-${i}`}
                            className={`w-3 h-3 ${i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>{" "}
                  <p className="text-sm text-gray-600 mb-2">
                    "{review.content}"
                  </p>
                  <p className="text-xs text-gray-500">Tour: {review.tour}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <button
          key="manage-schedule"
          onClick={() => setActivePage("bookings")}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Manage Schedule</h3>
          <p className="text-sm text-gray-600">
            View and edit your availability
          </p>
        </button>
        <button
          key="messages"
          onClick={() => setActivePage("messages")}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Messages</h3>
          <p className="text-sm text-gray-600">Chat with your clients</p>
        </button>
        <button
          key="reviews"
          onClick={() => setActivePage("reviews")}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <Star className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Reviews</h3>
          <p className="text-sm text-gray-600">View all your reviews</p>
        </button>
      </div>
      {/* Modals */}
      <TourDetailsModal
        tour={selectedTour}
        isOpen={isTourDetailsModalOpen}
        onClose={closeTourDetailsModal}
      />
      <MessageClientsModal
        tour={selectedTour}
        isOpen={isMessageClientsModalOpen}
        onClose={closeMessageClientsModal}
        clients={clients}
        loading={loadingClients}
      />
    </div>
  );
};

export default DashboardContent;
