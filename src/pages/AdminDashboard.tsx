import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import RoleBadge from "../components/common/RoleBadge";
import { useNavigate } from "react-router-dom";
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
  Star,  LogOut,
  Layout,
  Menu,
  X
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Mobile menu toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-2 bg-white rounded-md shadow-md text-gray-700 hover:text-purple-600"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>      {/* Sidebar - Desktop always visible, mobile only when mobileMenuOpen is true */}
      <div className={`${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } w-64 bg-white h-screen shadow-lg fixed left-0 top-0 z-20 transition-transform duration-300 ease-in-out flex flex-col`}>
        {/* Logo/Brand */}
        <div className="h-20 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center px-6 flex-shrink-0">
          <h1 className="text-xl font-bold text-white">WanderWise Admin</h1>
        </div>
        
        {/* Profile Summary */}
        <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500 bg-white">
              {user?.profile.avatar ? (
                <img
                  src={user?.profile.avatar}
                  alt={`${user?.profile.firstName} ${user?.profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center text-xl text-purple-700 font-bold">
                  {user?.profile.firstName?.charAt(0) || ""}
                  {user?.profile.lastName?.charAt(0) || ""}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-gray-900 truncate">
                {user?.profile.firstName} {user?.profile.lastName}
              </h2>
              <div className="flex items-center mt-1">
                <RoleBadge role={user?.role || "admin"} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActivePage("dashboard")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "dashboard" ? "bg-purple-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Layout className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePage("users")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "users" ? "bg-purple-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Users</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePage("guides")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "guides" ? "bg-purple-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <UserCheck className="w-5 h-5" />
                <span>Tour Guides</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePage("destinations")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "destinations" ? "bg-purple-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span>Destinations</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePage("bookings")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "bookings" ? "bg-purple-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePage("analytics")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "analytics" ? "bg-purple-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </button>
            </li>
            
            {/* Separator for Settings */}
            <div className="my-2 border-t border-gray-100"></div>
            
            <li>
              <button
                onClick={() => setActivePage("settings")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === "settings"
                    ? "bg-purple-500 text-white"
                    : "text-purple-600 bg-purple-50 hover:bg-purple-100"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </li>
            
            {/* Add some extra space at the bottom for better scrolling experience */}
            <div className="h-16"></div>
          </ul>
        </nav>
        
        {/* Logout at bottom */}
        <div className="w-full p-4 bg-gray-50 shadow-inner flex-shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="lg:ml-64 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {activePage === "dashboard" && "Admin Dashboard"}
              {activePage === "users" && "User Management"}
              {activePage === "guides" && "Tour Guide Management"}
              {activePage === "destinations" && "Destinations"}
              {activePage === "bookings" && "Bookings"}
              {activePage === "analytics" && "Analytics"}
              {activePage === "settings" && "System Settings"}
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.profile.firstName} {user?.profile.lastName}
            </p>
          </div>
        </div>

        {/* Content based on active page */}
        {activePage === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={dashboardStats.totalUsers.toLocaleString()}
                icon={<Users className="w-6 h-6 text-purple-600" />}
                trend="+12% this month"
              />
              <StatCard
                title="Active Tour Guides"
                value={dashboardStats.activeTourGuides}
                icon={<UserCheck className="w-6 h-6 text-purple-600" />}
                trend="+5% this month"
              />
              <StatCard
                title="Destinations"
                value={dashboardStats.totalDestinations}
                icon={<MapPin className="w-6 h-6 text-purple-600" />}
                trend="+8 new this month"
              />
              <StatCard
                title="Monthly Bookings"
                value={dashboardStats.monthlyBookings}
                icon={<Calendar className="w-6 h-6 text-purple-600" />}
                trend="+18% this month"
              />
              <StatCard
                title="Revenue"
                value={`$${dashboardStats.revenue.toLocaleString()}`}
                icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
                trend="+25% this month"
              />
              <StatCard
                title="Average Rating"
                value={dashboardStats.averageRating}
                icon={<Star className="w-6 h-6 text-purple-600" />}
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
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All Activities
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <button 
                onClick={() => setActivePage("users")}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
              >
                <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">
                  View and manage user accounts
                </p>
              </button>
              <button 
                onClick={() => setActivePage("destinations")}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
              >
                <Globe className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Destinations</h3>
                <p className="text-sm text-gray-600">Add and edit destinations</p>
              </button>
              <button 
                onClick={() => setActivePage("analytics")}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
              >
                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">View detailed reports</p>
              </button>
              <button 
                onClick={() => setActivePage("settings")}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
              >
                <Settings className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-gray-900">System Settings</h3>
                <p className="text-sm text-gray-600">Configure platform settings</p>
              </button>
            </div>
          </>
        )}

        {/* Other pages */}
        {activePage === "users" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
            <p className="text-gray-600">
              View and manage all user accounts here. This section is currently under development.
            </p>
          </div>
        )}
        
        {activePage === "guides" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tour Guide Management</h2>
            <p className="text-gray-600">
              Approve and manage tour guide accounts here. This section is currently under development.
            </p>
          </div>
        )}
        
        {activePage === "destinations" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Destinations</h2>
            <p className="text-gray-600">
              Add, edit, and manage destinations here. This section is currently under development.
            </p>
          </div>
        )}
        
        {activePage === "bookings" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bookings</h2>
            <p className="text-gray-600">
              View and manage all tour bookings here. This section is currently under development.
            </p>
          </div>
        )}
        
        {activePage === "analytics" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
            <p className="text-gray-600">
              View detailed analytics and reports here. This section is currently under development.
            </p>
          </div>
        )}
        
        {activePage === "settings" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
            <p className="text-gray-600">
              Configure system settings here. This section is currently under development.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
