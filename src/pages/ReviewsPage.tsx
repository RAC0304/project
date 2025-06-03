import React, { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Filter, X, Star, Search } from "lucide-react";
import { reviews } from "../data/reviews";
import { destinations } from "../data/destinations";
import { Review } from "../types";
import ReviewCard from "../components/reviews/ReviewCard";
import { useAuth } from "../contexts/AuthContext";

const ReviewsPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [searchParams] = useSearchParams();
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(reviews);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"destination" | "guide">(
    "destination"
  );

  // Redirect if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Extract unique tags from all reviews
  const allTags = Array.from(new Set(reviews.flatMap((review) => review.tags)));

  useEffect(() => {
    // Apply filters from URL if present
    const destParam = searchParams.get("destination");
    const ratingParam = searchParams.get("rating");
    const tagParam = searchParams.get("tag");

    if (destParam) setSelectedDestination(destParam);
    if (ratingParam) setSelectedRating(parseInt(ratingParam));
    if (tagParam) setSelectedTags([tagParam]);

    // Initial filtering
    applyFilters();
  }, [searchParams]);

  // Apply all filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [selectedDestination, selectedRating, selectedTags, searchQuery]);

  const applyFilters = () => {
    let result = [...reviews];

    // Filter by destination
    if (selectedDestination) {
      result = result.filter(
        (review) => review.destinationId === selectedDestination
      );
    }

    // Filter by rating
    if (selectedRating !== null) {
      result = result.filter((review) => review.rating >= selectedRating);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter((review) =>
        selectedTags.some((tag) => review.tags.includes(tag))
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (review) =>
          review.title.toLowerCase().includes(query) ||
          review.content.toLowerCase().includes(query) ||
          review.userName.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setFilteredReviews(result);
  };

  const toggleTagFilter = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSelectedDestination("");
    setSelectedRating(null);
    setSelectedTags([]);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedDestination ||
    selectedRating !== null ||
    selectedTags.length > 0 ||
    searchQuery;

  return (
    <div className="pt-16 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {viewType === "destination"
              ? "Destination Reviews"
              : "Tour Guide Reviews"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Authentic experiences shared by our community of travelers across
            Indonesia
          </p>
        </div>

        {/* View type selector */}
        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={() => setViewType("destination")}
            className={`px-6 py-2 rounded-full ${
              viewType === "destination"
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Destination Reviews
          </button>
          <button
            onClick={() => setViewType("guide")}
            className={`px-6 py-2 rounded-full ${
              viewType === "guide"
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tour Guide Reviews
          </button>
        </div>

        {/* Search and filter bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <button
              className="flex items-center justify-center px-4 py-2 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-teal-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {(selectedDestination ? 1 : 0) +
                    (selectedRating !== null ? 1 : 0) +
                    selectedTags.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter options */}
          {showFilters && (
            <div className="mt-4 p-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Destination filter */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Destination
                  </h3>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                  >
                    <option value="">All Destinations</option>
                    {destinations.map((destination) => (
                      <option key={destination.id} value={destination.id}>
                        {destination.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating filter */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Rating</h3>
                  <div className="flex space-x-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        className={`px-3 py-1 rounded-full ${
                          selectedRating === rating
                            ? "bg-teal-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          setSelectedRating(
                            selectedRating === rating ? null : rating
                          )
                        }
                      >
                        {rating}+ <Star className="w-3 h-3 inline" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags filter */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedTags.includes(tag)
                            ? "bg-teal-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => toggleTagFilter(tag)}
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center text-sm text-teal-600 hover:text-teal-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reviews list */}
        <div className="space-y-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">😕</div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search query to find what you're
                looking for.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* User reviews CTA */}
        <div className="mt-16 bg-teal-900 text-white rounded-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Share Your Travel Story
              </h2>
              <p className="text-white/90 mb-6">
                Just returned from an amazing adventure in Indonesia? Share your
                experience with fellow travelers and help others plan their
                perfect trip.
              </p>
              <button className="bg-white text-teal-800 hover:bg-teal-50 px-6 py-3 rounded-full font-medium transition-colors inline-flex items-center justify-center w-full md:w-auto">
                Write a Review
              </button>
            </div>
            <div className="md:w-1/2 relative">
              <img
                src="https://images.unsplash.com/photo-1464207687429-7505649dae38"
                alt="Share your travel experience"
                className="w-full h-full object-cover"
                style={{ minHeight: "300px" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-transparent md:bg-gradient-to-l md:from-transparent md:to-teal-900/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
