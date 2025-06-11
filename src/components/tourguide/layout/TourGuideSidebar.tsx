import React, { useState } from "react";
import { useAuth } from "../../../contexts/CustomAuthContext";
import RoleBadge from "../../common/RoleBadge";
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
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../../common/Logo";
import { PROFILE_IMAGE } from "../../../constants/images";

interface TourGuideSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  onLogout?: () => void;
  onMinimizeChange?: (isMinimized: boolean) => void;
  isMinimized?: boolean;
}

const TourGuideSidebar: React.FC<TourGuideSidebarProps> = ({
  activePage,
  onPageChange,
  onLogout,
  onMinimizeChange,
  isMinimized: externalIsMinimized = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalIsMinimized, setInternalIsMinimized] = useState(false);

  // Use external minimize state if provided, otherwise use internal state
  const isMinimized = externalIsMinimized || internalIsMinimized;

  const handleToggleMinimize = () => {
    if (onMinimizeChange) {
      // If external handler is provided, use it
      onMinimizeChange(!isMinimized);
    } else {
      // Otherwise use internal state
      setInternalIsMinimized(!internalIsMinimized);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    // If onLogout prop is provided, also call it (for backward compatibility)
    if (onLogout) {
      onLogout();
    }
  };

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
          id: "tours",
          label: "My Tours",
          icon: <MapPin className="w-[18px] h-[18px]" />,
        },
        {
          id: "bookings",
          label: "Bookings",
          icon: <Calendar className="w-[18px] h-[18px]" />,
        },
        {
          id: "clients",
          label: "Clients",
          icon: <Users className="w-[18px] h-[18px]" />,
        },
      ],
    },
    {
      group: "Feedback",
      items: [
        {
          id: "reviews",
          label: "Reviews",
          icon: <Star className="w-[18px] h-[18px]" />,
        },
        {
          id: "messages",
          label: "Messages",
          icon: <MessageSquare className="w-[18px] h-[18px]" />,
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
      )}
      {/* Mobile menu toggle - only visible on mobile */}
      <div className="lg:hidden fixed top-6 left-6 z-30">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 bg-white rounded-lg shadow-lg text-gray-700 hover:text-teal-600 ring-1 ring-black/5"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>{" "}
      {/* Sidebar - Desktop always visible, mobile only when mobileMenuOpen is true */}
      <div
        className={`${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${
          isMinimized ? "w-20" : "w-72"
        } bg-white h-screen shadow-xl fixed left-0 top-0 z-20 transition-all duration-300 ease-in-out`}
      >
        {" "}
        {/* Logo/Brand */}
        <div className="h-20 bg-gradient-to-r from-teal-600 to-emerald-600 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md overflow-hidden">
              <Logo width={48} height={48} className="object-contain" />
            </div>
            {!isMinimized && (
              <h1 className="ml-3 text-xl font-bold text-white tracking-wide">
                WanderWise
              </h1>
            )}
          </div>
          {/* Desktop minimize toggle button */}
        </div>{" "}
        {/* Profile Summary */}
        <div className="p-5 border-b border-gray-100 bg-white shadow-sm sticky top-20 z-20">
          <div
            className={`flex ${
              isMinimized ? "justify-center" : "items-center space-x-4"
            }`}
          >
            {" "}
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500 bg-white shadow-inner">
              <img
                src={PROFILE_IMAGE}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {!isMinimized && (
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-800 truncate">
                  {user?.profile.firstName} {user?.profile.lastName}
                </h2>
                <div className="flex items-center mt-1">
                  <RoleBadge role={user?.role || "tour_guide"} />
                </div>
              </div>
            )}
          </div>
        </div>{" "}
        {/* Navigation with scrollable content */}{" "}
        <nav className="flex flex-col h-[calc(100vh-144px)] relative">
          <div className="flex-1 px-4 pt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            {menuItems.map((menuGroup, groupIdx) => (
              <div key={groupIdx} className="mb-6">
                {!isMinimized && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
                    {menuGroup.group}
                  </h3>
                )}
                <ul className="space-y-1.5">
                  {menuGroup.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => onPageChange(item.id)}
                        title={item.label}
                        className={`w-full ${
                          isMinimized
                            ? "flex justify-center"
                            : "flex items-center justify-between"
                        } p-3 rounded-lg transition-all duration-200 ${
                          activePage === item.id
                            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
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
            <div className="mb-12">
              <button
                onClick={() => onPageChange("profile")}
                title="My Profile"
                className={`w-full ${
                  isMinimized
                    ? "flex justify-center"
                    : "flex items-center justify-between"
                } p-3 rounded-lg transition-all duration-200 ${
                  activePage === "profile"
                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {isMinimized ? (
                  <div className="flex items-center justify-center">
                    <User className="w-[18px] h-[18px]" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <User className="w-[18px] h-[18px]" />
                      <span className="font-medium">My Profile</span>
                    </div>
                    {activePage === "profile" && (
                      <ChevronRight className="w-4 h-4 text-white" />
                    )}
                  </>
                )}
              </button>
            </div>
          </div>{" "}
          {/* Sign Out Button - Fixed at bottom */}
          <div className="px-4 py-4 border-t border-gray-100 bg-white sticky bottom-0 left-0 right-0 shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">
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

export default TourGuideSidebar;
