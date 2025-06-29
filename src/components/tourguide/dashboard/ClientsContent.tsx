import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Users,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useClients } from "../../../hooks/useClients";
import type { ClientData } from "../../../services/clientsService";

interface ClientsContentProps {
  tourGuideUserId: string;
}

const ClientsContent: React.FC<ClientsContentProps> = ({ tourGuideUserId }) => {
  const {
    clients,
    stats,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    refreshClients,
    updateFilters,
    getClientDetails,
    sendMessage,
  } = useClients(tourGuideUserId);// Pass user ID to the hook

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const clientsPerPage = 10;

  // Update filters when search term or status filter changes
  useEffect(() => {
    updateFilters({
      searchTerm,
      status: statusFilter,
      page: 1,
      limit: clientsPerPage,
    });
  }, [searchTerm, statusFilter, updateFilters]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateFilters({
      searchTerm,
      status: statusFilter,
      page,
      limit: clientsPerPage,
    });
  };
  const handleViewDetails = async (client: ClientData) => {
    try {
      const detailedClient = await getClientDetails(client.id);
      setSelectedClient(detailedClient as ClientData);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch client details:", err);
      // For now, just show the basic client data
      setSelectedClient(client);
      setIsDetailModalOpen(true);
    }
  };

  const handleSendMessage = async (clientId: string) => {
    try {
      setSendingMessage(true);
      await sendMessage(
        clientId,
        "Hello! This is a test message from your tour guide."
      );
      // In a real app, you'd probably show a success notification here
      alert("Message sent successfully!");
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Show loading state
  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-2 text-gray-600">Loading clients...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-red-600" />
        <div className="ml-2">
          <p className="text-red-600 font-medium">Error loading clients</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={refreshClients}
            className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Header */}      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Clients</h1>
        <p className="text-gray-600">
          Manage your client relationships and booking history
        </p>
      </div>
      {/* Stats Cards */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-teal-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats?.totalClients || clients.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Active Clients
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {stats?.activeClients ||
                  clients.filter((c) => c.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Total Bookings
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {stats?.totalBookings ||
                  clients.reduce(
                    (sum, client) => sum + client.totalBookings,
                    0
                  )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats?.averageRating ||
                  (clients.length > 0
                    ? (
                      clients.reduce(
                        (sum, client) => sum + client.averageRating,
                        0
                      ) / clients.length
                    ).toFixed(1)
                    : "0.0")}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Booking
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.length > 0 ? (
                clients.map((client: ClientData) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-teal-800">
                            {client.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Client since{" "}
                            {new Date(client.joinDate).getFullYear()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="text-sm text-gray-500">
                          {client.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.totalBookings} bookings
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(client.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.averageRating > 0 ? (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-900">
                            {client.averageRating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          No ratings
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.lastBooking
                        ? new Date(client.lastBooking).toLocaleDateString(
                          "id-ID"
                        )
                        : "No bookings"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(client)}
                        className="text-teal-600 hover:text-teal-900 mr-3"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendMessage(client.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Send Message"
                        disabled={sendingMessage}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>{" "}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * clientsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * clientsPerPage,
                      total || clients.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{total || clients.length}</span>{" "}
                  clients
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number
                          ? "z-10 bg-teal-50 border-teal-500 text-teal-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        {number}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Client Detail Modal */}
      {isDetailModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Client Details
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-teal-800">
                    {selectedClient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedClient.name}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                      selectedClient.status
                    )}`}
                  >
                    {selectedClient.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {selectedClient.email}
                      </span>
                    </div>
                    {selectedClient.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {selectedClient.phone}
                        </span>
                      </div>
                    )}
                    {selectedClient.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {selectedClient.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    Booking Statistics
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total Bookings:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedClient.totalBookings}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total Spent:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(selectedClient.totalSpent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Average Rating:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedClient.averageRating > 0
                          ? selectedClient.averageRating.toFixed(1)
                          : "No ratings"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Last Booking:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedClient.lastBooking
                          ? new Date(
                            selectedClient.lastBooking
                          ).toLocaleDateString("id-ID")
                          : "No bookings"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Client Since:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedClient.joinDate).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientsContent;
