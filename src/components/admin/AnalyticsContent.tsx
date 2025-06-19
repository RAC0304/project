import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Plus,
  Star,
} from "lucide-react";
import {
  AnalyticsReportType,
  AnalyticsReportPeriod,
  AnalyticsReport,
  TopDestinationItem,
  TopTourGuideItem,
  AnalyticsMetric,
} from "../../types";
import {
  getAnalyticsOverview,
  getAllReports,
  getTopDestinations,
  getTopTourGuides,
  createReport,
  updateReport,
  deleteReport,
  getTimeSeriesData,
} from "../../data/analytics";
import ReportTable from "./ReportTable";
import ReportFormModal from "./ReportFormModal";
import AnalyticsChart from "./AnalyticsChart";
import StatCard from "./StatCard";

interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalBookings: number;
  bookingsThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  averageRating: number;
  totalDestinations: number;
  totalTourGuides: number;
  activeTourGuides: number;
}

interface AnalyticsContentProps {
  user: any;
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({ user }) => {
  // State for overview data
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  // State for reports
  const [reports, setReports] = useState<AnalyticsReport[]>(getAllReports());
  const [filteredReports, setFilteredReports] =
    useState<AnalyticsReport[]>(reports);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<AnalyticsReportType | "all">(
    "all"
  );

  // State for top data
  const [topDestinations, setTopDestinations] = useState<TopDestinationItem[]>(
    getTopDestinations()
  );
  const [topTourGuides, setTopTourGuides] = useState<TopTourGuideItem[]>(
    getTopTourGuides()
  );

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReport, setCurrentReport] = useState<AnalyticsReport | null>(
    null
  );

