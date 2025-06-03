import {
  AnalyticsData,
  AnalyticsItem,
  AnalyticsReport,
  AnalyticsMetric,
  AnalyticsReportType,
} from "../types";

// Sample analytics data - in a real app, this would come from a backend API
export const analyticsData: AnalyticsData = {
  overview: {
    totalUsers: 10,
    activeUsers: 8,
    newUsersThisMonth: 2,
    totalBookings: 35,
    bookingsThisMonth: 5,
    totalRevenue: 2485,
    revenueThisMonth: 468,
    averageRating: 4.7,
    totalDestinations: 156,
    totalTourGuides: 89,
    activeTourGuides: 84,
  },
  timeSeries: {
    bookings: [
      { date: "2025-01-01", value: 1 },
      { date: "2025-02-01", value: 2 },
      { date: "2025-03-01", value: 3 },
      { date: "2025-04-01", value: 4 },
      { date: "2025-05-01", value: 5 },
      { date: "2025-06-01", value: 6 },
      { date: "2025-07-01", value: 7 },
      { date: "2025-08-01", value: 8 },
      { date: "2025-09-01", value: 9 },
      { date: "2025-10-01", value: 10 }, // terakhir harus 10 user
    ],
    revenue: [
      { date: "2025-01-01", value: 1000 },
      { date: "2025-02-01", value: 2000 },
      { date: "2025-03-01", value: 3000 },
      { date: "2025-04-01", value: 4000 },
      { date: "2025-05-01", value: 5000 },
      { date: "2025-06-01", value: 6000 },
      { date: "2025-07-01", value: 7000 },
      { date: "2025-08-01", value: 8000 },
      { date: "2025-09-01", value: 9000 },
      { date: "2025-10-01", value: 10000 },
    ],
    users: [
      { date: "2025-01-01", value: 1 },
      { date: "2025-02-01", value: 2 },
      { date: "2025-03-01", value: 3 },
      { date: "2025-04-01", value: 4 },
      { date: "2025-05-01", value: 5 },
      { date: "2025-06-01", value: 6 },
      { date: "2025-07-01", value: 7 },
      { date: "2025-08-01", value: 8 },
      { date: "2025-09-01", value: 9 },
      { date: "2025-10-01", value: 10 }, // terakhir harus 10 user
    ],
  },
  topDestinations: [
    { name: "Bali", bookings: 758, revenue: 56850, rating: 4.8 },
    { name: "Yogyakarta", bookings: 542, revenue: 41250, rating: 4.7 },
    { name: "Raja Ampat", bookings: 389, revenue: 85400, rating: 4.9 },
    { name: "Komodo", bookings: 356, revenue: 32780, rating: 4.6 },
    { name: "Borobudur", bookings: 310, revenue: 24600, rating: 4.8 },
    { name: "Lombok", bookings: 287, revenue: 22960, rating: 4.5 },
    { name: "Lake Toba", bookings: 213, revenue: 18950, rating: 4.3 },
  ],
  topTourGuides: [
    { name: "Adi Putra", bookings: 124, revenue: 18600, rating: 4.9 },
    { name: "Siti Nuraini", bookings: 112, revenue: 16800, rating: 5.0 },
    { name: "Rizal Hakim", bookings: 98, revenue: 15680, rating: 4.9 },
    { name: "Maya Dewi", bookings: 87, revenue: 13050, rating: 4.8 },
    { name: "Wayan Dharma", bookings: 83, revenue: 14940, rating: 4.8 },
  ],
  reports: [
    {
      id: "report-001",
      title: "Monthly Revenue Report",
      description: "Breakdown of revenue sources by month",
      type: "revenue",
      period: "monthly",
      createdAt: "2025-06-01",
      lastUpdated: "2025-06-15",
      status: "available",
    },
    {
      id: "report-002",
      title: "User Acquisition Analysis",
      description: "Analysis of user growth and acquisition channels",
      type: "users",
      period: "quarterly",
      createdAt: "2025-05-15",
      lastUpdated: "2025-06-10",
      status: "available",
    },
    {
      id: "report-003",
      title: "Destination Popularity Index",
      description: "Ranking of destinations by booking volume and ratings",
      type: "destinations",
      period: "monthly",
      createdAt: "2025-06-01",
      lastUpdated: "2025-06-15",
      status: "available",
    },
    {
      id: "report-004",
      title: "Tour Guide Performance",
      description:
        "Evaluation of tour guides by bookings, revenue, and ratings",
      type: "guides",
      period: "quarterly",
      createdAt: "2025-05-01",
      lastUpdated: "2025-06-01",
      status: "available",
    },
    {
      id: "report-005",
      title: "Seasonal Booking Trends",
      description: "Analysis of booking patterns by season and destination",
      type: "bookings",
      period: "yearly",
      createdAt: "2025-01-15",
      lastUpdated: "2025-06-15",
      status: "available",
    },
  ],
};

// Helper functions for analytics data access and manipulation
export const getAnalyticsOverview = (): typeof analyticsData.overview => {
  return analyticsData.overview;
};

export const getTimeSeriesData = (metric: AnalyticsMetric): AnalyticsItem[] => {
  return analyticsData.timeSeries[metric] || [];
};

export const getTopDestinations = (
  limit: number = 5
): typeof analyticsData.topDestinations => {
  return analyticsData.topDestinations.slice(0, limit);
};

export const getTopTourGuides = (
  limit: number = 5
): typeof analyticsData.topTourGuides => {
  return analyticsData.topTourGuides.slice(0, limit);
};

export const getAllReports = (): AnalyticsReport[] => {
  return analyticsData.reports;
};

export const getReportById = (id: string): AnalyticsReport | undefined => {
  return analyticsData.reports.find((report) => report.id === id);
};

export const getReportsByType = (
  type: AnalyticsReportType
): AnalyticsReport[] => {
  return analyticsData.reports.filter((report) => report.type === type);
};

export const createReport = (
  report: Omit<AnalyticsReport, "id">
): AnalyticsReport => {
  const newReport: AnalyticsReport = {
    ...report,
    id: `report-${String(analyticsData.reports.length + 1).padStart(3, "0")}`,
  };
  analyticsData.reports.push(newReport);
  return newReport;
};

export const updateReport = (
  id: string,
  updates: Partial<AnalyticsReport>
): AnalyticsReport | null => {
  const index = analyticsData.reports.findIndex((report) => report.id === id);
  if (index === -1) return null;

  analyticsData.reports[index] = {
    ...analyticsData.reports[index],
    ...updates,
    lastUpdated: new Date().toISOString().split("T")[0],
  };

  return analyticsData.reports[index];
};

export const deleteReport = (id: string): boolean => {
  const initialLength = analyticsData.reports.length;
  analyticsData.reports = analyticsData.reports.filter(
    (report) => report.id !== id
  );
  return analyticsData.reports.length < initialLength;
};
