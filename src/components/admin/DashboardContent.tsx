import React from 'react';
import {
    Users,
    UserCheck,
    MapPin,
    Calendar,
    BarChart3,
    Star,
    Globe,
    Settings,
    AlertCircle
} from 'lucide-react';
import StatCard from './StatCard';

interface DashboardContentProps {
    setActivePage: (page: string) => void;
    user: any;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
    setActivePage,
    user
}) => {
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
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
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
                <button
                    onClick={() => setActivePage("settings")}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
                >
                    <Settings className="w-6 h-6 md:w-8 md:h-8 text-teal-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">System Settings</h3>
                    <p className="text-sm text-gray-600">Configure platform settings</p>
                </button>
            </div>
        </>
    );
};

export default DashboardContent;