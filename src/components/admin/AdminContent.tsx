import React from "react";
import DashboardContent from "./DashboardContent";
import UsersContent from "./UsersContent";
import GuidesContent from "./GuidesContent";
import DestinationsContent from "./DestinationsContent";
import BookingsContent from "./BookingsContent";
import AnalyticsContent from "./AnalyticsContent";
import SecurityContent from "./SecurityContent";
import DatabaseConnectionTest from "./DatabaseConnectionTest";

interface AdminContentProps {
  activePage: string;
  setActivePage: (page: string) => void;
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
  } | null;
}

const AdminContent: React.FC<AdminContentProps> = ({
  activePage,
  setActivePage,
  user,
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
        <div>
          {" "}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {" "}
            {activePage === "dashboard" && "Admin Dashboard"}
            {activePage === "users" && "User Management"}
            {activePage === "guides" && "Tour Guide Management"}
            {activePage === "destinations" && "Destinations"}
            {activePage === "bookings" && "Bookings"}
            {activePage === "analytics" && "Analytics"}
            {activePage === "security" && "Security Management"}
            {activePage === "database" && "Database Management"}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.profile.firstName} {user?.profile.lastName}
          </p>
        </div>
      </div>
      {/* Content based on active page */}{" "}
      {activePage === "dashboard" && (
        <DashboardContent setActivePage={setActivePage} />
      )}{" "}
      {activePage === "users" && <UsersContent />}{" "}
      {activePage === "guides" && <GuidesContent />}
      {activePage === "destinations" && <DestinationsContent />}
      {activePage === "bookings" && <BookingsContent />}{" "}
      {activePage === "analytics" && <AnalyticsContent user={user} />}
      {activePage === "security" && <SecurityContent />}
      {activePage === "database" && <DatabaseConnectionTest />}
    </div>
  );
};

export default AdminContent;
