import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import RoleBadge from "../common/RoleBadge";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  MessageSquare,
  Layout,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import femaleImg from "../../asset/image/female.jpg";

interface TourGuideSidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  handleLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const TourGuideSidebar: React.FC<TourGuideSidebarProps> = ({
  activePage,
  setActivePage,
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
  sidebarCollapsed,
}) => {
  const { user } = useAuth();

  return (
    <>
      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile menu toggle - only visible on mobile */}
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

      {/* Sidebar - Desktop always visible, mobile only when mobileMenuOpen is true */}
      <div
        className={`${mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          } ${sidebarCollapsed ? "w-30" : "w-65"
          } bg-white h-screen shadow-lg fixed left-0 top-0 z-20 transition-all duration-300 ease-in-out flex flex-col`}
        style={{ height: "100vh" }}
      >
        {/* Logo/Brand - Fixed */}{" "}
        <div className="h-20 bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center px-4 flex-shrink-0 justify-between">
          <div className="flex items-center">
            <img
              src="/src/asset/image/logologin.png"
              alt="WanderWise Logo"
              className={`${sidebarCollapsed ? "w-20 h-20" : "w-20 h-20"
                } object-contain mr-2`}
            />
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-white">WanderWise</h1>
            )}
          </div>
        </div>
        {/* Profile Summary - Fixed */}
        <div
          className={`${sidebarCollapsed ? "py-4" : "p-4"
            } border-b border-gray-200 bg-white shadow-sm flex-shrink-0`}
        >
          <div
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"
              }`}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500 bg-white flex items-center justify-center">
              <img
                src={femaleImg}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-gray-900 truncate">
                  {user?.profile.firstName} {user?.profile.lastName}
                </h2>
                <div className="flex items-center mt-1">
                  <RoleBadge role={user?.role || "tour_guide"} />
                </div>
              </div>
            )}
          </div>
        </div>{" "}
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActivePage("dashboard")}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"
                  } p-3 rounded-lg transition-colors ${activePage === "dashboard"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                title="Dashboard"
              >
                <Layout className="w-5 h-5" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("tours")}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"
                  } p-3 rounded-lg transition-colors ${activePage === "tours"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                title="My Tours"
              >
                <MapPin className="w-5 h-5" />
                {!sidebarCollapsed && <span>My Tours</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("bookings")}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"
                  } p-3 rounded-lg transition-colors ${activePage === "bookings"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                title="Bookings"
              >
                <Calendar className="w-5 h-5" />
                {!sidebarCollapsed && <span>Bookings</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("clients")}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"
                  } p-3 rounded-lg transition-colors ${activePage === "clients"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                title="Clients"
              >
                <Users className="w-5 h-5" />
                {!sidebarCollapsed && <span>Clients</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("reviews")}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"
                  } p-3 rounded-lg transition-colors ${activePage === "reviews"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                title="Reviews"
              >
                <Star className="w-5 h-5" />
                {!sidebarCollapsed && <span>Reviews</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage("messages")}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"
                  } p-3 rounded-lg transition-colors ${activePage === "messages"
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {!sidebarCollapsed && <span>Messages</span>}
              </button>
            </li>

            {/* Separator for Profile */}
            <div className="my-2 border-t border-gray-100"></div>

            <li>
              <button
                onClick={() => setActivePage("profile")}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"
                  } p-3 rounded-lg transition-colors ${activePage === "profile"
                    ? "bg-teal-500 text-white"
                    : "text-teal-600 bg-teal-50 hover:bg-teal-100"
                  }`}
                title="My Profile"
              >
                <User className="w-5 h-5" />
                {!sidebarCollapsed && <span>My Profile</span>}
              </button>{" "}
            </li>
          </ul>
        </nav>
        {/* Logout at bottom */}
        <div className="w-full p-4 bg-gray-50 shadow-inner flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default TourGuideSidebar;
