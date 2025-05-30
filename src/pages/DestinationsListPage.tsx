import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, Search } from "lucide-react";
import { destinations } from "../data/destinations";
import { Destination, DestinationCategory } from "../types";
import DestinationCard from "../components/destinations/DestinationCard";
import IndonesiaMap from "../components/maps/IndonesiaMapLeaflet";

const DestinationsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [filteredDestinations, setFilteredDestinations] =
    useState<Destination[]>(destinations);
  const [selectedCategories, setSelectedCategories] = useState<
    DestinationCategory[]
  >([]);
  const [showFilters, setShowFilters] = useState(false);

  const categories: { label: string; value: DestinationCategory }[] = [
    { label: "Beaches", value: "beach" },
    { label: "Mountains", value: "mountain" },
    { label: "Cultural", value: "cultural" },
    { label: "Adventure", value: "adventure" },
    { label: "Historical", value: "historical" },
    { label: "Nature", value: "nature" },
    { label: "Cities", value: "city" },
  ];

  useEffect(() => {
    const currentSearchTerm = searchParams.get("search")?.toLowerCase() || "";

    const filtered = destinations.filter((destination) => {
      const matchesSearch = currentSearchTerm
        ? destination.name.toLowerCase().includes(currentSearchTerm) ||
        destination.location.toLowerCase().includes(currentSearchTerm) ||
        destination.description.toLowerCase().includes(currentSearchTerm)
        : true;

      const matchesCategories =
        selectedCategories.length > 0
          ? selectedCategories.some((cat) => destination.category.includes(cat))
          : true;

      return matchesSearch && matchesCategories;
    });

    setFilteredDestinations(filtered);
  }, [searchParams, selectedCategories]);

  const toggleCategory = (category: DestinationCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm("");
    setSearchParams({});
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ search: searchTerm.trim() });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      setSearchParams(newParams);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">        <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Explore Indonesia
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover the diverse destinations across the Indonesian archipelago,
          from pristine beaches to ancient temples
        </p>

        {/* Interactive Indonesia Map */}
        <div className="mt-8 mb-10">
          <IndonesiaMap className="mb-4" />
        </div>

        {/* Search input */}
        <div className="max-w-lg mx-auto mt-8">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search destinations..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>

        {/* Filters section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {filteredDestinations.length} Destination
              {filteredDestinations.length !== 1 ? "s" : ""}
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
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">Filter by:</span>
                  {selectedCategories.length > 0 && (
                    <button
                      className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1"
                      onClick={clearFilters}
                    >
                      <X className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => toggleCategory(category.value)}
                      className={`px-3 py-1.5 rounded-full text-sm ${selectedCategories.includes(category.value)
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } transition-colors`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Destinations grid */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">
              No destinations found matching your criteria.
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

export default DestinationsListPage;