  // Form data for creating/editing reports
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: AnalyticsReportType;
    period: AnalyticsReportPeriod;
  }>({
    title: "",
    description: "",
    type: "revenue",
    period: "monthly",
  });

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // State for time series data
  const [bookingsSeries, setBookingsSeries] = useState<
    { date: string; value: number }[]
  >([]);
  const [revenueSeries, setRevenueSeries] = useState<
    { date: string; value: number }[]
  >([]);
  const [usersSeries, setUsersSeries] = useState<
    { date: string; value: number }[]
  >([]);

  // Fetch overview and time series data from Supabase
  useEffect(() => {
    async function fetchData() {
      const overviewData = await getAnalyticsOverview();
      setOverview(overviewData);
      setBookingsSeries(await getTimeSeriesData("bookings"));
      setRevenueSeries(await getTimeSeriesData("revenue"));
      setUsersSeries(await getTimeSeriesData("users"));
    }
    fetchData();
  }, []);

  // Filter reports when search term or filter type changes
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((report) => report.type === filterType);
    }

    setFilteredReports(filtered);
  }, [searchTerm, filterType, reports]);

  // Reset form data
  const resetFormData = () => {
    setFormData({
      title: "",
      description: "",
      type: "revenue",
      period: "monthly",
    });
  };

  // Open modal for creating a new report
  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentReport(null);
    resetFormData();
    setIsModalOpen(true);
  };

  // Open modal for editing an existing report
  const openEditModal = (report: AnalyticsReport) => {
    setIsEditMode(true);
    setCurrentReport(report);
    setFormData({
      title: report.title,
      description: report.description,
      type: report.type,
      period: report.period,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create a new report
  const handleCreateReport = () => {
    const newReport = createReport({
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "available",
    });

    setReports([...reports, newReport]);
    closeModal();
    showNotification("Report created successfully", "success");
  };

  // Update an existing report
  const handleUpdateReport = () => {
    if (currentReport) {
      const updatedReport = updateReport(currentReport.id, formData);
      if (updatedReport) {
        setReports(
          reports.map((r) => (r.id === updatedReport.id ? updatedReport : r))
        );
        closeModal();
        showNotification("Report updated successfully", "success");
      } else {
        showNotification("Failed to update report", "error");
      }
    }
  };

  // Delete a report
  const handleDeleteReport = (id: string) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      const success = deleteReport(id);
      if (success) {
        setReports(reports.filter((report) => report.id !== id));
        showNotification("Report deleted successfully", "success");
      } else {
        showNotification("Failed to delete report", "error");
      }
    }
  };

  // Show notification
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({
      show: true,
      message,
      type,
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Function to get report type badge color
  const getReportTypeBadgeColor = (type: AnalyticsReportType) => {
    switch (type) {
      case "revenue":
        return "bg-green-100 text-green-800";
      case "users":
        return "bg-blue-100 text-blue-800";
      case "destinations":
        return "bg-purple-100 text-purple-800";
      case "guides":
        return "bg-orange-100 text-orange-800";
      case "bookings":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get report period badge text
  const getReportPeriodText = (period: AnalyticsReportPeriod) => {
    switch (period) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      case "yearly":
        return "Yearly";
      default:
        return "Custom";
    }
  };

  return (
    <>
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
            notification.type === "success"
              ? "bg-green-100 border border-green-200 text-green-800"
              : "bg-red-100 border border-red-200 text-red-800"
          }`}
        >
          {notification.message}
        </div>
      )}{" "}
      {/* Overview Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* User Stats */}
          {overview && (
            <>
              <StatCard
                title="Total Users"
                value={overview.totalUsers.toLocaleString()}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                trend={`+${overview.newUsersThisMonth} this month`}
                trendType="increase"
                subtext={`${overview.activeUsers} active users`}
                bgColor="bg-blue-50"
              />

              {/* Revenue Stats */}
              <StatCard
                title="Monthly Revenue"
                value={`$${overview.revenueThisMonth.toLocaleString()}`}
                icon={<DollarSign className="w-6 h-6 text-green-600" />}
                trend="+18% from last month"
                trendType="increase"
                subtext={`Total: $${overview.totalRevenue.toLocaleString()}`}
                bgColor="bg-green-50"
              />

              {/* Booking Stats */}
              <StatCard
                title="Monthly Bookings"
                value={overview.bookingsThisMonth.toString()}
                icon={<Calendar className="w-6 h-6 text-teal-600" />}
                trend="+24% from last month"
                trendType="increase"
                subtext={`Total: ${overview.totalBookings.toLocaleString()} bookings`}
                bgColor="bg-teal-50"
              />

              {/* Rating Stats */}
              <StatCard
                title="Average Rating"
                value={overview.averageRating.toFixed(1)}
                icon={
                  <Star
                    className="w-6 h-6 text-amber-500"
                    fill="currentColor"
                  />
                }
                trend="Top rated service"
                trendType="achievement"
                subtext={`${overview.totalDestinations} destinations`}
                bgColor="bg-amber-50"
              />
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {overview.averageRating}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      +0.2 from last month
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Top Destinations & Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Destinations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Destinations
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topDestinations.map((destination, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {destination.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {destination.bookings}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      ${destination.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 flex items-center">
                      {destination.rating}
                      <Star
                        className="w-4 h-4 text-yellow-500 ml-1 inline"
                        fill="currentColor"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Tour Guides */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Tour Guides
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guide
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topTourGuides.map((guide, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {guide.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {guide.bookings}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      ${guide.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 flex items-center">
                      {guide.rating}
                      <Star
                        className="w-4 h-4 text-yellow-500 ml-1 inline"
                        fill="currentColor"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>{" "}
      {/* Reports Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Analytics Reports
          </h3>
          <button
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            onClick={openCreateModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 sm:text-sm"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center">
            <Filter className="w-4 h-4 text-gray-500 mr-2" />
            <select
              className="form-select border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as AnalyticsReportType | "all")
              }
            >
              <option value="all">All Types</option>
              <option value="revenue">Revenue</option>
              <option value="users">Users</option>
              <option value="destinations">Destinations</option>
              <option value="guides">Tour Guides</option>
              <option value="bookings">Bookings</option>
            </select>
          </div>
        </div>

        {/* Reports Table - Using our ReportTable component */}
        <ReportTable
          reports={filteredReports}
          onEdit={openEditModal}
          onDelete={handleDeleteReport}
        />
      </div>{" "}
      {/* Trends Graph Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Trends</h3>
        <div className="text-sm text-gray-500 mb-6">
          Six-month trend analysis of key metrics. View detailed breakdowns in
          the reports section.
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <AnalyticsChart
              data={bookingsSeries}
              title="Monthly Bookings"
              type="bar"
              color="#0ea5e9"
              formatValue={(val) => val.toString()}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <AnalyticsChart
              data={revenueSeries}
              title="Monthly Revenue"
              type="area"
              color="#10b981"
              formatValue={(val) => `$${val.toLocaleString()}`}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <AnalyticsChart
              data={usersSeries}
              title="User Growth"
              type="line"
              color="#8b5cf6"
              formatValue={(val) => val.toLocaleString()}
            />
          </div>
        </div>
      </div>{" "}
      {/* Modal for creating/editing reports - Using our ReportFormModal component */}
      <ReportFormModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formData={formData}
        onClose={closeModal}
        onSubmit={isEditMode ? handleUpdateReport : handleCreateReport}
        onChange={handleInputChange}
      />
    </>
  );
};

export default AnalyticsContent;
