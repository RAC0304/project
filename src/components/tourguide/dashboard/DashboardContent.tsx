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

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Define the type for the guide stats
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

// Define the type for upcoming tours
interface UpcomingTour {
    id: number;
    title: string;
    date: string;
    time: string;
    clients: number;
    location: string;
    status: "confirmed" | "pending" | "cancelled";
}

// Define the type for reviews
interface Review {
    id: number;
    clientName: string;
    rating: number;
    comment: string;
    tour: string;
    date: string;
}

interface DashboardContentProps {
    guideStats: GuideStats;
    upcomingTours: UpcomingTour[];
    recentReviews: Review[];
    setActivePage: (page: string) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
    guideStats,
    upcomingTours,
    recentReviews,
    setActivePage,
}) => {
    // State for modals
    const [selectedTour, setSelectedTour] = useState<UpcomingTour | null>(null);
    const [isTourDetailsModalOpen, setIsTourDetailsModalOpen] = useState(false);
    const [isMessageClientsModalOpen, setIsMessageClientsModalOpen] = useState(false);

    // Handlers for modal actions
    const handleViewDetails = (tour: UpcomingTour) => {
        setSelectedTour(tour);
        setIsTourDetailsModalOpen(true);
    };

    const handleMessageClients = (tour: UpcomingTour) => {
        setSelectedTour(tour);
        setIsMessageClientsModalOpen(true);
    };

    const closeTourDetailsModal = () => {
        setIsTourDetailsModalOpen(false);
        setSelectedTour(null);
    };

    const closeMessageClientsModal = () => {
        setIsMessageClientsModalOpen(false);
        setSelectedTour(null);
    };
    return (
        <>            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <StatCard
                    key="monthly-bookings"
                    title="Monthly Bookings"
                    value={guideStats.monthlyBookings}
                    icon={<Calendar className="w-6 h-6 text-teal-600" />}
                    trend={guideStats.bookingsTrend}
                    trendType="increase"
                    subtext={`${guideStats.upcomingTours} upcoming tours`}
                    bgColor="bg-teal-50"
                />
                <StatCard
                    key="monthly-earnings"
                    title="Monthly Earnings"
                    value={formatCurrency(guideStats.monthlyEarnings)}
                    icon={<DollarSign className="w-6 h-6 text-green-600" />}
                    trend={guideStats.earningsTrend}
                    trendType="increase"
                    bgColor="bg-green-50"
                />
                <StatCard
                    key="total-clients"
                    title="Total Clients"
                    value={guideStats.totalClients}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    trend={guideStats.clientsTrend}
                    trendType="increase"
                    subtext={`${guideStats.totalTours} total tours`}
                    bgColor="bg-blue-50"
                />
                <StatCard
                    key="guide-rating"
                    title="Guide Rating"
                    value={guideStats.averageRating.toFixed(1)}
                    icon={<Star className="w-6 h-6 text-amber-500" fill="currentColor" />}
                    trend={guideStats.ratingTrend}
                    trendType="achievement"
                    subtext={`${guideStats.responseRate}% response rate`}
                    bgColor="bg-amber-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
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
                                                {tour.date} at {tour.time}
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
                                    </div>                                    <div className="mt-3 flex flex-wrap gap-2">
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
                                        </button>
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
                        {recentReviews.map((review) => (
                            <div
                                key={review.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-gray-900">
                                            {review.clientName}
                                        </span>                                        <div className="flex items-center">
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
                                    <span className="text-xs text-gray-500">
                                        {review.date}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    "{review.comment}"
                                </p>
                                <p className="text-xs text-gray-500">
                                    Tour: {review.tour}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>            {/* Quick Actions */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <button
                    key="manage-schedule"
                    onClick={() => setActivePage("bookings")}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
                >
                    <Calendar className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
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
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">Messages</h3>
                    <p className="text-sm text-gray-600">Chat with your clients</p>
                </button>
                <button
                    key="reviews"
                    onClick={() => setActivePage("reviews")}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
                >
                    <Star className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">Reviews</h3>                    <p className="text-sm text-gray-600">View all your reviews</p>
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
            />
        </>
    );
};

export default DashboardContent;
