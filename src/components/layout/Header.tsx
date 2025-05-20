import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  MapPin,
  User,
  Calendar,
  Globe,
  Search,
  Info,
  Star as StarIcon,
  LogOut,
} from "lucide-react";
import Logo from "../common/Logo";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status when component mounts
    const checkLoginStatus = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const userData = localStorage.getItem("user");
      if (isLoggedIn === "true" && userData) {
        const { email } = JSON.parse(userData);
        setUserEmail(email);
      } else {
        setUserEmail(null);
      }
    };

    checkLoginStatus();
    // Add event listener for storage changes
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setUserEmail(null);
    navigate("/login");
  };

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
    { name: "Explore", path: "/#explore", icon: <Globe className="w-5 h-5" /> },
    {
      name: "Itineraries",
      path: "/itineraries",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: "Reviews",
      path: "/reviews",
      icon: <StarIcon className="w-5 h-5" />,
    },
    { name: "About", path: "/about", icon: <Info className="w-5 h-5" /> },
  ];
  return (
    <header
      className={`fixed w-full top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm ${
        isScrolled
          ? "bg-white/95 shadow-lg text-gray-800"
          : "bg-transparent text-white"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center group hover:opacity-80">
          <Logo
            className={`transform transition-transform duration-300 group-hover:scale-105 ${
              isScrolled ? "text-teal-600" : "text-white"
            }`}
            width={80}
            height={80}
          />
          <span
            className={`font-bold text-2xl -ml-2 transition-colors duration-300 ${
              isScrolled ? "text-teal-600" : "text-white"
            }`}
          >
            WanderWise
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300
                ${
                  location.pathname === link.path
                    ? isScrolled
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "bg-white/10 text-white font-medium"
                    : isScrolled
                    ? "text-gray-700 hover:text-teal-600 hover:bg-teal-50/80"
                    : "text-white hover:text-teal-400 hover:bg-white/10"
                }`}
            >
              {React.cloneElement(link.icon, {
                className: `w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                  location.pathname === link.path
                    ? "text-teal-500"
                    : isScrolled
                    ? "text-gray-500 group-hover:text-teal-600"
                    : "text-white group-hover:text-teal-400"
                }`,
              })}
              <span className="transform transition-all duration-300 group-hover:translate-x-0.5">
                {link.name}
              </span>
            </Link>
          ))}

          <button
            className={`group flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300
              ${
                isScrolled
                  ? "bg-teal-50 text-teal-600 hover:bg-teal-100"
                  : "bg-white/10 text-white hover:text-teal-400 hover:bg-white/20"
              }`}
          >
            <Search
              className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                isScrolled
                  ? "group-hover:text-teal-600"
                  : "group-hover:text-teal-400"
              }`}
            />
            <span className="transform transition-all duration-300 group-hover:translate-x-0.5">
              Search
            </span>
          </button>

          {userEmail ? (
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 ${
                  isScrolled
                    ? "bg-gray-50 hover:bg-teal-50"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    isScrolled ? "text-teal-600" : "text-white"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isScrolled ? "text-gray-700" : "text-white"
                  }`}
                >
                  {userEmail}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className={`group flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300
                  ${
                    isScrolled
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-white/10 text-white hover:text-red-400 hover:bg-white/20"
                  }`}
              >
                <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="transform transition-all duration-300 group-hover:translate-x-0.5">
                  Logout
                </span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`group flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300
                ${
                  isScrolled
                    ? "bg-teal-500 text-white hover:bg-teal-600"
                    : "bg-white/10 text-white hover:text-teal-400 hover:bg-white/20"
                }`}
            >
              <User className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="transform transition-all duration-300 group-hover:translate-x-0.5">
                Login
              </span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded-lg p-2 transition-colors duration-300"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X
              className={`w-6 h-6 ${
                isScrolled ? "text-gray-800" : "text-white"
              }`}
            />
          ) : (
            <Menu
              className={`w-6 h-6 ${
                isScrolled ? "text-gray-800" : "text-white"
              }`}
            />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300">
          <div className="fixed inset-y-0 right-0 w-72 bg-white shadow-2xl p-6 transform transition-all duration-300 ease-out z-50">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-gray-800">Menu</span>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1">
                <ul className="space-y-2">
                  {navLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300
                          ${
                            location.pathname === link.path
                              ? "bg-teal-50 text-teal-600"
                              : "text-gray-600 hover:bg-teal-50 hover:text-teal-600"
                          }`}
                      >
                        {React.cloneElement(link.icon, {
                          className: `w-5 h-5 ${
                            location.pathname === link.path
                              ? "text-teal-500"
                              : "text-gray-500 group-hover:text-teal-600"
                          }`,
                        })}
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}

                  <li className="pt-4 mt-4 border-t border-gray-100">
                    {userEmail ? (
                      <>
                        <div className="px-4 py-3 rounded-lg bg-teal-50 mb-3">
                          <div className="flex items-center space-x-3 text-gray-700">
                            <User className="w-5 h-5 text-teal-500" />
                            <span className="text-sm font-medium">
                              {userEmail}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-300"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-300"
                      >
                        <User className="w-5 h-5" />
                        <span>Login</span>
                      </Link>
                    )}
                  </li>
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
