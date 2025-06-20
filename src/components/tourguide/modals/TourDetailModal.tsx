import React from "react";
import { Tour } from "../../../services/tourService";
import {
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface TourDetailModalProps {
  tour: Tour | null;
  isOpen: boolean;
  onClose: () => void;
}

const TourDetailModal: React.FC<TourDetailModalProps> = ({
  tour,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !tour) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-t-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{tour.title}</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <MapPinIcon className="h-5 w-5 text-teal-100" />
                  <span className="text-teal-100">{tour.location}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-teal-50 rounded-xl p-4 text-center">
                <ClockIcon className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Duration</div>
                <div className="font-semibold text-teal-700">
                  {tour.duration}
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 text-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Price</div>
                <div className="font-semibold text-green-700">
                  ${tour.price}
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <UsersIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Max Group Size</div>
                <div className="font-semibold text-blue-700">
                  {tour.max_group_size || "N/A"}
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div
                  className={`h-6 w-6 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    tour.is_active ? "bg-green-500" : "bg-yellow-500"
                  }`}
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="text-sm text-gray-600">Status</div>
                <div
                  className={`font-semibold ${
                    tour.is_active ? "text-green-700" : "text-yellow-700"
                  }`}
                >
                  {tour.is_active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed">
                  {tour.description ||
                    "No description available for this tour."}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {" "}
              {/* Tour Highlights */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Tour Description
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-700 leading-relaxed">
                    {tour.description || "No additional details available."}
                  </p>
                </div>
              </div>
              {/* Additional Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Additional Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tour ID:</span>
                    <span className="font-medium">#{tour.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {tour.created_at
                        ? new Date(tour.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">
                      {tour.updated_at
                        ? new Date(tour.updated_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-b-2xl p-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {/* <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Edit Tour
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailModal;
