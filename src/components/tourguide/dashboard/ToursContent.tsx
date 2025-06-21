import React, { useState } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Tour } from "../../../services/tourService";

interface ToursContentProps {
  tours: Tour[];
  onEditTour: (tour: Tour) => void;
  onDeleteTour?: (tourId: number) => Promise<void>;
  onCreateTour?: () => void;
  isLoading?: boolean;
}

const getStatusBadge = (status: string) => {
  if (status === "confirmed") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        confirmed
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        pending
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
      {status}
    </span>
  );
};

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
      setDeletingTourId(tourId);
      setTimeout(() => {
        setDeletingTourId(null);
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Tours</h2>
        <button
          onClick={onCreateTour}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Tour
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                TOUR NAME
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                LOCATION
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                DURATION
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PRICE
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                STATUS
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tours.map((tour) => (
              <tr key={tour.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {tour.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tour.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tour.duration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${tour.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(tour.is_active ? "confirmed" : "pending")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEditTour(tour)}
                    className="text-teal-600 hover:text-teal-900 p-1 rounded-full hover:bg-teal-50 transition-colors inline-flex items-center"
                    title="Edit tour"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {onDeleteTour && tour.id !== undefined && (
                    <button
                      onClick={() => handleDelete(tour.id as number)}
                      className={`ml-2 p-1 rounded-full transition-colors inline-flex items-center ${
                        deletingTourId === tour.id
                          ? "text-red-100 bg-red-600 hover:bg-red-700"
                          : "text-red-600 hover:text-red-900 hover:bg-red-50"
                      }`}
                      title={
                        deletingTourId === tour.id
                          ? "Click again to confirm"
                          : "Delete tour"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {tours.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <p className="mb-4">
                      No tours found. Create your first tour to get started!
                    </p>
                    <button
                      onClick={onCreateTour}
                      className="inline-flex items-center text-teal-600 hover:text-teal-700"
                    >
                      <Plus className="w-5 h-5 mr-1" />
                      Create Tour
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ToursContent;
