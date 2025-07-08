import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, Search } from "lucide-react";
import DestinationCard from "../components/destinations/DestinationCard";
import { useDestinations } from "../hooks/useDestinations";
// import IndonesiaMap from "../components/maps/IndonesiaMapLeaflet2.tsx";

const DestinationsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearchTerm, setLocalSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [showFilters, setShowFilters] = useState(false);

  // Initialize the hook with search from URL params
  const {
    filteredDestinations,
    categories,
    loading,
    error,
    selectedCategories,
    setSearchTerm,
    toggleCategory,
    clearFilters,
    total
  } = useDestinations({
    search: searchParams.get("search") || undefined,
    location: searchParams.get("location") || undefined
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchTerm.trim()) {
      setSearchParams({ search: localSearchTerm.trim() });
      setSearchTerm(localSearchTerm.trim());
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      setSearchParams(newParams);
      setSearchTerm("");
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setLocalSearchTerm("");
    setSearchParams({});
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {" "}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Where do you want to go today?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore the breathtaking beauty of the archipelago, from exotic
            enchanting beaches to ancient temples full of stories.
          </p>
          {/* Interactive Indonesia Map with all destinations
          <div className="mt-8 mb-10">
            <IndonesiaMap
              className="mb-4"
              destinations={destinations}
              filteredIds={filteredDestinations.map((d) => d.id)}
            />
          </div> */}
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
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  placeholder="Temukan destinasi impianmu..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
        {/* Filters section */}
        <div className="mb-8">
          {" "}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {loading ? "Memuat..." : `${total} Destinasi Wisata`}
            </h2>
            <button
              className="md:hidden flex items-center gap-2 text-teal-600 font-medium"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
            </button>
          </div>
          <div className={`md:block ${showFilters ? "block" : "hidden"}`}>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {" "}
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">Filter:</span>
                  {selectedCategories.length > 0 && (
                    <button
                      className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1"
                      onClick={handleClearFilters}
                    >
                      <X className="w-3 h-3" />
                      Hapus semua
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
        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Terjadi Kesalahan</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="text-lg">Memuat destinasi...</span>
            </div>
          </div>
        )}


        {/* Destinations grid */}
        {!loading && !error && filteredDestinations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && !error && filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">
              Maaf, destinasi yang Anda cari belum tersedia saat ini.
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Hapus filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationsListPage;
