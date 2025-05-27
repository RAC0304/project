import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import RoleBadge from "../components/common/RoleBadge";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  DollarSign,
  Clock,
  MessageSquare,
  TrendingUp,
  Plus,
  Eye,
  Mail,
  Phone,
  Languages,
  Award,
  User,
  LogOut,
  Layout,
  Menu,
  X,
} from "lucide-react";

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

const CreateTourModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (tourData: TourData) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [tourData, setTourData] = useState<TourData>({
    title: "",
    description: "",
    location: "",
    duration: "",
    price: "",
    date: "",
    time: "",
    capacity: "",
  });

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
          <h2 className="text-xl font-semibold text-gray-800">
            Create New Tour
          </h2>
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
              Create Tour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TourGuideDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = React.useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tourToEdit, setTourToEdit] = useState<TourData | null>(null);

  // Handle creating a new tour
  const handleCreateTour = (tourData: TourData) => {
    // In a real app, this would send data to an API
    console.log("Creating new tour:", tourData);

    // Add tour to the list (in a real app this would happen after API confirms creation)
    // For this demo, we're just showing a success message
    alert("Tour created successfully!");

    // Close the modal
    setIsCreateModalOpen(false);
  };

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
    totalClients: 156,
    averageRating: 4.8,
    monthlyEarnings: 3250,
    responseRate: 98,
  };

  const upcomingTours = [
    {
      id: 1,
      title: "Historic Rome Walking Tour",
      date: "2024-01-15",
      time: "09:00 AM",
      clients: 6,
      location: "Roman Forum, Rome",
      status: "confirmed",
    },
    {
      id: 2,
      title: "Vatican Museums Private Tour",
      date: "2024-01-16",
      time: "02:00 PM",
      clients: 4,
      location: "Vatican City",
      status: "confirmed",
    },
    {
      id: 3,
      title: "Colosseum Underground Experience",
      date: "2024-01-18",
      time: "11:00 AM",
      clients: 8,
      location: "Colosseum, Rome",
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
      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      {/* Mobile menu toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-md shadow-md text-gray-700 hover:text-teal-600"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>{" "}
      {/* Sidebar - Desktop always visible, mobile only when mobileMenuOpen is true */}
      <div
        className={`${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } w-64 bg-white h-screen shadow-lg fixed left-0 top-0 z-20 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className="h-20 bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center px-6 flex-shrink-0">
          <h1 className="text-xl font-bold text-white">WanderWise</h1>
        </div>

        {/* Profile Summary */}
        <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500 bg-white">
              {user?.profile.avatar ? (
                <img
                  src={user?.profile.avatar}
                  alt={`${user?.profile.firstName} ${user?.profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-teal-100 flex items-center justify-center text-xl text-teal-700 font-bold">
                  {user?.profile.firstName?.charAt(0) || ""}
                  {user?.profile.lastName?.charAt(0) || ""}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-gray-900 truncate">
                {user?.profile.firstName} {user?.profile.lastName}
              </h2>
              <div className="flex items-center mt-1">
                <RoleBadge role={user?.role || "tour_guide"} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActivePage("dashboard")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "dashboard"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Layout className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("tours")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "tours"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span>My Tours</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("bookings")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "bookings"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("clients")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "clients"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Clients</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("reviews")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "reviews"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Star className="w-5 h-5" />
                <span>Reviews</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("messages")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "messages"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </button>
            </li>

            {/* Separator for Profile */}
            <div className="my-2 border-t border-gray-100"></div>

            <li>
              <button
                onClick={() => setActivePage("profile")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "profile"
                    ? "bg-teal-500 text-white"
                    : "text-teal-600 bg-teal-50 hover:bg-teal-100"
                }`}
              >
                <User className="w-5 h-5" />
                <span>My Profile</span>
              </button>
            </li>

            {/* Add some extra space at the bottom for better scrolling experience */}
            <div className="h-16"></div>
          </ul>
        </nav>

        {/* Logout at bottom */}
        <div className="w-full p-4 bg-gray-50 shadow-inner flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="lg:ml-64 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
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
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 sm:self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tour</span>
          </button>
        </div>

        {/* Profile Section - Only show on profile page */}
        {activePage === "profile" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="h-28 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
            <div className="px-6 py-6 md:px-8 md:py-8 -mt-20">
              <div className="flex flex-col md:flex-row">
                {/* Profile Image */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6 bg-white">
                  {user?.profile.avatar ? (
                    <img
                      src={user?.profile.avatar}
                      alt={`${user?.profile.firstName} ${user?.profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-teal-100 flex items-center justify-center text-5xl text-teal-700 font-bold">
                      {user?.profile.firstName?.charAt(0) || ""}
                      {user?.profile.lastName?.charAt(0) || ""}
                    </div>
                  )}
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
                            {user?.profile.location}
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
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <button className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Create New Tour</h3>
                <p className="text-sm text-gray-600">
                  Add a new tour to your offerings
                </p>
              </button>
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

            {/* Account Settings */}
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
                        Roman Forum, Rome
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
                            location: "Roman Forum, Rome",
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

        {/* Other page tabs */}
        {activePage === "bookings" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Bookings
            </h2>
            <p className="text-gray-600">
              View and manage your tour bookings here. This tab is currently
              under development.
            </p>
          </div>
        )}

        {activePage === "clients" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Clients
            </h2>
            <p className="text-gray-600">
              View and manage your clients here. This tab is currently under
              development.
            </p>
          </div>
        )}

        {activePage === "messages" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Messages
            </h2>
            <p className="text-gray-600">
              View and manage your messages here. This tab is currently under
              development.
            </p>
          </div>
        )}

        {activePage === "reviews" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...recentReviews, ...recentReviews].map((review, index) => (
                <div
                  key={`${review.id}-${index}`}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {review.clientName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "{review.comment}"
                  </p>
                  <p className="text-xs text-gray-500">Tour: {review.tour}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Tour Modal */}
        <CreateTourModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateTour}
        />

        {/* Edit Tour Modal */}
        {tourToEdit && (
          <EditTourModal
            isOpen={isEditModalOpen}
            tourData={tourToEdit}
            onClose={() => {
              setIsEditModalOpen(false);
              setTourToEdit(null);
            }}
            onSave={handleEditTour}
          />
        )}
      </div>
    </div>
  );
};

export default TourGuideDashboard;
