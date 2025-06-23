import React from "react";
import {
  Users,
  BarChart3,
  MapPin,
  Calendar,
  UserCheck,
  LogOut,
  Layout,
  ChevronRight,
  Shield,
  Database,
} from "lucide-react";
import { useEnhancedAuth } from "../../contexts/useEnhancedAuth";
import { useNavigate } from "react-router-dom";
import RoleBadge from "../common/RoleBadge";
import AdminSidebarLogo from "./AdminSidebarLogo";
import { supabase } from "../../utils/supabaseClient";

interface AdminSidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  isMinimized?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activePage,
  setActivePage,
  mobileMenuOpen,
  setMobileMenuOpen,
  isMinimized = false,
}) => {
  const { user, logout } = useEnhancedAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // destroy supabase session
    } catch (e) {
      console.error("Supabase signOut error", e);
    }
    logout();
    console.log("Logout berhasil: session Supabase dan lokal sudah dihapus.");
    navigate("/login");
  };

  // Define menu item groups for better organization
  const menuItems = [
    {
      group: "Main",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <Layout className="w-[18px] h-[18px]" />,
        },
      ],
    },
    {
      group: "Management",
      items: [
        {
          id: "users",
          label: "Users",
          icon: <Users className="w-[18px] h-[18px]" />,
        },
        {
          id: "guides",
          label: "Tour Guides",
          icon: <UserCheck className="w-[18px] h-[18px]" />,
        },
        {
          id: "security",
          label: "Security",
          icon: <Shield className="w-[18px] h-[18px]" />,
        },
        {
          id: "database",
          label: "Database",
          icon: <Database className="w-[18px] h-[18px]" />,
        },
      ],
    },
    {
      group: "Content",
      items: [
        {
          id: "destinations",
          label: "Destinations",
          icon: <MapPin className="w-[18px] h-[18px]" />,
        },
      ],
    },
    {
      group: "Operations",
      items: [
        {
          id: "bookings",
          label: "Bookings",
          icon: <Calendar className="w-[18px] h-[18px]" />,
        },
        {
          id: "analytics",
          label: "Analytics",
          icon: <BarChart3 className="w-[18px] h-[18px]" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}{" "}
      {/* Sidebar - Desktop always visible, mobile only when mobileMenuOpen is true */}{" "}
      <div
        className={`${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${
          isMinimized ? "w-20" : "w-72"
        } bg-white h-screen shadow-xl fixed left-0 top-0 z-20 transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
      >
        {" "}
        {/* Logo/Brand - Improved styling */}{" "}
        <div className="h-20 bg-gradient-to-r from-teal-600 to-emerald-600 flex items-center justify-center px-4 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md overflow-hidden">
              <AdminSidebarLogo
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            {!isMinimized && (
              <h1 className="ml-3 text-xl font-bold text-white tracking-wide">
                WanderWise
              </h1>
            )}
          </div>
        </div>{" "}
        {/* Profile Summary - Improved with better spacing and shadow */}{" "}
        <div className="p-5 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
          <div
            className={`flex ${
              isMinimized ? "justify-center" : "items-center space-x-4"
            }`}
          >
            {" "}
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500 bg-white shadow-inner">
              <AdminSidebarLogo
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            {!isMinimized && (
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-800 truncate">
                  {user?.profile.firstName} {user?.profile.lastName}
                </h2>
                <div className="flex items-center mt-1">
                  <RoleBadge role={user?.role || "admin"} />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Navigation with scrollable content */}
        <nav className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2">
            {" "}
            {menuItems.map((menuGroup, groupIdx) => (
              <div key={groupIdx} className="mb-5">
                {!isMinimized && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                    {menuGroup.group}
                  </h3>
                )}
                <ul className="space-y-1">
                  {menuGroup.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActivePage(item.id)}
                        title={item.label}
                        className={`w-full ${
                          isMinimized
                            ? "flex justify-center"
                            : "flex items-center justify-between"
                        } p-3 rounded-lg transition-all duration-200 ${
                          activePage === item.id
                            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {isMinimized ? (
                          <div className="flex items-center justify-center">
                            {item.icon}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-3">
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </div>
                            {activePage === item.id && (
                              <ChevronRight className="w-4 h-4 text-white" />
                            )}
                          </>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}{" "}
            {/* Add some bottom padding for better scroll experience */}
            <div className="h-4"></div>
          </div>{" "}
          {/* Logout button positioned directly after navigation items */}
          <div className="px-4 py-4 border-t border-gray-100 mt-auto">
            {" "}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className={`w-full ${
                isMinimized
                  ? "flex justify-center"
                  : "flex items-center justify-center space-x-2"
              } p-3 text-red-700 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200`}
            >
              <LogOut className="w-5 h-5" />
              {!isMinimized && <span className="font-medium">Sign Out</span>}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
