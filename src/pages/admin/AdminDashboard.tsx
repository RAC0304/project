import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, X } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminContent from "../../components/admin/AdminContent";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const handleSidebarMinimize = (isMinimized: boolean) => {
    setSidebarMinimized(isMinimized);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile menu toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-md shadow-md text-gray-700 hover:text-teal-600"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar Component */}
      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onMinimizeChange={handleSidebarMinimize}
      />

      {/* Content Component */}
      <AdminContent
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        sidebarMinimized={sidebarMinimized}
      />
    </div>
  );
};

export default AdminDashboard;
