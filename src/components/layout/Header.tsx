import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import Logo from "../common/Logo";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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

  const headerClass = isScrolled
    ? "bg-white shadow-md text-gray-800"
    : "bg-transparent text-white";

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${headerClass}`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Logo className={isScrolled ? "text-teal-600" : "text-white"} />
          <span
            className={`ml-2 font-bold text-2xl ${
              isScrolled ? "text-teal-600" : "text-white"
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
              className={`flex items-center space-x-1 px-2 py-1 rounded-full transition hover:bg-teal-500/10
                ${
                  location.pathname === link.path
                    ? "font-medium"
                    : "font-normal"
                }
                ${
                  isScrolled
                    ? "text-gray-700 hover:text-teal-600"
                    : "text-white hover:text-white"
                }`}
            >
              {React.cloneElement(link.icon, {
                className: `w-4 h-4 ${
                  isScrolled ? "text-teal-600" : "text-white"
                }`,
              })}
              <span>{link.name}</span>
            </Link>
          ))}

          <button
            className={`flex items-center space-x-1 px-3 py-1.5 border border-teal-500 rounded-full transition
              ${
                isScrolled
                  ? "text-teal-600 hover:bg-teal-50"
                  : "text-white border-white/70 hover:bg-white/10"
              }`}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>

        <button
          className="md:hidden text-2xl focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className={isScrolled ? "text-gray-800" : "text-white"} />
          ) : (
            <Menu className={isScrolled ? "text-gray-800" : "text-white"} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-teal-900 z-40 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="flex items-center">
              <Logo className="text-white" />
              <span className="ml-2 font-bold text-2xl text-white">
                WanderWise
              </span>
            </Link>
            <button
              onClick={toggleMenu}
              className="text-white text-2xl focus:outline-none"
              aria-label="Close menu"
            >
              <X />
            </button>
          </div>

          <nav className="flex flex-col space-y-6 mt-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-3 text-white text-xl py-2 border-b border-teal-800"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <button className="w-full flex items-center justify-center space-x-2 bg-white text-teal-800 py-3 px-4 rounded-full font-medium">
              <Search className="w-5 h-5" />
              <span>Search Destinations</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
