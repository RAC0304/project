import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import TourGuideSidebar from "../components/layout/TourGuideSidebar";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  DollarSign,
  Clock,
  MessageSquare,
  TrendingUp,
  Eye,
  Mail,
  Phone,
  Languages,
  Award,
  User,
  X,
} from "lucide-react";
import femaleImg from "../asset/image/female.jpg";

// Define tour data interface
interface TourData {
  title: string;
  description: string;
  location: string;
  duration: string;
  price: string;
  date: string;
  time: string;
  capacity: string;
  id?: number; // Added for editing existing tours
}

// Edit Tour Modal component
const EditTourModal: React.FC<{
  isOpen: boolean;
  tourData: TourData;
  onClose: () => void;
  onSave: (tourData: TourData) => void;
}> = ({ isOpen, tourData: initialTourData, onClose, onSave }) => {
  const [tourData, setTourData] = useState<TourData>(initialTourData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTourData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(tourData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Tour</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tour Title
              </label>
              <input
                type="text"
                name="title"
                value={tourData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g. Historic City Center Walking Tour"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={tourData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="Describe your tour and what makes it special..."
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={tourData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. Rome, Italy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <input
                  type="text"
                  name="duration"
                  value={tourData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. 2.5"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Person ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={tourData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. 49.99"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={tourData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. 10"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={tourData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={tourData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reply Modal component

const TourGuideDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = React.useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Default to expanded sidebar
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tourToEdit, setTourToEdit] = useState<TourData | null>(null);

  // Handle editing a tour
  const handleEditTour = (tourData: TourData) => {
    // In a real app, this would send data to an API
    console.log("Updating tour:", tourData);

    // Update tour in the list (in a real app this would happen after API confirms update)
    // For this demo, we're just showing a success message
    alert("Tour updated successfully!");

    // Close the modal
    setIsEditModalOpen(false);
    setTourToEdit(null);
  };

  // Open edit modal with tour data
  const openEditModal = (tour: TourData) => {
    setTourToEdit(tour);
    setIsEditModalOpen(true);
  };

  // Sample tour guide data - in a real app, this would come from an API
  const guideStats = {
    totalTours: 47,
    upcomingTours: 5,
    totalClients: 5,
    averageRating: 4.8,
    monthlyEarnings: 3250,
    responseRate: 98,
  };

  const upcomingTours = [
    {
      id: 1,
      title: "Historic Jakarta Walking Tour",
      date: "2024-01-15",
      time: "09:00 AM",
      clients: 6,
      location: "Jakarta, Indonesia",
      status: "confirmed",
    },
    {
      id: 2,
      title: "Borobudur Sunrise Private Tour",
      date: "2024-01-16",
      time: "02:00 PM",
      clients: 4,
      location: "Magelang, Indonesia",
      status: "confirmed",
    },
    {
      id: 3,
      title: "Bali Cultural Experience",
      date: "2024-01-18",
      time: "11:00 AM",
      clients: 8,
      location: "Ubud, Bali, Indonesia",
      status: "pending",
    },
  ];

  const recentReviews = [
    {
      id: 1,
      clientName: "Sarah Johnson",
      rating: 5,
      comment:
        "Amazing tour! Marco was incredibly knowledgeable and made history come alive.",
      tour: "Historic Rome Walking Tour",
      date: "2024-01-10",
    },
    {
      id: 2,
      clientName: "David Chen",
      rating: 5,
      comment: "Best guide ever! Highly recommend for anyone visiting Rome.",
      tour: "Vatican Museums Tour",
      date: "2024-01-08",
    },
    {
      id: 3,
      clientName: "Emma Wilson",
      rating: 4,
      comment: "Great experience, very professional and friendly.",
      tour: "Colosseum Tour",
      date: "2024-01-05",
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendColor?: string;
  }> = ({ title, value, icon, trend, trendColor = "text-green-500" }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trendColor} mt-1`}>
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-teal-50 rounded-lg">{icon}</div>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // handleCreateTour function is defined above
  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <TourGuideSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      {/* Main Content */}
      {/* Main Content */}
      <div
        className={`${
          sidebarCollapsed ? "lg:ml-36" : "lg:ml-60"
        } flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 transition-all duration-300`}
      >
        {/* Header */}{" "}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
          {" "}
          <div className="flex items-center">
            {" "}
            {/* Sidebar collapse toggle button - only visible on desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`mr-3 hidden  lg:block ${
                sidebarCollapsed ? "p-4" : "p-3"
              } rounded-md bg-white shadow hover:bg-gray-100 transition-all duration-200 text-gray-800`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {" "}
              {sidebarCollapsed ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${sidebarCollapsed ? "h-5 w-5" : "h-6 w-6"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {activePage === "dashboard" && "Dashboard"}
                {activePage === "tours" && "My Tours"}
                {activePage === "bookings" && "Bookings"}
                {activePage === "clients" && "Clients"}
                {activePage === "reviews" && "Reviews"}
                {activePage === "messages" && "Messages"}
                {activePage === "profile" && "My Profile"}
              </h1>

              <p className="text-gray-600 mt-1">
                Welcome back, {user?.profile.firstName} {user?.profile.lastName}
              </p>
            </div>
          </div>
        </div>
        {/* Profile Section - Only show on profile page */}
        {activePage === "profile" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="h-28 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
            <div className="px-6 py-6 md:px-8 md:py-8 -mt-20">
              <div className="flex flex-col md:flex-row">
                {/* Profile Image */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6 bg-white">
                  <img
                    src={femaleImg}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        {user?.profile.firstName} {user?.profile.lastName}
                      </h1>

                      {user?.profile.location && (
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">
                            Jakarta, Indonesia
                          </span>
                        </div>
                      )}

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-block px-3 py-1 text-sm bg-teal-50 text-teal-700 rounded-full">
                          Tour Guide
                        </span>
                        <span className="inline-block px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-full">
                          {guideStats.totalTours} Tours
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0">
                      <button className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-5 py-2.5 rounded-md transition-colors flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-600">
                      {user?.profile.bio ||
                        "No bio available. Add your professional bio to tell clients about your experience and expertise."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Content based on active page */}
        {activePage === "dashboard" && (
          <>
            {" "}
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <StatCard
                title="Total Tours"
                value={guideStats.totalTours}
                icon={<MapPin className="w-6 h-6 text-teal-600" />}
                trend="+3 this month"
              />
              <StatCard
                title="Upcoming Tours"
                value={guideStats.upcomingTours}
                icon={<Calendar className="w-6 h-6 text-teal-600" />}
                trend="Next: Tomorrow"
                trendColor="text-blue-500"
              />
              <StatCard
                title="Total Clients"
                value={guideStats.totalClients}
                icon={<Users className="w-6 h-6 text-teal-600" />}
                trend="+12 this month"
              />
              <StatCard
                title="Average Rating"
                value={guideStats.averageRating}
                icon={<Star className="w-6 h-6 text-teal-600" />}
                trend="Excellent"
                trendColor="text-green-500"
              />
              <StatCard
                title="Monthly Earnings"
                value={`$${guideStats.monthlyEarnings.toLocaleString()}`}
                icon={<DollarSign className="w-6 h-6 text-teal-600" />}
                trend="+15% this month"
              />
              <StatCard
                title="Response Rate"
                value={`${guideStats.responseRate}%`}
                icon={<MessageSquare className="w-6 h-6 text-teal-600" />}
                trend="Excellent"
                trendColor="text-green-500"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
              {" "}
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
                  {upcomingTours.map((tour) => (
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
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="flex items-center space-x-1 px-3 py-1 bg-teal-50 text-teal-700 rounded text-sm hover:bg-teal-100 transition-colors">
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </button>
                        <button className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-700 rounded text-sm hover:bg-gray-100 transition-colors">
                          <MessageSquare className="w-3 h-3" />
                          <span>Message Clients</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>{" "}
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
                          </span>
                          <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-400 fill-current"
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
            </div>{" "}
            {/* Quick Actions */}
            <div
              onClick={() => setActivePage("bookings")}
              className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
            >
              <button className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Manage Schedule</h3>
                <p className="text-sm text-gray-600">
                  View and edit your availability
                </p>
              </button>
              <button
                onClick={() => setActivePage("messages")}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
              >
                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Messages</h3>
                <p className="text-sm text-gray-600">Chat with your clients</p>
              </button>
              <button
                onClick={() => setActivePage("reviews")}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
              >
                <Star className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Reviews</h3>
                <p className="text-sm text-gray-600">View all your reviews</p>
              </button>
            </div>
          </>
        )}
        {/* Profile page content (additional to the profile header) */}
        {activePage === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">
                      {user?.email || "No email available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800">
                      {user?.profile.phone || "No phone available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Languages className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="text-gray-800">English, Spanish</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Award className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="text-gray-800">
                      5+ years of guiding experience
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">
                      Typical Response Time
                    </p>
                    <p className="text-gray-800">Within 3 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid - Fixed duplicate stats section */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Account Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    value={user?.email || ""}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      defaultValue={user?.profile.firstName || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      defaultValue={user?.profile.lastName || ""}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    defaultValue={user?.profile.phone || ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    defaultValue={user?.profile.location || ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    defaultValue={user?.profile.bio || ""}
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button className="bg-teal-600 text-white px-5 py-2 rounded-md hover:bg-teal-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Tours page content */}
        {activePage === "tours" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Tours</h2>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tour Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Duration
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Historic Rome Walking Tour
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        Jakarta, Indonesia
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">3 hours</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">$50 / person</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-teal-600 hover:text-teal-900 mr-3"
                        onClick={() =>
                          openEditModal({
                            id: 1,
                            title: "Historic Rome Walking Tour",
                            description:
                              "Visit the most iconic sites of ancient Rome with an expert historian guide.",
                            location: "Jakarta, Indonesia",
                            duration: "3",
                            price: "50",
                            date: "2024-01-15",
                            time: "09:00",
                            capacity: "10",
                          })
                        }
                      >
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Vatican Museums Private Tour
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">Vatican City</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">4 hours</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">$75 / person</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-teal-600 hover:text-teal-900 mr-3"
                        onClick={() =>
                          openEditModal({
                            id: 2,
                            title: "Vatican Museums Private Tour",
                            description:
                              "Skip the lines and explore the Vatican Museums, Sistine Chapel, and St. Peter's Basilica with a private guide.",
                            location: "Vatican City",
                            duration: "4",
                            price: "75",
                            date: "2024-01-16",
                            time: "14:00",
                            capacity: "6",
                          })
                        }
                      >
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Bookings page content - Fix duplicate content */}
        {activePage === "bookings" && (
          <div className="space-y-6">
            {/* Header and Search/Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Manage Bookings
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      className="pl-10 pr-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                    <option value="all">All Tours</option>
                    <option value="rome-walking">
                      Historic Rome Walking Tour
                    </option>
                    <option value="vatican">
                      Vatican Museums Private Tour
                    </option>
                    <option value="colosseum">
                      Colosseum Underground Experience
                    </option>
                  </select>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center">
                  Upcoming
                  <button className="ml-2 text-teal-500 hover:text-teal-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center">
                  This Month
                  <button className="ml-2 text-teal-500 hover:text-teal-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Booking ID
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tour Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Client
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Group Size
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Booking Entry 1 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #B001
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Historic Rome Walking Tour
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                            SJ
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              Sarah Johnson
                            </div>
                            <div className="text-xs text-gray-500">
                              sarah.j@example.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Jan 15, 2024
                        </div>
                        <div className="text-xs text-gray-500">09:00 AM</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">4 people</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          $200
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-teal-600 hover:text-teal-900 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Message
                        </button>
                      </td>
                    </tr>
                    {/* Booking Entry 2 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #B002
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Vatican Museums Private Tour
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                            DC
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              David Chen
                            </div>
                            <div className="text-xs text-gray-500">
                              david.c@example.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Jan 16, 2024
                        </div>
                        <div className="text-xs text-gray-500">02:00 PM</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">2 people</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          $150
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-teal-600 hover:text-teal-900 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Message
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">5</span> of{" "}
                    <span className="font-medium">25</span> bookings
                  </div>
                  <div>
                    <nav
                      className="relative inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                      <a
                        href="#"
                        aria-current="page"
                        className="relative inline-flex items-center px-4 py-2 border border-teal-500 bg-teal-50 text-sm font-medium text-teal-600"
                      >
                        1
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Clients page content */}
        {activePage === "clients" && (
          <div className="space-y-6">
            {/* Header and Search/Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  My Clients
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search clients..."
                      className="pl-10 pr-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="new">New</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                    <option value="all">All Tours</option>
                    <option value="rome-walking">
                      Historic Rome Walking Tour
                    </option>
                    <option value="vatican">
                      Vatican Museums Private Tour
                    </option>
                    <option value="colosseum">
                      Colosseum Underground Experience
                    </option>
                  </select>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center">
                  Recent Clients
                  <button className="ml-2 text-teal-500 hover:text-teal-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center">
                  Return Clients
                  <button className="ml-2 text-teal-500 hover:text-teal-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Client Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm">+12 </span>
                  <span className="text-gray-500 text-sm ml-1">
                    from last month
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Clients</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-50">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div className="text-gray-500 text-sm mt-2">
                  86% of total clients
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Return Rate</p>
                    <p className="text-2xl font-bold text-gray-900">38%</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-50">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div className="text-gray-500 text-sm mt-2">
                  5 clients booked multiple tours
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg. Rating</p>
                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-50">
                    <Star className="w-6 h-6 text-yellow-600 fill-current" />
                  </div>
                </div>
                <div className="text-gray-500 text-sm mt-2">
                  From client reviews
                </div>
              </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Client
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Contact Info
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tours Booked
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Last Tour Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Client Entry 1 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                            SJ
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Sarah Johnson
                            </div>
                            <div className="text-xs text-gray-500">
                              United States
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          sarah.j@example.com
                        </div>
                        <div className="text-xs text-gray-500">
                          +1 555-123-4567
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">3 tours</div>
                        <div className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer">
                          View bookings
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Jan 15, 2024
                        </div>
                        <div className="text-xs text-gray-500">
                          Historic Rome Walking Tour
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-teal-600 hover:text-teal-900 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Message
                        </button>
                      </td>
                    </tr>

                    {/* Client Entry 2 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                            DC
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              David Chen
                            </div>
                            <div className="text-xs text-gray-500">
                              Singapore
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          david.c@example.com
                        </div>
                        <div className="text-xs text-gray-500">
                          +65 9123 4567
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">1 tour</div>
                        <div className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer">
                          View bookings
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Jan 16, 2024
                        </div>
                        <div className="text-xs text-gray-500">
                          Vatican Museums Private Tour
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-teal-600 hover:text-teal-900 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Message
                        </button>
                      </td>
                    </tr>

                    {/* Client Entry 3 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                            EW
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Emma Wilson
                            </div>
                            <div className="text-xs text-gray-500">
                              United Kingdom
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          emma.w@example.com
                        </div>
                        <div className="text-xs text-gray-500">
                          +44 7700 900123
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">2 tours</div>
                        <div className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer">
                          View bookings
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Jan 18, 2024
                        </div>
                        <div className="text-xs text-gray-500">
                          Historic Rome Walking Tour
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Upcoming
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-teal-600 hover:text-teal-900 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Message
                        </button>
                      </td>
                    </tr>

                    {/* Client Entry 4 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                            RL
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Robert Lewis
                            </div>
                            <div className="text-xs text-gray-500">Canada</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          robert.l@example.com
                        </div>
                        <div className="text-xs text-gray-500">
                          +1 416-555-7890
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">1 tour</div>
                        <div className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer">
                          View bookings
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Jan 20, 2024
                        </div>
                        <div className="text-xs text-gray-500">
                          Vatican Museums Private Tour
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          New
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-teal-600 hover:text-teal-900 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Message
                        </button>
                      </td>
                    </tr>

                    {/* Client Entry 5 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                            AG
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Alice Garcia
                            </div>
                            <div className="text-xs text-gray-500">Spain</div>
                          </div>
                        </div>
                      </td>{" "}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          alice.g@example.com
                        </div>
                        <div className="text-xs text-gray-500">
                          +34 612 34 56 78
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">4 tours</div>
                        <div className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer">
                          View bookings
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Jan 22, 2024
                        </div>
                        <div className="text-xs text-gray-500">
                          Historic Rome Walking Tour{" "}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-teal-600 hover:text-teal-900">
                          View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">5</span> of{" "}
                    <span className="font-medium">5</span> clients
                  </div>
                  <div>
                    <nav
                      className="relative inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-teal-500 bg-teal-50 text-sm font-medium text-teal-600">
                        1
                      </button>

                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Reviews page content */}
        {activePage === "reviews" && (
          <div className="space-y-6">
            {/* Header and Search/Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  My Reviews
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      className="pl-10 pr-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                    <option value="all">All Tours</option>
                    <option value="rome-walking">
                      Historic Rome Walking Tour
                    </option>
                    <option value="vatican">
                      Vatican Museums Private Tour
                    </option>
                    <option value="colosseum">
                      Colosseum Underground Experience
                    </option>
                  </select>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center">
                  Recent Reviews
                  <button className="ml-2 text-teal-500 hover:text-teal-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center">
                  5-Star Reviews
                  <button className="ml-2 text-teal-500 hover:text-teal-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-50">
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm ml-2">
                    Based on 5 reviews
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <div className="p-3 rounded-full bg-teal-50">
                    <MessageSquare className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm">+12 </span>
                  <span className="text-gray-500 text-sm ml-1">
                    from last month
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">5-Star Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-50">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div className="text-gray-500 text-sm mt-2">
                  84.6% of all reviews
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Response Rate</p>
                    <p className="text-2xl font-bold text-gray-900">96%</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div className="text-gray-500 text-sm mt-2">
                  You've responded to 5 of 3 reviews
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Rating Distribution
              </h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage =
                    rating === 5
                      ? 85
                      : rating === 4
                      ? 10
                      : rating === 3
                      ? 3
                      : rating === 2
                      ? 1.5
                      : 0.5;
                  const count = Math.round((percentage / 100) * 5);
                  return (
                    <div key={rating} className="flex items-center">
                      <div className="w-12 text-sm text-gray-700 flex items-center">
                        <span>{rating}</span>
                        <Star className="w-4 h-4 ml-1 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 mx-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-yellow-400 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-xs text-gray-500 text-right">
                        {count}
                      </div>
                      <div className="w-16 text-xs text-gray-500 text-right">
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  All Reviews
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {/* Review Item 1 */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                        SJ
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          Sarah Johnson
                        </div>
                        <div className="text-sm text-gray-500">
                          Jan 10, 2024
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                      Historic Rome Walking Tour
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Amazing tour! Marco was incredibly knowledgeable and made
                    history come alive. I learned so much about ancient Rome and
                    got to see places I would have never found on my own. Highly
                    recommend this tour to anyone visiting Rome!"
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Tour date: Jan 5, 2024
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-teal-600 hover:text-teal-800 text-sm flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                        Reply
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                          ></path>
                        </svg>
                        More
                      </button>
                    </div>
                  </div>
                </div>

                {/* Review Item 2 */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                        DC
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          David Chen
                        </div>
                        <div className="text-sm text-gray-500">Jan 8, 2024</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                      Vatican Museums Tour
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Best guide ever! Highly recommend for anyone visiting Rome.
                    The tour was well-organized, and we were able to skip most
                    of the lines. Our guide knew all the best spots for photos
                    and shared fascinating stories about the artwork."
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Tour date: Jan 2, 2024
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-teal-600 hover:text-teal-800 text-sm flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                        Reply
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                          ></path>
                        </svg>
                        More
                      </button>
                    </div>
                  </div>
                </div>

                {/* Review Item 3 with Reply */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                        EW
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          Emma Wilson
                        </div>
                        <div className="text-sm text-gray-500">Jan 5, 2024</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-400 fill-current"
                          />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                      Colosseum Tour
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Great experience, very professional and friendly. Our guide
                    was very accommodating to our group which included seniors
                    and children. The only suggestion would be to include more
                    time at the Roman Forum."
                  </p>

                  {/* Guide Reply */}
                  <div className="bg-gray-50 p-4 rounded-md mb-4 border-l-4 border-teal-500">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2">
                        <User className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Your Reply
                        </div>
                        <div className="text-xs text-gray-500">Jan 6, 2024</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      "Thank you for your feedback, Emma! I'm glad you and your
                      family enjoyed the tour. I appreciate your suggestion
                      about the Roman Forum - I'll look into adjusting the
                      timing for future tours to give guests more time to
                      explore this incredible site."
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Tour date: Dec 30, 2023
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-teal-600 hover:text-teal-800 text-sm flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                        Edit Reply
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                          ></path>
                        </svg>
                        More
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">3</span> of{" "}
                    <span className="font-medium">5</span> reviews
                  </div>
                  <div>
                    <nav
                      className="relative inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                      <a
                        href="#"
                        aria-current="page"
                        className="relative inline-flex items-center px-4 py-2 border border-teal-500 bg-teal-50 text-sm font-medium text-teal-600"
                      >
                        1
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Messages page content */}
        {activePage === "messages" && (
          <div className="space-y-6">
            {/* Header and Search Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Messages
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      className="pl-10 pr-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                    <option value="all">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="important">Important</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                {/* Message Item 1 */}
                <div className="p-6 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                        SJ
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          Sarah Johnson
                        </div>
                        <div className="text-sm text-gray-500">2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Unread
                      </span>
                    </div>
                  </div>
                  <div className="ml-13">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Re: Historic Rome Walking Tour</strong>
                    </p>
                    <p className="text-gray-700">
                      Hi! I wanted to ask about the meeting point for tomorrow's
                      tour...
                    </p>
                  </div>
                </div>

                {/* Message Item 2 */}
                <div className="p-6 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                        DC
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          David Chen
                        </div>
                        <div className="text-sm text-gray-500">1 day ago</div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-13">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Thank you for the amazing tour!</strong>
                    </p>
                    <p className="text-gray-700">
                      The Vatican tour was incredible. Thank you for making it
                      so special...
                    </p>
                  </div>
                </div>

                {/* Message Item 3 */}
                <div className="p-6 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                        EW
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          Emma Wilson
                        </div>
                        <div className="text-sm text-gray-500">3 days ago</div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-13">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Booking Confirmation Required</strong>
                    </p>
                    <p className="text-gray-700">
                      Could you please confirm our booking for the Colosseum
                      tour...
                    </p>
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">3</span> of{" "}
                    <span className="font-medium">15</span> messages
                  </div>
                  <div>
                    <nav
                      className="relative inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-teal-500 bg-teal-50 text-sm font-medium text-teal-600">
                        1
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        2
                      </button>
                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Tour Modal */}
      {tourToEdit && (
        <EditTourModal
          isOpen={isEditModalOpen}
          tourData={tourToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditTour}
        />
      )}
    </div>
  );
};

export default TourGuideDashboard;
