import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  MapPin,
  Calendar,
  BarChart3,
  Star,
  Globe,
  AlertCircle,
} from "lucide-react";
import StatCard from "./StatCard";
import { supabase } from "../../utils/supabaseClient";

interface DashboardContentProps {
  setActivePage: (page: string) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  setActivePage,
}) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeTourGuides: 0,
    totalDestinations: 0,
    monthlyBookings: 0,
    revenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Total Users
        const { count: totalUsers } = await supabase
          .from("users")
          .select("id", { count: "exact", head: true });
        // Active Tour Guides
        const { count: activeTourGuides } = await supabase
          .from("tour_guides")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", true);
        // Total Destinations
        const { count: totalDestinations } = await supabase
          .from("destinations")
          .select("id", { count: "exact", head: true });
        // Monthly Bookings (current month)
        const now = new Date();
        const firstDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ).toISOString();
        const lastDay = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        ).toISOString();
        const { count: monthlyBookings } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .gte("created_at", firstDay)
          .lte("created_at", lastDay);
        // Revenue (sum total_amount for current month)
        const { data: revenueData } = await supabase
          .from("bookings")
          .select("total_amount")
          .gte("created_at", firstDay)
          .lte("created_at", lastDay);
        let revenue = 0;
        if (revenueData) {
          revenue = revenueData.reduce(
            (sum, b) => sum + (b.total_amount || 0),
            0
          );
        }
        // Average Rating
        const { data: ratingData } = await supabase
          .from("reviews")
          .select("rating");
        let averageRating = 0;
        if (ratingData && ratingData.length > 0) {
          averageRating =
            ratingData.reduce((sum, r) => sum + (r.rating || 0), 0) /
            ratingData.length;
        }
        setDashboardStats({
          totalUsers: totalUsers || 0,
          activeTourGuides: activeTourGuides || 0,
          totalDestinations: totalDestinations || 0,
          monthlyBookings: monthlyBookings || 0,
          revenue,
          averageRating: Number(averageRating.toFixed(2)),
        });
      } catch {
        setError("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const recentActivities = [
    {
      id: 1,
      type: "user_registration",
      message: "New user registered: john.doe@email.com",
      timestamp: "2 hours ago",
      icon: <UserCheck className="w-4 h-4 text-green-500" />,
    },
    {
      id: 2,
      type: "guide_approval",
      message: "Tour guide Maria Garcia approved",
      timestamp: "4 hours ago",
      icon: <Users className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 3,
      type: "destination_added",
      message: "New destination added: Kyoto, Japan",
      timestamp: "6 hours ago",
      icon: <MapPin className="w-4 h-4 text-teal-500" />,
    },
    {
      id: 4,
      type: "system_alert",
      message: "Server maintenance scheduled for tonight",
      timestamp: "8 hours ago",
      icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
    },
  ];

  return (
    <>
      {loading ? (
        <div className="text-center py-10">Loading dashboard...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={dashboardStats.totalUsers.toLocaleString()}
              icon={<Users className="w-6 h-6 text-teal-600" />}
              trend=""
            />
            <StatCard
              title="Active Tour Guides"
              value={dashboardStats.activeTourGuides}
              icon={<UserCheck className="w-6 h-6 text-teal-600" />}
              trend=""
            />
            <StatCard
              title="Destinations"
              value={dashboardStats.totalDestinations}
              icon={<MapPin className="w-6 h-6 text-teal-600" />}
              trend=""
            />
            <StatCard
              title="Monthly Bookings"
              value={dashboardStats.monthlyBookings}
              icon={<Calendar className="w-6 h-6 text-teal-600" />}
              trend=""
            />
            <StatCard
              title="Revenue"
              value={`$${dashboardStats.revenue.toLocaleString()}`}
              icon={<BarChart3 className="w-6 h-6 text-teal-600" />}
              trend=""
            />
            <StatCard
              title="Average Rating"
              value={dashboardStats.averageRating}
              icon={<Star className="w-6 h-6 text-teal-600" />}
              trend=""
              trendColor="text-green-500"
            />
          </div>
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activities
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {activity.icon}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                View All Activities
              </button>
            </div>
          </div>{" "}
          {/* Quick Actions */}
          <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => setActivePage("users")}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <Users className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600">
                View and manage user accounts
              </p>
            </button>
            <button
              onClick={() => setActivePage("destinations")}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <Globe className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Destinations</h3>
              <p className="text-sm text-gray-600">Add and edit destinations</p>
            </button>
            <button
              onClick={() => setActivePage("analytics")}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">View detailed reports</p>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardContent;
