import React, { useState } from "react";
import { useEnhancedAuth } from "../../contexts/useEnhancedAuth";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminContent from "../../components/admin/AdminContent";
import MinimizeButton from "../../components/admin/layout/MinimizeButton";
import { Menu } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user } = useEnhancedAuth();
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const toggleSidebar = () => {
    setSidebarMinimized(!sidebarMinimized);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isMinimized={sidebarMinimized}
      />
      <main
        className={`flex-1 overflow-auto ${
          sidebarMinimized ? "lg:pl-28" : "lg:pl-80"
        } transition-all duration-300`}
      >
        {" "}
        {/* Header with Mobile Menu and Minimize Button */}
        <div className="sticky top-0 z-10  px-8 py-3 flex items-center justify-between">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 transition-all duration-200 hover:bg-gray-200"
            >
              <Menu size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Desktop minimize button */}
          <div className="hidden lg:block">
            <MinimizeButton
              isMinimized={sidebarMinimized}
              onToggle={toggleSidebar}
            />
          </div>
        </div>
        {/* Content Area */}
        <div>
          <AdminContent
            activePage={activePage}
            setActivePage={setActivePage}
            user={user}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
