import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  MapPin,
  //   Globe,
  Calendar,
  Mail,
  Phone,
  Languages,
  Award,
  Clock,
  Users,
  CreditCard,
} from "lucide-react";
import { tourGuides } from "../data/tourGuides";
import { TourGuide } from "../types";
import BookingModal from "../components/tour-guides/BookingModal";

const TourGuideProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<TourGuide | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const foundGuide = tourGuides.find((guide) => guide.id === id);
    if (foundGuide) {
      setGuide(foundGuide);
      if (foundGuide.tours.length > 0) {
        setSelectedTourId(foundGuide.tours[0].id);
      }
    }

    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [id]);

  if (!guide) {
    return (
      <div className="pt-24 pb-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold">Tour guide not found</h2>
          <Link
            to="/tour-guides"
            className="inline-flex items-center mt-4 text-teal-600 hover:text-teal-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tour Guides
          </Link>
        </div>
      </div>
    );
  }

  const selectedTour =
    guide.tours.find((tour) => tour.id === selectedTourId) || guide.tours[0];

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/tour-guides"
            className="inline-flex items-center text-teal-600 hover:text-teal-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tour Guides
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Cover Image - Gradient Background */}
          <div className="h-20 bg-gradient-to-r from-white"></div>

          <div className="px-6 py-6 md:px-8 md:py-8 -mt-20">
            <div className="flex flex-col md:flex-row">
              {/* Profile Image */}
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6">
                <img
                  src={guide.imageUrl}
                  alt={guide.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      {guide.name}
                    </h1>

                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{guide.location}</span>
                    </div>

                    <div className="flex items-center mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(guide.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600">
                        ({guide.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-md transition-colors flex items-center"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book a Tour
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-block px-3 py-1 text-sm bg-teal-50 text-teal-700 rounded-full"
                    >
                      {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Guide Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                About {guide.name}
              </h2>
              <p className="text-gray-700 mb-6">{guide.description}</p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Award className="w-5 h-5 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Experience</h3>
                    <p className="text-gray-600">{guide.experience} years</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Languages className="w-5 h-5 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Languages</h3>
                    <p className="text-gray-600">
                      {guide.languages.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Availability</h3>
                    <p className="text-gray-600">{guide.availability}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-teal-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <a
                      href={`mailto:${guide.contactInfo.email}`}
                      className="text-teal-600 hover:text-teal-800"
                    >
                      {guide.contactInfo.email}
                    </a>
                  </div>
                </div>

                {guide.contactInfo.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-teal-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Phone</h3>
                      <a
                        href={`tel:${guide.contactInfo.phone}`}
                        className="text-teal-600 hover:text-teal-800"
                      >
                        {guide.contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tours */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Tours Offered
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {guide.tours.map((tour) => (
                  <div
                    key={tour.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTourId === tour.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-teal-300"
                    }`}
                    onClick={() => setSelectedTourId(tour.id)}
                  >
                    <h3 className="font-medium text-gray-900 mb-1">
                      {tour.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      {tour.duration}
                      <span className="mx-2">•</span>
                      <Users className="w-4 h-4 mr-1" />
                      Max {tour.maxGroupSize} people
                    </div>
                    <div className="text-teal-700 font-medium flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      {tour.price}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTour && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedTour.title}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {selectedTour.description}
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-2">
                        <div className="text-teal-600">
                          <Clock className="w-5 h-5 mx-auto mb-2" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Duration
                        </h4>
                        <p className="text-gray-600">{selectedTour.duration}</p>
                      </div>
                      <div className="p-2">
                        <div className="text-teal-600">
                          <Users className="w-5 h-5 mx-auto mb-2" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Group Size
                        </h4>
                        <p className="text-gray-600">
                          Up to {selectedTour.maxGroupSize} people
                        </p>
                      </div>
                      <div className="p-2">
                        <div className="text-teal-600">
                          <CreditCard className="w-5 h-5 mx-auto mb-2" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Price
                        </h4>
                        <p className="text-gray-700 font-semibold">
                          {selectedTour.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md transition-colors flex items-center justify-center"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book This Tour
                  </button>
                </div>
              )}
            </div>

            {/* Reviews section could be added here */}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && guide && (
        <BookingModal
          guide={guide}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TourGuideProfilePage;
