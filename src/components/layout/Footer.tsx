import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
// import Logo from "../common/Logo";

const Footer: React.FC = () => {
  return (
    <footer className="bg-teal-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <p className="text-teal-100 max-w-xs">
              Discover the beauty and culture of Indonesia with WanderWise, your
              trusted guide to unforgettable experiences.
            </p>
            <div className="flex space-x-4 pt-2"></div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/destinations"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  to="/itineraries"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  Itineraries
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">
              Information
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about#about"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  About Indonesia
                </Link>
              </li>
              <li>
                <Link
                  to="/about#culture"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  Cultural Insight
                </Link>
              </li>
              <li>
                <Link
                  to="/about#travel-tips"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  Travel Tips
                </Link>
              </li>
              <li>
                <Link
                  to="/about#facts"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  Fact About Indonesia
                </Link>
              </li>
              <li>
                <Link
                  to="/about#faq"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-teal-300 mt-0.5 mr-2" />
                <span className="text-teal-100">Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-teal-300 mr-2" />
                <a
                  href="mailto:wanderwise@gmail.com"
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  wanderwise@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-teal-800 text-center text-teal-200">
          <p>
            &copy; {new Date().getFullYear()} WanderWise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
