import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  MapPin,
  Calendar,
  Info,
  Search,
  ArrowRight,
} from "lucide-react";
import { getRandomDestinations } from "../services/destinationService";
import { itineraries } from "../data/itineraries";
import { culturalInsights } from "../data/culturalInsights";
import DestinationCard from "../components/destinations/DestinationCard";
import ItineraryCard from "../components/itineraries/ItineraryCard";
import CulturalInsightCard from "../components/culture/CulturalInsightCard";
import IndonesiaMap from "../components/maps/IndonesiaMapLeaflet";
import SearchForm from "../components/common/SearchForm";
import { useEnhancedAuth } from "../contexts/useEnhancedAuth";
import { CulturalInsight, Destination } from "../types";

const HomePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [popularDestinations, setPopularDestinations] = useState<Destination[]>(
    []
  );
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const { user } = useEnhancedAuth();
  const navigate = useNavigate();
  // State untuk menyimpan insight yang dipilih untuk ditampilkan di popup
  const [selectedInsight, setSelectedInsight] =
    useState<CulturalInsight | null>(null);

  // Fungsi untuk menangani klik pada tombol Read More
  const handleReadMore = (insight: CulturalInsight) => {
    // Langsung tampilkan popup insight tanpa navigasi
    setSelectedInsight(insight);
  };

  useEffect(() => {
    // Load random destinations
    const loadDestinations = async () => {
      try {
        setIsLoadingDestinations(true);
        const randomDestinations = await getRandomDestinations(4);
        setPopularDestinations(randomDestinations);
      } catch (error) {
        console.error("Error loading destinations:", error);
      } finally {
        setIsLoadingDestinations(false);
      }
    };

    loadDestinations();
  }, []);

  useEffect(() => {
    // Proteksi akses: hanya customer yang boleh
    if (user && user.role !== "customer") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Delay to ensure animation works after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const featuredItineraries = itineraries.slice(0, 2);
  const featuredInsights = culturalInsights.slice(0, 3);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0 bg-black">
          <img
            src="https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg"
            alt="Bali Temple"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div
            className={`max-w-3xl transition-all duration-1000 transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Discover the Magic of{" "}
              <span className="text-teal-400">Indonesia</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Explore ancient temples, pristine beaches, vibrant cultures, and
              breathtaking landscapes across the archipelago.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/destinations"
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Explore Destinations
              </Link>
              <Link
                to="/itineraries"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 backdrop-blur-sm transition-colors"
              >
                <Calendar className="w-5 h-5" />
                View Itineraries
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-20" />
      </section>
      {/* Search Section */}
      <section className="container mx-auto px-4 -mt-20 relative z-10 mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <SearchForm />
        </div>
      </section>
      {/* Featured Destinations */}
      <section className="container mx-auto px-4 py-12" id="explore">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Popular Destinations
            </h2>
            <p className="text-gray-600 mt-2">
              Explore Indonesia's most beloved locations
            </p>
          </div>
          <Link
            to="/destinations"
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            View all
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingDestinations ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 animate-pulse rounded-lg h-64"
              >
                <div className="h-40 bg-gray-300 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : popularDestinations.length > 0 ? (
            popularDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                No destinations available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>{" "}
      {/* Explore Categories */}
      <section className="py-16 bg-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              Explore Indonesia
            </h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Discover destinations across the Indonesian archipelago
            </p>
          </div>

          {/* Indonesia Map */}
          <div className="mb-12">
            <IndonesiaMap className="mb-8" />
          </div>

          {/* <div className="flex flex-wrap gap-4 justify-center">
            {Array.from(new Set(destinations.flatMap((d) => d.category))).map(
              (category) => (
                <Link
                  key={category}
                  to={`/destinations?category=${category}`}
                  className="px-6 py-3 bg-white shadow-md hover:shadow-lg rounded-full text-teal-800 font-medium transition-all"
                >
                  {category}
                </Link>
              )
            )}
          </div> */}
        </div>
      </section>
      {/* Featured Itineraries */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Curated Itineraries
            </h2>
            <p className="text-gray-600 mt-2">
              Perfectly planned journeys for unforgettable experiences
            </p>
          </div>
          <Link
            to="/itineraries"
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            View all
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredItineraries.map((itinerary) => (
            <ItineraryCard key={itinerary.id} itinerary={itinerary} />
          ))}
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="bg-teal-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Explore with WanderWise</h2>
            <p className="mt-2 text-teal-100 max-w-2xl mx-auto">
              Your trusted companion for discovering Indonesia's hidden
              treasures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-teal-800/50 p-6 rounded-lg">
              <div className="bg-teal-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-teal-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Expertise</h3>
              <p className="text-teal-100">
                In-depth knowledge from locals who know Indonesia's best-kept
                secrets
              </p>
            </div>

            <div className="bg-teal-800/50 p-6 rounded-lg">
              <div className="bg-teal-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-teal-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Customized Itineraries
              </h3>
              <p className="text-teal-100">
                Tailored travel plans to match your interests, time frame, and
                budget
              </p>
            </div>

            <div className="bg-teal-800/50 p-6 rounded-lg">
              <div className="bg-teal-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Info className="w-7 h-7 text-teal-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cultural Insights</h3>
              <p className="text-teal-100">
                Authentic experiences that connect you with local traditions and
                communities
              </p>
            </div>

            <div className="bg-teal-800/50 p-6 rounded-lg">
              <div className="bg-teal-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-teal-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Off-the-beaten-path
              </h3>
              <p className="text-teal-100">
                Discover hidden gems beyond the typical tourist attractions
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Cultural Insights */}
      <section className="container mx-auto px-4 py-16" id="culture">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Cultural Insights
            </h2>
            <p className="text-gray-600 mt-2">
              Discover the rich traditions and heritage of Indonesia
            </p>
          </div>
          <Link
            to="/about#culture"
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            View all
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredInsights.map((insight) => (
            <CulturalInsightCard
              key={insight.id}
              insight={insight}
              onReadMore={handleReadMore}
            />
          ))}
        </div>
      </section>
      {/* CTA Section */}
      <section className="relative py-20 mb-20">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg"
            alt="Indonesia landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-teal-900/70" />
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Indonesian Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            From pristine beaches to ancient temples, vibrant cities to lush
            jungles, your perfect journey awaits.
          </p>
          <Link
            to="/destinations"
            className="inline-flex items-center bg-white text-teal-800 px-8 py-4 rounded-full font-medium hover:bg-teal-50 transition-colors"
          >
            Plan Your Trip Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
      {/* Fullscreen Popup for Cultural Insight */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-lg relative">
              <div className="h-80 sm:h-96 overflow-hidden relative">
                <img
                  src={selectedInsight.imageUrl}
                  alt={selectedInsight.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedInsight.title}
                  </h2>
                  <span className="inline-block px-3 py-1 bg-teal-500 bg-opacity-70 text-white text-sm rounded-full capitalize">
                    {selectedInsight.category}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {selectedInsight.content}
                  </p>
                </div>

                <div className="mt-10 border-t border-gray-200 pt-6 flex justify-center">
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
