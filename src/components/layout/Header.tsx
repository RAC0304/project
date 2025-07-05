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

  const headerClass = isScrolled
    ? "bg-white/95 backdrop-blur-sm shadow-md text-gray-800"
    : "bg-transparent text-white"; // Changed to bg-transparent

  const handleLogout = async () => {
    await logout();
    toast.success("Logout berhasil!");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${headerClass}`}
    >
      {" "}
      <div className="container mx-auto px-4 py-1 flex justify-between items-center">
        <Link to="/home" className="flex items-center">
          <Logo
            className={
              isScrolled
                ? "text-teal-600"
                : isHomePage
                ? "text-white"
                : "text-teal-600"
            }
            width={60}
            height={60}
          />
          <span
            className={`font-bold text-2xl ml-2 ${
              isScrolled
                ? "text-teal-600"
                : isHomePage
                ? "text-white"
                : "text-teal-600"
            }`}
          >
            WanderWise
          </span>
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-full transition hover:bg-teal-500/10
                ${
                  location.pathname === link.path
                    ? "font-semibold"
                    : "font-medium"
                }
                ${
                  isScrolled
                    ? "text-teal-600 hover:text-teal-700"
                    : isHomePage 
                      ? "text-white hover:text-white" 
                      : "text-teal-600 hover:text-teal-700"
                }`}
            >
              {React.cloneElement(link.icon, {
                className: `w-4 h-4 ${
                  isScrolled 
                    ? "text-teal-600" 
                    : isHomePage 
                      ? "text-white" 
                      : "text-teal-600"
                }`,
              })}
              <span>{link.name}</span>
            </Link>
          ))}{" "}
          {user ? (
            <div className="flex items-center space-x-4">
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
                ${
                  isScrolled
                    ? "bg-teal-500 text-white hover:bg-teal-600"
                    : "bg-white/20 text-teal-500 hover:bg-white/30"
                } transition-colors duration-300`}
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-2xl"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className={isScrolled ? "text-gray-800" : "text-teal-600"} />
          ) : (
            <Menu className={isScrolled ? "text-gray-800" : "text-teal-600"} />
          )}
        </button>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-50">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-gray-800">Menu</span>
                <button
                  onClick={toggleMenu}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1">
                <ul className="space-y-4">
                  {navLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors duration-300"
                      >
                        {link.icon}
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}{" "}
                  {user ? (
                    <>
                      <li className="pt-4 border-t">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors duration-300"
                        >
                          <User className="w-4 h-4" />
                          <span>
                            {user.profile.firstName} {user.profile.lastName}
                          </span>
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-300"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </li>
                    </>
                  ) : (
                    <li className="pt-4 border-t">
                      <Link
                        to="/login"
                        className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors duration-300"
                      >
                        <User className="w-4 h-4" />
                        <span>Login</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
