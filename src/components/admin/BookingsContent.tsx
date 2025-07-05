import React, { useState, useEffect } from "react";
import { Booking } from "../../types/tourguide";
import { supabase } from "../../utils/supabaseClient";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Calendar,
  Users,
} from "lucide-react";
import "./admin.css";

interface BookingsContentProps {
  user?: Record<string, unknown>;
}

interface SupabaseBooking {
  id: number;
  tour_id: number;
  user_id: number;
  date: string;
  participants: number;
  status: string;
  special_requests: string | null;
  total_amount: number;
  payment_status: string;
  created_at: string;
  updated_at: string;
  tours: {
    id: number;
    title: string;
    tour_guide_id: number;
  };
  users: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  tour_guides: {
    id: number;
    user_id: number;
    users: {
      first_name: string;
      last_name: string;
    };
  };
}

const BookingsContent: React.FC<BookingsContentProps> = () => {
  // State for bookings data
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for editing booking
  const [formData, setFormData] = useState<Booking | null>(null);

  // Function to fetch bookings from Supabase
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("bookings").select(`
          id, 
          tour_id,
          user_id,
          date,
          participants,
          status,
          special_requests,
          total_amount,
          payment_status,
          created_at,
          updated_at,
          tours(id, title, tour_guide_id, tour_guides(id, user_id, users(first_name, last_name))),
          users(id, first_name, last_name, email, phone)
        `);

      if (error) {
        throw error;
      }

      if (data) {
        // Map the Supabase data structure to our Booking type
        const mappedBookings: Booking[] = data.map((item: any) => ({
          id: item.id.toString(),
          tourId: item.tour_id.toString(),
          tourName: item.tours?.title || "Unknown Tour",
          tourGuideId: item.tours?.tour_guide_id?.toString() || "",
          tourGuideName: item.tours?.tour_guides?.users
            ? `${item.tours.tour_guides.users.first_name} ${item.tours.tour_guides.users.last_name}`
            : "Unknown Guide",
          userId: item.user_id.toString(),
          userName: item.users
            ? `${item.users.first_name} ${item.users.last_name}`
            : "Unknown User",
          userEmail: item.users?.email || "",
          userPhone: item.users?.phone || "",
          date: item.date,
          participants: item.participants,
          status: item.status as Booking["status"],
          specialRequests: item.special_requests || "",
          totalAmount: item.total_amount,
          paymentStatus: item.payment_status as Booking["paymentStatus"],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

        setAllBookings(mappedBookings);
        setFilteredBookings(mappedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize and fetch bookings when component mounts
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings based on search term and status filter
  useEffect(() => {
    let filtered = allBookings;

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.id.toLowerCase().includes(lowerCaseSearch) ||
          booking.userName.toLowerCase().includes(lowerCaseSearch) ||
          booking.tourName.toLowerCase().includes(lowerCaseSearch) ||
          booking.tourGuideName.toLowerCase().includes(lowerCaseSearch)
      );
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, allBookings]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Show status badge with appropriate color
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let classes = "px-3 py-1 text-xs font-medium rounded-full ";

    switch (status) {
      case "confirmed":
        classes += "bg-green-100 text-green-800";
        break;
      case "pending":
        classes += "bg-yellow-100 text-yellow-800";
        break;
      case "cancelled":
        classes += "bg-red-100 text-red-800";
        break;
      case "completed":
        classes += "bg-blue-100 text-blue-800";
        break;
      default:
        classes += "bg-gray-100 text-gray-800";
    }

    return (
      <span className={classes}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Payment status badge
  const PaymentBadge: React.FC<{ status: string }> = ({ status }) => {
    let classes = "px-3 py-1 text-xs font-medium rounded-full ";

    switch (status) {
      case "paid":
        classes += "bg-blue-100 text-blue-800";
        break;
      case "pending":
        classes += "bg-yellow-100 text-yellow-800";
        break;
      case "refunded":
        classes += "bg-purple-100 text-purple-800";
        break;
      default:
        classes += "bg-gray-100 text-gray-800";
    }

    return (
      <span className={classes}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Handle view booking
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  // Handle edit booking
  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setFormData({ ...booking });
    setIsEditModalOpen(true);
  };

  // Handle delete booking
  const handleDeleteBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete booking using Supabase
  const confirmDeleteBooking = async () => {
    if (selectedBooking) {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from("bookings")
          .delete()
          .eq("id", selectedBooking.id);

        if (error) throw error;

        // Update local state
        const updatedBookings = allBookings.filter(
          (booking) => booking.id !== selectedBooking.id
        );
        setAllBookings(updatedBookings);
        setFilteredBookings(updatedBookings);
        alert("Booking deleted successfully");
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("Failed to delete booking");
      } finally {
        setIsLoading(false);
        setIsDeleteModalOpen(false);
        setSelectedBooking(null);
      }
    }
  };

  // Handle form change
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (formData) {
      if (name === "participants" || name === "totalAmount") {
        setFormData({
          ...formData,
          [name]: parseFloat(value) || 0,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  // Handle form submit for editing or adding a booking
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setIsLoading(true);

      // Map our Booking type back to Supabase structure
      const bookingData = {
        tour_id: parseInt(formData.tourId),
        user_id: parseInt(formData.userId),
        date: formData.date,
        participants: formData.participants,
        status: formData.status,
        special_requests: formData.specialRequests,
        total_amount: formData.totalAmount,
        payment_status: formData.paymentStatus,
        updated_at: new Date().toISOString(),
      };

      if (selectedBooking) {
        // Editing existing booking
        const { error } = await supabase
          .from("bookings")
          .update(bookingData)
          .eq("id", selectedBooking.id);

        if (error) throw error;

        // Update local state
        const updatedBookings = allBookings.map((booking) =>
          booking.id === selectedBooking.id ? { ...formData } : booking
        );

        setAllBookings(updatedBookings);
        setFilteredBookings(updatedBookings);
        alert("Booking updated successfully");
      } else {
        // Adding new booking
        const { error } = await supabase
          .from("bookings")
          .insert({
            ...bookingData,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) throw error;

        // Refresh bookings to get the correct data with relationships
        fetchBookings();
        alert("Booking added successfully");
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Failed to save booking");
    } finally {
      setIsLoading(false);
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
      setSelectedBooking(null);
      setFormData(null);
    }
  };

  // Handle add new booking
  const handleAddBooking = async () => {
    try {
      // First get available tours and users for selection
      const [toursResult, usersResult] = await Promise.all([
        supabase.from("tours").select("id, title"),
        supabase.from("users").select("id, first_name, last_name"),
      ]);

      if (toursResult.error) throw toursResult.error;
      if (usersResult.error) throw usersResult.error;

      // Create a default booking with the first tour and user
      const defaultTour = toursResult.data?.[0];
      const defaultUser = usersResult.data?.[0];

      if (!defaultTour || !defaultUser) {
        alert("Cannot add booking: No tours or users available");
        return;
      }

      const newBooking: Booking = {
        id: "new", // will be replaced by Supabase
        tourId: defaultTour.id.toString(),
        tourName: defaultTour.title,
        tourGuideId: "",
        tourGuideName: "",
        userId: defaultUser.id.toString(),
        userName: `${defaultUser.first_name} ${defaultUser.last_name}`,
        userEmail: "",
        userPhone: "",
        date: new Date().toISOString().split("T")[0],
        participants: 1,
        status: "pending",
        specialRequests: "",
        totalAmount: 0,
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setFormData(newBooking);
      setIsAddModalOpen(true);
    } catch (error) {
      console.error("Error preparing new booking form:", error);
      alert("Failed to prepare new booking form");
    }
  };

  // Render the BookingsContent component
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Bookings Management
        </h1>
        <button
          onClick={handleAddBooking}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Booking
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-4 bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={resetFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {isLoading ? (
          // Loading state
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-600">
              No bookings found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        ) : (
          // Bookings table
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.tourName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.tourGuideName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.participants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentBadge status={booking.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Search className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-amber-600 hover:text-amber-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredBookings.length)} of{" "}
              {filteredBookings.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNumber
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Booking Details
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tour Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Tour Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="block text-sm text-gray-500">
                        Tour Name
                      </span>
                      <span className="block text-base font-medium">
                        {selectedBooking.tourName}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">
                        Tour Guide
                      </span>
                      <span className="block text-base font-medium">
                        {selectedBooking.tourGuideName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-base font-medium">
                        {new Date(selectedBooking.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-base font-medium">
                        {selectedBooking.participants} participants
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Payment Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="block text-sm text-gray-500">
                        Total Amount
                      </span>
                      <span className="block text-xl font-semibold">
                        {formatCurrency(selectedBooking.totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">
                        Payment Status
                      </span>
                      <PaymentBadge status={selectedBooking.paymentStatus} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="block text-sm text-gray-500">Name</span>
                      <span className="block text-base font-medium">
                        {selectedBooking.userName}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">Email</span>
                      <span className="block text-base">
                        {selectedBooking.userEmail}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">Phone</span>
                      <span className="block text-base">
                        {selectedBooking.userPhone}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Booking Status
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <span className="block text-sm text-gray-500">
                        Current Status
                      </span>
                      <StatusBadge status={selectedBooking.status} />
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500 mb-1">
                        Special Requests
                      </span>
                      <p className="text-base bg-white p-3 rounded border border-gray-200">
                        {selectedBooking.specialRequests ||
                          "No special requests"}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-gray-500">
                        Booking ID: {selectedBooking.id}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(selectedBooking.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Last Updated:{" "}
                        {new Date(selectedBooking.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditBooking(selectedBooking);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Deletion
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the booking{" "}
              <span className="font-semibold">{selectedBooking.id}</span> for{" "}
              <span className="font-semibold">{selectedBooking.userName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {(isEditModalOpen || isAddModalOpen) && formData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {isAddModalOpen ? "Add New Booking" : "Edit Booking"}
              </h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsAddModalOpen(false);
                  setSelectedBooking(null);
                  setFormData(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tour Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Name
                    </label>
                    <input
                      type="text"
                      name="tourName"
                      value={formData.tourName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isAddModalOpen} // Can't edit tour name directly, would need to change tourId
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Participants
                    </label>
                    <input
                      type="number"
                      name="participants"
                      value={formData.participants}
                      onChange={handleFormChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* User and Status Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Name
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isAddModalOpen} // Can't edit user name directly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsAddModalOpen(false);
                    setSelectedBooking(null);
                    setFormData(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsContent;
