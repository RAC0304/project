import React, { useState, useEffect } from "react";
import { Booking } from "../../types/tourguide";
import { bookings } from "../../data/bookings";
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
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

const BookingsContent: React.FC<BookingsContentProps> = () => {
  // State for bookings data
  const [allBookings, setAllBookings] = useState<Booking[]>(bookings);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(bookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form state for editing booking
  const [formData, setFormData] = useState<Booking | null>(null);

  // Initialize and filter bookings when component mounts
  useEffect(() => {
    setAllBookings(bookings);
    setFilteredBookings(bookings);
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
  }; // Show status badge with appropriate color
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

  // Confirm delete booking
  const confirmDeleteBooking = () => {
    if (selectedBooking) {
      const updatedBookings = allBookings.filter(
        (booking) => booking.id !== selectedBooking.id
      );
      setAllBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      setIsDeleteModalOpen(false);
      setSelectedBooking(null);
    }
  };

  // Handle add new booking
  const handleAddBooking = () => {
    const newBooking: Booking = {
      id: `booking-${Math.floor(Math.random() * 10000)}`,
      tourId: "",
      tourName: "",
      tourGuideId: "",
      tourGuideName: "",
      userId: "",
      userName: "",
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
  };

  // Handle saving an edited booking
  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    const updatedBookings = isEditModalOpen
      ? allBookings.map((booking) =>
          booking.id === formData.id ? formData : booking
        )
      : [...allBookings, formData];

    setAllBookings(updatedBookings);
    setFilteredBookings(updatedBookings);

    if (isEditModalOpen) {
      setIsEditModalOpen(false);
    } else {
      setIsAddModalOpen(false);
    }

    setFormData(null);
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (!prev) return null;

      if (name === "participants" || name === "totalAmount") {
        return { ...prev, [name]: parseInt(value) };
      }

      return { ...prev, [name]: value };
    });
  };

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {/* Header and Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Bookings Management
            </h2>
            <div className="ml-4 text-sm text-gray-500">
              {filteredBookings.length} bookings
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500 w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            </div>{" "}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-4 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={resetFilters}
                className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleAddBooking}
              className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg ml-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Booking
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Booking ID
                </th>
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
                  Tour / Guide
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Participants
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Payment
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
              {currentItems.length > 0 ? (
                currentItems.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.userName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.tourName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Guide: {booking.tourGuideName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.date).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.participants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentBadge status={booking.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Booking"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Booking"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {indexOfLastItem > filteredBookings.length
                      ? filteredBookings.length
                      : indexOfLastItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredBookings.length}</span>{" "}
                  bookings
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === page
                            ? "z-10 bg-teal-50 border-teal-500 text-teal-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        } text-sm font-medium`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Booking Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Booking Details
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">Booking ID</div>
                  <div className="text-base font-medium">
                    {selectedBooking.id}
                  </div>
                </div>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Tour Information
                  </h3>
                  <div className="mb-4">
                    <div className="text-base font-medium">
                      {selectedBooking.tourName}
                    </div>
                    <div className="text-sm text-gray-700">
                      Guide: {selectedBooking.tourGuideName}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {new Date(selectedBooking.date).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{selectedBooking.participants} Participants</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Client Information
                  </h3>
                  <div className="mb-4">
                    <div className="text-base font-medium">
                      {selectedBooking.userName}
                    </div>
                    <div className="text-sm text-gray-700">
                      {selectedBooking.userEmail}
                    </div>
                    {selectedBooking.userPhone && (
                      <div className="text-sm text-gray-700">
                        {selectedBooking.userPhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Payment Information
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-700 mb-1">
                      Total Amount
                    </div>
                    <div className="text-lg font-medium">
                      {formatCurrency(selectedBooking.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 mb-1">
                      Payment Status
                    </div>
                    <PaymentBadge status={selectedBooking.paymentStatus} />
                  </div>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Special Requests
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Created: </span>
                  {new Date(selectedBooking.createdAt).toLocaleString("id-ID")}
                </div>
                <div>
                  <span className="font-medium">Last Updated: </span>
                  {new Date(selectedBooking.updatedAt).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg mr-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditBooking(selectedBooking);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
              >
                Edit Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Booking Modal */}
      {(isEditModalOpen || isAddModalOpen) && formData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditModalOpen ? "Edit Booking" : "Add New Booking"}
              </h2>
              <button
                onClick={() =>
                  isEditModalOpen
                    ? setIsEditModalOpen(false)
                    : setIsAddModalOpen(false)
                }
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking}>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tour Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Tour Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tour Name
                        </label>
                        <input
                          type="text"
                          name="tourName"
                          value={formData.tourName}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tour Guide Name
                        </label>
                        <input
                          type="text"
                          name="tourGuideName"
                          value={formData.tourGuideName}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                          required
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
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Participants
                        </label>
                        <input
                          type="number"
                          name="participants"
                          value={formData.participants}
                          onChange={handleInputChange}
                          min="1"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Client Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Name
                        </label>
                        <input
                          type="text"
                          name="userName"
                          value={formData.userName}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="userEmail"
                          value={formData.userEmail}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="userPhone"
                          value={formData.userPhone}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Requests
                        </label>
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests || ""}
                          onChange={handleInputChange}
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Amount (IDR)
                      </label>
                      <input
                        type="number"
                        name="totalAmount"
                        value={formData.totalAmount}
                        onChange={handleInputChange}
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                      </label>
                      <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Booking Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Status
                  </label>{" "}
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    isEditModalOpen
                      ? setIsEditModalOpen(false)
                      : setIsAddModalOpen(false)
                  }
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                >
                  {isEditModalOpen ? "Save Changes" : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Booking
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete the booking{" "}
                <span className="font-medium">{selectedBooking.id}</span> for{" "}
                {selectedBooking.userName}? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBooking}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Delete Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingsContent;
