import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, Search } from "lucide-react";
import { tourGuides } from "../data/tourGuides";
import { TourGuide, TourGuideSpecialty } from "../types";
import TourGuideCard from "../components/tour-guides/TourGuideCard";

const TourGuidesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [filteredGuides, setFilteredGuides] = useState<TourGuide[]>(tourGuides);
  const [selectedSpecialties, setSelectedSpecialties] = useState<
    TourGuideSpecialty[]
  >([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const specialties: { label: string; value: TourGuideSpecialty }[] = [
    { label: "Adventure", value: "adventure" },
    { label: "Cultural", value: "cultural" },
    { label: "Historical", value: "historical" },
    { label: "Nature", value: "nature" },
    { label: "Culinary", value: "culinary" },
    { label: "Photography", value: "photography" },
    { label: "Diving", value: "diving" },
  ];

  // Get unique locations from tour guides data
  const locations = Array.from(
    new Set(tourGuides.map((guide) => guide.location))
  );

  useEffect(() => {
    const searchTerm =
      searchParams.get("search")?.toLowerCase() || searchQuery.toLowerCase();

    const filtered = tourGuides.filter((guide) => {
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
  }, [searchParams, selectedSpecialties, selectedLocation, searchQuery]);

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
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Local Tour Guides
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with experienced local guides who can provide authentic
            experiences and insider knowledge of Indonesia
          </p>
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
                  <span className="text-gray-700 font-medium">Filter by:</span>
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
                    <span className="block md:inline text-sm text-gray-500 mb-2 md:mb-0">
                      Specialty:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty) => (
                        <button
                          key={specialty.value}
                          onClick={() => toggleSpecialty(specialty.value)}
                          className={`px-3 py-1.5 rounded-full text-sm ${
                            selectedSpecialties.includes(specialty.value)
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
        {filteredGuides.length > 0 ? (
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
