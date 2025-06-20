import React, { useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Clock,
  Users,
  Eye,
} from "lucide-react";
import { Tour } from "../../../services/tourService";

interface ToursContentProps {
  tours: Tour[];
  onEditTour: (tour: Tour) => void;
  onDeleteTour?: (tourId: number) => Promise<void>;
  onCreateTour?: () => void;
  isLoading?: boolean;
}

const ToursContent: React.FC<ToursContentProps> = ({
  tours,
  onEditTour,
  onDeleteTour,
  onCreateTour,
  isLoading = false,
}) => {
  const [deletingTourId, setDeletingTourId] = useState<number | null>(null);
  const handleDelete = async (tourId: number) => {
    if (deletingTourId === tourId) {
      try {
        await onDeleteTour?.(tourId);
      } catch (error) {
        console.error("Failed to delete tour:", error);
      } finally {
        setDeletingTourId(null);
      }
    } else {
      // First click - show confirmation state
      setDeletingTourId(tourId);
      // Auto-reset after 3 seconds if not confirmed
      setTimeout(() => {
        setDeletingTourId(null);
      }, 3000);
    }
  };
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading your tours...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {" "}
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>

        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Tours</h1>
              <p className="text-teal-100 text-lg">
                Create and manage your tour offerings for clients
              </p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2 text-teal-100">
                  <Eye className="h-5 w-5" />
                  <span className="text-sm">{tours.length} Total Tours</span>
                </div>
                <div className="flex items-center space-x-2 text-teal-100">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">
                    {tours.filter((t) => t.is_active).length} Active
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onCreateTour}
              className="inline-flex items-center px-6 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Tour
            </button>
          </div>
        </div>
      </div>
      {/* Tours Grid - Modern Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
          >
            {/* Status Indicator */}
            <div
              className={`h-1 ${
                tour.is_active
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-yellow-500 to-orange-500"
              }`}
            ></div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {" "}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                    {tour.title}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{tour.location}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    tour.is_active
                      ? "bg-teal-100 text-teal-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {tour.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Tour Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{tour.duration}</span>
                  </div>
                  <div className="text-xl font-bold text-teal-600">
                    ${tour.price}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => onEditTour(tour)}
                  className="flex items-center space-x-2 px-3 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-200"
                  title="Edit tour"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>

                {onDeleteTour && (
                  <button
                    onClick={() => handleDelete(tour.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      deletingTourId === tour.id
                        ? "text-white bg-red-600 hover:bg-red-700"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                    }`}
                    title={
                      deletingTourId === tour.id
                        ? "Click again to confirm"
                        : "Delete tour"
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {deletingTourId === tour.id ? "Confirm" : "Delete"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}{" "}
        {/* Empty State */}
        {tours.length === 0 && (
          <div className="col-span-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tours yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start creating amazing tour experiences for your clients
                </p>
                <button
                  onClick={onCreateTour}
                  className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Tour
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursContent;
