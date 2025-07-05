import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Star,
} from "lucide-react";
import { supabase } from "../../../utils/supabaseClient";

interface TourDetailsModalProps {
  tour: {
    id: number;
    title: string;
    date: string;
    time: string;
    clients: number;
    location: string;
    status: "confirmed" | "pending" | "cancelled";
    tour_id?: number; // Add tour_id for fetching actual tour details
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TourDetails {
  id: number;
  title: string;
  description?: string;
  duration?: string;
  price?: number;
  max_group_size?: number;
  location: string;
  is_active?: boolean;
  created_at?: string;
  destinations?: {
    name: string;
  };
}

const TourDetailsModal: React.FC<TourDetailsModalProps> = ({
  tour,
  isOpen,
  onClose,
}) => {
  const [tourDetails, setTourDetails] = useState<TourDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTourDetails = async () => {
      if (!tour || !isOpen) return;

      // Use tour_id if available, otherwise fall back to id
      const tourIdToFetch = tour.tour_id || tour.id;

      console.log("TourDetailsModal - tour data:", tour);
      console.log("TourDetailsModal - tourIdToFetch:", tourIdToFetch);

      // First, set basic tour details from props
      setTourDetails({
        id: tourIdToFetch,
        title: tour.title,
        location: tour.location,
      });

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("tours")
          .select(
            `
                        *,
                        destinations:destination_id (
                            name
                        )
                    `
          )
          .eq("id", tourIdToFetch)
          .single();

        if (error) {
          console.error("Error fetching tour details:", error);
          setError(`Failed to load tour details: ${error.message}`);
          return;
        }

        if (data) {
          console.log("TourDetailsModal - fetched tour data:", data);
          setTourDetails({
            id: data.id,
            title: data.title || tour.title,
            description: data.description,
            duration: data.duration,
            price: data.price,
            max_group_size: data.max_group_size,
            location: data.destinations?.name || tour.location,
            is_active: data.is_active,
            created_at: data.created_at,
            destinations: data.destinations,
          });
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load tour details");
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [isOpen, tour]);

  if (!isOpen || !tour) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not set";
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status color for UI display
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Tour Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="text-red-700">
                <p className="font-medium">Error loading tour details</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="ml-2 text-gray-600">
                Loading tour details...
              </span>
            </div>
          ) : tourDetails ? (
            <>
              {/* Tour Header */}
              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tourDetails.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      tour.status
                    )}`}
                  >
                    {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{tourDetails.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    {formatDate(tour.date)} at {tour.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Tour ID: #{tour.id}
                </p>
              </div>

              {/* Tour Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="h-6 w-6 mx-auto mb-2 text-blue-600">
                    <Clock className="h-full w-full" />
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-semibold text-blue-700">
                    {tourDetails.duration || "Not specified"}
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="h-6 w-6 mx-auto mb-2 text-green-600">
                    <DollarSign className="h-full w-full" />
                  </div>
                  <div className="text-sm text-gray-600">Price</div>
                  <div className="font-medium">
                    {formatCurrency(tourDetails.price)}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="h-6 w-6 mx-auto mb-2 text-blue-600">
                    <Users className="h-full w-full" />
                  </div>
                  <div className="text-sm text-gray-600">Max Group</div>
                  <div className="font-semibold text-blue-700">
                    {tourDetails.max_group_size || "Not specified"}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div
                    className={`h-6 w-6 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      tourDetails.is_active ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div
                    className={`font-semibold ${
                      tourDetails.is_active ? "text-green-700" : "text-gray-700"
                    }`}
                  >
                    {tourDetails.is_active ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>

              {/* Description */}
              {tourDetails.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {tourDetails.description}
                  </p>
                </div>
              )}

              {/* Current Booking Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Current Booking Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Scheduled Date:</span>
                    <span className="ml-2 font-medium">
                      {formatDate(tour.date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <span className="ml-2 font-medium">
                      {tour.time || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Booked Clients:</span>
                    <span className="ml-2 font-medium">
                      {tour.clients} people
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Booking Status:</span>
                    <span className="ml-2 font-medium">
                      {tour.status.charAt(0).toUpperCase() +
                        tour.status.slice(1)}
                    </span>
                  </div>
                  {tourDetails.destinations && (
                    <div>
                      <span className="text-gray-500">Destination:</span>
                      <span className="ml-2 font-medium">
                        {tourDetails.destinations.name}
                      </span>
                    </div>
                  )}
                  {tourDetails.created_at && (
                    <div>
                      <span className="text-gray-500">Tour Created:</span>
                      <span className="ml-2 font-medium">
                        {new Date(tourDetails.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tour Stats */}
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Star className="w-4 h-4 text-teal-600 mr-1" />
                  Tour Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Current Booking:</span>
                    <span className="ml-2 font-medium">
                      {tour.clients} participants
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Booking Status:</span>
                    <span className="ml-2 font-medium">{tour.status}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No tour details available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourDetailsModal;
