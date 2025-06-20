import React, { useState } from "react";
import { Tour } from "../../../services/tourService";
import {
  MapPinIcon,
  CalendarDaysIcon,
  StarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { EyeIcon } from "../../common/icons";
import TourDetailModal from "../modals/TourDetailModal";

interface GuideStats {
  totalTours: number;
  activeTours: number;
  inactiveTours: number;
  totalBookings: number;
  totalClients: number;
  averageRating: number;
  monthlyEarnings: number;
}

interface DashboardContentProps {
  tours: Tour[];
  isLoading: boolean;
  guideStats: GuideStats | null;
  onViewAllTours?: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  tours,
  isLoading,
  guideStats,
  onViewAllTours,
}) => {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewTourDetail = (tour: Tour) => {
    setSelectedTour(tour);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTour(null);
  };
  const statCards = [
    {
      title: "Total Tours",
      value: guideStats?.totalTours || 0,
      icon: ChartBarIcon,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      iconColor: "text-teal-500",
    },
    {
      title: "Active Tours",
      value: guideStats?.activeTours || 0,
      icon: CheckCircleIcon,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      iconColor: "text-teal-500",
    },
    {
      title: "Inactive Tours",
      value: guideStats?.inactiveTours || 0,
      icon: ClockIcon,
      color: "from-teal-400 to-teal-500",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      iconColor: "text-teal-400",
    },
    {
      title: "Total Bookings",
      value: guideStats?.totalBookings || 0,
      icon: CalendarDaysIcon,
      color: "from-teal-600 to-teal-700",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      iconColor: "text-teal-600",
    },
    {
      title: "Total Clients",
      value: guideStats?.totalClients || 0,
      icon: UsersIcon,
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      iconColor: "text-teal-500",
    },
    {
      title: "Average Rating",
      value: guideStats?.averageRating.toFixed(1) || "0.0",
      icon: StarIcon,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      iconColor: "text-yellow-500",
    },
    {
      title: "Monthly Earnings",
      value: `$${guideStats?.monthlyEarnings.toFixed(0) || 0}`,
      icon: CurrencyDollarIcon,
      color: "from-teal-600 to-emerald-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      {" "}
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white opacity-5"></div>

        <div className="relative p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Tour Guide Dashboard
              </h1>
              <p className="text-teal-100 text-lg">
                Monitor your performance and manage your tours
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {statCards.slice(0, 4).map((stat, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-white text-2xl font-bold mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className="h-8 w-8 text-teal-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 border border-gray-100">
                <div
                  className={`h-2 bg-gradient-to-r ${stat.color} rounded-t-2xl`}
                ></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                      <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                    {stat.title}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Recent Tours Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-50 rounded-lg">
              <FireIcon className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Tours</h2>
              <p className="text-gray-500 text-sm">
                Your latest tour offerings
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="ml-3 text-gray-600">Loading tours...</span>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-12">
              <MapPinIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tours yet
              </h3>
              <p className="text-gray-500">
                Start by creating your first tour to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tours.slice(0, 3).map((tour, index) => (
                <div
                  key={tour.id}
                  className="group bg-gray-50 hover:bg-teal-50 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-teal-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                        {tour.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{tour.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{tour.duration}</span>
                        </div>
                      </div>
                    </div>{" "}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleViewTourDetail(tour)}
                        className="p-1 rounded-lg hover:bg-teal-100 transition-colors"
                        title="View tour details"
                      >
                        <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}{" "}
              {tours.length > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={onViewAllTours}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors hover:underline"
                  >
                    View all tours ({tours.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Tour Detail Modal */}
      <TourDetailModal
        tour={selectedTour}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DashboardContent;
