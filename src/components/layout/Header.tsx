import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  MapPin,
  User,
  Calendar,
  Info,
  LogOut,
  Book,
} from "lucide-react";
import Logo from "../common/Logo";
import { useEnhancedAuth } from "../../contexts/useEnhancedAuth";
import { toast } from "react-toastify";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useEnhancedAuth();

  // Check if current page is home page
  const isHomePage = location.pathname === "/home" || location.pathname === "/";
  // Check if it's exactly the destinations list page
  const isDestinationsListPage = location.pathname === "/destinations";
  // Check if it's a destination detail page (includes /destinations/ but is not the list page)
  const isDestinationDetailPage = location.pathname.includes("/destinations/");
  // Check if we're on any destinations-related page (for white text)
  const isDestinationsPage = location.pathname.includes("/destinations");

  // Use white text on home and destination detail pages only
  const useWhiteText = !isScrolled && (isHomePage || isDestinationDetailPage);

  // Show green menu background only on home page or destination detail pages before scrolling
  const showGreenMenuBg = !isScrolled && (isHomePage || isDestinationDetailPage);

  // Solid green background specifically for destination detail pages
  const showSolidGreenMenuBg = !isScrolled && isDestinationDetailPage;

  // No longer using the white logo on destinations list page
  // const useWhiteLogoOnDestination = !isScrolled && isDestinationsPage;

  // Use white text for menu items on home and destination detail pages before scrolling
  const useWhiteMenuText = !isScrolled && (isHomePage || isDestinationDetailPage);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  const navLinks = [
    {
      name: "Destinations",
      path: "/destinations",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      name: "Tour Guides",
      path: "/tour-guides",
      icon: <User className="w-5 h-5" />,
    },

    {
      name: "Itineraries",
      path: "/itineraries",
      icon: <Calendar className="w-5 h-5" />,
    },

    { name: "About", path: "/about", icon: <Info className="w-5 h-5" /> },
    {
      name: "History",
      path: "/history",
      icon: <Book className="w-5 h-5" />,
    },
  ];

  // Change the header class to be fully white when scrolled
  const headerClass = isScrolled
    ? "bg-white shadow-sm text-gray-800" // Fully white background with slight shadow
    : "bg-transparent text-white";

  const handleLogout = async () => {
    await logout();
    toast.success("Logout berhasil!");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  };

  return (
    <header className="fixed top-0 w-full z-50" style={{ marginTop: "-5px" }}>
      <div className={`relative transition-all duration-300 ${headerClass}`}>
        {/* Glass effect overlay for better readability */}
        {!isScrolled && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        )}
        <div className="container mx-auto px-4 py-3 flex justify-between items-center relative z-10">
          <Link to="/home" className="flex items-center">
            <Logo
              className={
                isScrolled
                  ? "text-teal-600"
                  : useWhiteText
                    ? "text-white"
                    : "text-teal-600"
              }
              width={60}
              height={60}
            />
            <span
              className={`font-bold ml-2 text-xl md:text-2xl ${isScrolled
                  ? "text-teal-600"
                  : useWhiteText
                    ? "text-white"
                    : "text-teal-600"
                }`}
            >
              <span className="hidden sm:inline">WanderWise</span>
              <span className="sm:hidden">WW</span>
            </span>
          </Link>

          {/* Added container with rounded background for navigation menu */}
          <div className="hidden md:flex items-center">
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-full ${isScrolled
                  ? "bg-transparent" // Remove background completely when scrolled
                  : showSolidGreenMenuBg
                    ? "bg-teal-600 backdrop-blur-sm"
                    : showGreenMenuBg
                      ? "bg-teal-600/30 backdrop-blur-sm"
                      : "bg-white/90 backdrop-blur-sm"
                } transition-all duration-300`}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition
                  ${location.pathname === link.path
                      ? isScrolled
                        ? "bg-teal-100 font-semibold"
                        : useWhiteMenuText
                          ? "bg-white/20 font-semibold"
                          : "bg-teal-100 font-semibold"
                      : "font-medium"  // Removed hover:bg-gray-100 background
                    }
                  ${isScrolled
                      ? "text-teal-600 hover:text-teal-700"
                      : useWhiteMenuText
                        ? "text-white hover:text-teal-300"
                        : "text-teal-600 hover:text-teal-700"
                    }`}
                >
                  {React.cloneElement(link.icon, {
                    className: `w-4 h-4 ${isScrolled
                        ? "text-teal-600"
                        : useWhiteMenuText
                          ? "text-white"
                          : "text-teal-600"
                      }`,
                  })}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            {user ? (
              <div className="flex items-center space-x-4 ml-6">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-300"
                >
                  <User className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold">
                    {user.profile.firstName} {user.profile.lastName}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg 
                  bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg 
                ${isScrolled
                    ? "bg-teal-500 text-white hover:bg-teal-600"
                    : "bg-transparent text-white hover:text-teal-300"
                  } transition-colors duration-300`}
              >
                <User className={`w-4 h-4 ${isScrolled ? "" : "text-white"}`} />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden relative group"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className={`relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg transition-all duration-200 ${isScrolled
                ? 'bg-gray-100 hover:bg-gray-200'
                : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
              }`}>
              <div className={`transition-all duration-300 absolute ${isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}>
                <Menu
                  className={`w-5 h-5 ${isScrolled
                      ? "text-gray-700"
                      : useWhiteText
                        ? "text-white"
                        : "text-teal-600"
                    }`}
                />
              </div>
              <div className={`transition-all duration-300 absolute ${isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}>
                <X
                  className={`w-5 h-5 ${isScrolled
                      ? "text-gray-700"
                      : useWhiteText
                        ? "text-white"
                        : "text-teal-600"
                    }`}
                />
              </div>
            </div>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div
          className={`fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-gradient-to-br from-white to-gray-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex flex-col h-full">
            {/* Header menu mobile dengan gradient */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 rounded-bl-3xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <Logo className="text-white" width={40} height={40} />
                  <span className="text-xl font-bold text-white">WanderWise</span>
                </div>
                <button
                  onClick={toggleMenu}
                  className="text-white hover:text-teal-200 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User info section di mobile */}
              {user && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {user.profile.firstName} {user.profile.lastName}
                      </p>
                      <p className="text-teal-100 text-xs">Member aktif</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation menu */}
            <nav className="flex-1 p-6">
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${location.pathname === link.path
                          ? 'bg-teal-50 text-teal-700 shadow-sm border-l-4 border-teal-600'
                          : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                        }`}
                    >
                      <div className={`p-2 rounded-lg ${location.pathname === link.path
                          ? 'bg-teal-100'
                          : 'bg-gray-100'
                        }`}>
                        {React.cloneElement(link.icon, {
                          className: `w-5 h-5 ${location.pathname === link.path ? 'text-teal-600' : 'text-gray-500'
                            }`,
                        })}
                      </div>
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Action buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-4 p-4 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-200 shadow-lg"
                    >
                      <div className="p-2 rounded-lg bg-white/20">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Profil Saya</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 shadow-lg w-full"
                    >
                      <div className="p-2 rounded-lg bg-white/20">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg"
                  >
                    <div className="p-2 rounded-lg bg-white/20">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Masuk / Daftar</span>
                  </Link>
                )}
              </div>
            </nav>

            {/* Footer mobile menu */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <p className="text-center text-xs text-gray-500">
                © 2025 WanderWise. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
