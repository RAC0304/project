import React from "react";
import { useAuth } from "../contexts/AuthContext";
import RoleBadge from "../components/common/RoleBadge";
import {
  Users,
  Settings,
  BarChart3,
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Globe,
  Star,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Sample admin data - in a real app, this would come from an API
  const dashboardStats = {
    totalUsers: 1247,
    activeTourGuides: 89,
    totalDestinations: 156,
    monthlyBookings: 324,
    revenue: 45680,
    averageRating: 4.7,
  };

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
      icon: <MapPin className="w-4 h-4 text-purple-500" />,
    },
    {
      id: 4,
      type: "system_alert",
      message: "Server maintenance scheduled for tonight",
      timestamp: "8 hours ago",
      icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendColor?: string;
  }> = ({ title, value, icon, trend, trendColor = "text-green-500" }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trendColor} mt-1`}>
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-teal-50 rounded-lg">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.profile.firstName} {user?.profile.lastName}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <RoleBadge role={user?.role || "user"} />
            <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={dashboardStats.totalUsers.toLocaleString()}
            icon={<Users className="w-6 h-6 text-teal-600" />}
            trend="+12% this month"
          />
          <StatCard
            title="Active Tour Guides"
            value={dashboardStats.activeTourGuides}
            icon={<UserCheck className="w-6 h-6 text-teal-600" />}
            trend="+5% this month"
          />
          <StatCard
            title="Destinations"
            value={dashboardStats.totalDestinations}
            icon={<MapPin className="w-6 h-6 text-teal-600" />}
            trend="+8 new this month"
          />
          <StatCard
            title="Monthly Bookings"
            value={dashboardStats.monthlyBookings}
            icon={<Calendar className="w-6 h-6 text-teal-600" />}
            trend="+18% this month"
          />
          <StatCard
            title="Revenue"
            value={`$${dashboardStats.revenue.toLocaleString()}`}
            icon={<BarChart3 className="w-6 h-6 text-teal-600" />}
            trend="+25% this month"
          />
          <StatCard
            title="Average Rating"
            value={dashboardStats.averageRating}
            icon={<Star className="w-6 h-6 text-teal-600" />}
            trend="Excellent"
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
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
              View All Activities
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
            <Users className="w-8 h-8 text-teal-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600">
              View and manage user accounts
            </p>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
            <Globe className="w-8 h-8 text-teal-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Destinations</h3>
            <p className="text-sm text-gray-600">Add and edit destinations</p>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
            <BarChart3 className="w-8 h-8 text-teal-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600">View detailed reports</p>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
            <Settings className="w-8 h-8 text-teal-600 mb-2" />
            <h3 className="font-semibold text-gray-900">System Settings</h3>
            <p className="text-sm text-gray-600">Configure platform settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
