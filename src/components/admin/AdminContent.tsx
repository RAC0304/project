import React from 'react';
import DashboardContent from './DashboardContent';
import UsersContent from './UsersContent';
import GuidesContent from './GuidesContent';
import DestinationsContent from './DestinationsContent';
import BookingsContent from './BookingsContent';
import AnalyticsContent from './AnalyticsContent';

interface AdminContentProps {
    activePage: string;
    setActivePage: (page: string) => void;
    user: any;
}

const AdminContent: React.FC<AdminContentProps> = ({
    activePage,
    setActivePage,
    user
}) => {
    return (
        <div className="lg:ml-64 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
                <div>                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {activePage === "dashboard" && "Admin Dashboard"}
                    {activePage === "users" && "User Management"}
                    {activePage === "guides" && "Tour Guide Management"}
                    {activePage === "destinations" && "Destinations"}
                    {activePage === "bookings" && "Bookings"}
                    {activePage === "analytics" && "Analytics"}
                </h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back, {user?.profile.firstName} {user?.profile.lastName}
                    </p>
                </div>
            </div>

            {/* Content based on active page */}
            {activePage === "dashboard" && (
                <DashboardContent setActivePage={setActivePage} user={user} />
            )}      {activePage === "users" && (
                <UsersContent user={user} />
            )}

            {activePage === "guides" && (
                <GuidesContent user={user} />
            )}

            {activePage === "destinations" && (
                <DestinationsContent user={user} />
            )}

            {activePage === "bookings" && (
                <BookingsContent user={user} />
            )}            {activePage === "analytics" && (
                <AnalyticsContent user={user} />
            )}
        </div>
    );
};

export default AdminContent;