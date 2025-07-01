import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, Search } from "lucide-react";
import { getAllTourGuides, TourGuideData } from "../services/tourGuideService";
import { TourGuide, TourGuideSpecialty } from "../types";
import TourGuideCard from "../components/tour-guides/TourGuideCard";

const TourGuidesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [allGuides, setAllGuides] = useState<TourGuide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<TourGuide[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<
    TourGuideSpecialty[]
  >([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const specialties: { label: string; value: TourGuideSpecialty }[] = [
    { label: "Adventure", value: "adventure" },
    { label: "Cultural", value: "cultural" },
    { label: "Historical", value: "historical" },
    { label: "Nature", value: "nature" },
    { label: "Culinary", value: "culinary" },
    { label: "Photography", value: "photography" },
    { label: "Diving", value: "diving" },
  ];

  // Fetch data dari Supabase saat mount
  useEffect(() => {
    setLoading(true);
    getAllTourGuides()
      .then((data) => {
        // Mapping ke tipe TourGuide
        const getDefaultProfileImage = (g: TourGuideData) => {
          const firstName = g.users?.first_name || "";
          const lastName = g.users?.last_name || "";
          const seed = firstName || lastName || "default";
          return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
        };
        const mapped = (data || [])
          .filter((g: TourGuideData) => g.is_verified)
          .map(
            (g: TourGuideData): TourGuide => ({
              id: String(g.id),
              name:
                `${g.users?.first_name || ""} ${g.users?.last_name || ""}`.trim() || "-",
              specialties: g.specialties
                ? (Object.keys(g.specialties) as TourGuideSpecialty[])
                : [],
              location: g.location,
              description: g.bio || g.short_bio || "",
              shortBio: g.short_bio || g.bio || "",
              imageUrl: g.users?.profile_picture || getDefaultProfileImage(g),
              languages: g.tour_guide_languages?.map((l) => l.language) || [],
              experience: g.experience || 0,
              rating: g.rating || 0,
              reviewCount: g.review_count || 0,
              contactInfo: {
                email: g.users?.email || "",
                phone: g.users?.phone || undefined,
              },
              availability: g.availability || "",
              tours: g.tours
                ? g.tours
                  .filter((tour) => tour.is_active)
                  .map((tour) => ({
                    id: String(tour.id),
                    title: tour.title,
                    description: tour.description,
                    duration: tour.duration,
                    price: `$${Number(tour.price).toFixed(2)}`,
                    maxGroupSize: tour.max_group_size,
                  }))
                : [],
              isVerified: g.is_verified,
              reviews: [], // Anda bisa fetch reviews jika ingin
            })
          );
        setAllGuides(mapped);
        setError(null);
      })
      .catch(() => setError("Failed to fetch tour guides from server."))
      .finally(() => setLoading(false));
  }, []);

  // Get unique locations dari hasil fetch Supabase
  const locations = Array.from(
    new Set(allGuides.map((guide) => guide.location))
  );

  // Filtering dan search
  useEffect(() => {
    const searchTerm =
      searchParams.get("search")?.toLowerCase() || searchQuery.toLowerCase();

    const filtered = allGuides.filter((guide) => {
      const matchesSearch = searchTerm
        ? guide.name.toLowerCase().includes(searchTerm) ||
        guide.location.toLowerCase().includes(searchTerm) ||
        guide.description.toLowerCase().includes(searchTerm) ||
        guide.languages.some((lang) =>
          lang.toLowerCase().includes(searchTerm)
        ) ||
        guide.tours.some((tour) =>
          tour.title.toLowerCase().includes(searchTerm)
        )
        : true;

      const matchesSpecialties =
        selectedSpecialties.length > 0
          ? selectedSpecialties.some((specialty) =>
            guide.specialties.includes(specialty)
          )
          : true;

      const matchesLocation = selectedLocation
        ? guide.location === selectedLocation
        : true;

      return matchesSearch && matchesSpecialties && matchesLocation;
    });

    setFilteredGuides(filtered);
  }, [
    allGuides,
    searchParams,
    selectedSpecialties,
    selectedLocation,
    searchQuery,
  ]);

  const toggleSpecialty = (specialty: TourGuideSpecialty) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedLocation("");
    setSearchQuery("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {" "}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Local Tour Guides
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with experienced local guides who can provide authentic
            experiences and insider knowledge of Indonesia
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified Guides
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Local Expertise
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Personalized Tours
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Top-Rated Experiences
            </span>
          </div>
        </div>
        {/* Search Bar */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for guides, locations, or specialties..."
              className="w-full px-4 py-3 pl-10 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            {searchQuery && (
              <button
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        {/* Filters section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {filteredGuides.length} Guide
              {filteredGuides.length !== 1 ? "s" : ""}
            </h2>
            <button
              className="md:hidden flex items-center gap-2 text-teal-600 font-medium"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          <div className={`md:block ${showFilters ? "block" : "hidden"}`}>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2">
                  {(selectedSpecialties.length > 0 || selectedLocation) && (
                    <button
                      className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1"
                      onClick={clearFilters}
                    >
                      <X className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-4 md:space-y-0 md:flex md:flex-wrap md:gap-4">
                  {/* Specialties filter */}
                  <div className="md:flex md:flex-wrap gap-2">
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty) => (
                        <button
                          key={specialty.value}
                          onClick={() => toggleSpecialty(specialty.value)}
                          className={`px-3 py-1.5 rounded-full text-sm ${selectedSpecialties.includes(specialty.value)
                            ? "bg-teal-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } transition-colors`}
                        >
                          {specialty.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location filter */}
                  <div className="md:flex md:items-center gap-2">
                    <span className="block md:inline text-sm text-gray-500 mb-2 md:mb-0">
                      Location:
                    </span>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">All locations</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tour guides grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <TourGuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">
              No guides found matching your criteria.
            </p>
            <button
              onClick={clearFilters}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourGuidesPage;
