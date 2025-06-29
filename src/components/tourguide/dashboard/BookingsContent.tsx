import React, { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import {
  getBookingsWithDetailsByGuideUserId,
  BookingWithDetails,
} from "../../../services/bookingDetailsService";
import {
  updateBookingStatusSupabase,
} from "../../../services/bookingService";
import BookingDetailsModal from "../modals/BookingDetailsModal";
import MessageModal from "../modals/MessageModal";
import Toast from "../../common/Toast";

interface BookingsContentProps {
  tourGuideId: number;
}

const BookingsContent: React.FC<BookingsContentProps> = ({ tourGuideId }) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [toast, setToast] = useState({
    isVisible: false,
    type: "success" as "success" | "error" | "info",
    message: "",
  });

  const itemsPerPage = 10;

  const fetchBookings = async () => {
    if (!tourGuideId) return;
    setIsLoading(true);
    try {
      const data = await getBookingsWithDetailsByGuideUserId(tourGuideId);
      setBookings(data.bookings);
      setDebugLog(data.debugLog || []);
      console.log("[BookingsContent] Data bookings fetched:", data.bookings);
      if (data.bookings.length === 0) {
        setToast({
          isVisible: true,
          type: "info",
          message: "No bookings found for your tours. You'll see them here when customers make reservations.",
        });
      }
    } catch (error) {
      console.error("[BookingsContent] Error fetching bookings:", error);
      setToast({
        isVisible: true,
        type: "error",
        message: "Failed to load bookings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [tourGuideId]);

  // Toggle debug mode function
  const toggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    console.log(`Debug mode ${newMode ? 'activated' : 'deactivated'}`);
    if (newMode) {
      fetchBookings(); // Automatically fetch with debug if turning on
    }
  };

  // Filter bookings based on search term and filters
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchTerm === "" ||
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tourName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" || booking.status === statusFilter;

    // Time filter logic
    if (timeFilter === "") return matchesSearch && matchesStatus;

    const bookingDate = new Date(booking.date);
    const today = new Date();

    switch (timeFilter) {
      case "today":
        return (
          matchesSearch &&
          matchesStatus &&
          bookingDate.toDateString() === today.toDateString()
        );
      case "tomorrow": {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return (
          matchesSearch &&
          matchesStatus &&
          bookingDate.toDateString() === tomorrow.toDateString()
        );
      }
      case "week": {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return (
          matchesSearch &&
          matchesStatus &&
          bookingDate >= today &&
          bookingDate <= nextWeek
        );
      }
      case "month": {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return (
          matchesSearch &&
          matchesStatus &&
          bookingDate >= today &&
          bookingDate <= nextMonth
        );
      }
      default:
        return matchesSearch && matchesStatus;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  // Handler functions
  const handleViewDetails = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleSendMessage = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setShowMessageModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRemoveFilter = (filterType: "time" | "status") => {
    if (filterType === "time") {
      setTimeFilter("");
    } else {
      setStatusFilter("");
    }
  };

  // Handle status update
  const handleStatusUpdate = async (
    bookingId: string,
    newStatus: "confirmed" | "cancelled"
  ) => {
    try {
      await updateBookingStatusSupabase(Number(bookingId), newStatus);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === Number(bookingId) ? { ...b, status: newStatus } : b
        )
      );
      setToast({
        isVisible: true,
        type: "success",
        message:
          newStatus === "confirmed"
            ? "Booking has been accepted successfully!"
            : "Booking has been rejected",
      });
      setTimeout(() => setShowDetailsModal(false), 1500);
    } catch {
      setToast({
        isVisible: true,
        type: "error",
        message: "Failed to update booking status.",
      });
    }
  };

  // Handle message sent
  const handleMessageSent = (message: string) => {
    setToast({
      isVisible: true,
      type: "success",
      message: "Message sent successfully!",
    });
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Toast
        isVisible={toast.isVisible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      <div className="space-y-6">
        {/* Header and Search/Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bookings
              </h1>
              <p className="text-gray-600">
                Manage your tour bookings and client reservations
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="relative">
                {" "}
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-10 pr-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>{" "}
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>{" "}
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button
                onClick={fetchBookings}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>{" "}
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {timeFilter && (
              <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center">
                {timeFilter === "today"
                  ? "Today"
                  : timeFilter === "tomorrow"
                    ? "Tomorrow"
                    : timeFilter === "week"
                      ? "This Week"
                      : "This Month"}
                <button
                  onClick={() => handleRemoveFilter("time")}
                  className="ml-2 text-teal-500 hover:text-teal-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
            {statusFilter && (
              <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center">
                {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <button
                  onClick={() => handleRemoveFilter("status")}
                  className="ml-2 text-teal-500 hover:text-teal-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-end px-4 py-2 bg-gray-50">
            <button
              onClick={toggleDebugMode}
              className={`text-xs px-2 py-1 rounded ${debugMode
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {debugMode ? "Debug Mode: ON" : "Debug Mode"}
            </button>
          </div>
          {debugMode && debugLog.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded text-sm text-yellow-900 max-h-64 overflow-auto">
              <div className="font-bold mb-2">Debug Output:</div>
              <pre className="whitespace-pre-wrap">{debugLog.join("\n")}</pre>
            </div>
          )}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-10 min-h-[200px]">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-teal-600 animate-spin mb-3"></div>
                  <p className="text-gray-500">Loading bookings...</p>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Client
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tour
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date & Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Guests
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
                  {currentBookings.length > 0 ? (
                    currentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {booking.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.userEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.tourName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.participants}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-teal-600 hover:text-teal-900 mr-3"
                            onClick={() => handleViewDetails(booking)}
                          >
                            Details
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleSendMessage(booking)}
                          >
                            Message
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No bookings found. New bookings will appear here once customers make reservations for your tours.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {bookings.length > 0 && !isLoading && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredBookings.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredBookings.length}</span>{" "}
                bookings
              </div>
              <div className="flex-1 flex justify-end space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedBooking && (
        <>
          <BookingDetailsModal
            booking={selectedBooking}
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            onStatusUpdate={handleStatusUpdate}
          />          <MessageModal
            booking={selectedBooking}
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            onMessageSent={handleMessageSent}
          />
        </>
      )}
    </>
  );
};

export default BookingsContent;
