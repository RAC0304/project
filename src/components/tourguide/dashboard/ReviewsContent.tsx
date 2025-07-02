import React, { useState, useEffect } from "react";
import {
  Star,
  TrendingUp,
  MessageSquare,
  Filter,
  Search,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import {
  getTourGuideReviews,
  getTourGuideReviewById,
  createOrUpdateTourGuideResponse,
  getTourGuideReviewsSimple,
  debugTourGuideReviews,
  TourGuideReview,
} from "../../../services/reviewService";

interface ReviewsContentProps {
  tourGuideId: string;
}

const ReviewsContent: React.FC<ReviewsContentProps> = ({ tourGuideId }) => {
  const [reviews, setReviews] = useState<TourGuideReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<TourGuideReview[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<
    "all" | "5" | "4" | "3" | "2" | "1"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<TourGuideReview | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for fetch
  const reviewsPerPage = 10;

  // Fetch reviews from backend (Supabase)
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        console.log('Starting to fetch reviews for tour guide:', tourGuideId);
        
        // First run debug to understand the data
        const debugResult = await debugTourGuideReviews(parseInt(tourGuideId));
        console.log('Debug result:', debugResult);
        
        // Try simple version first
        let reviewsData;
        try {
          reviewsData = await getTourGuideReviewsSimple(parseInt(tourGuideId));
          console.log('Simple query succeeded, got reviews:', reviewsData);
        } catch (simpleError) {
          console.log('Simple query failed, trying full query:', simpleError);
          reviewsData = await getTourGuideReviews(parseInt(tourGuideId));
        }
        
        setReviews(reviewsData);
        setFilteredReviews(reviewsData);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviews([]);
        setFilteredReviews([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (tourGuideId) {
      console.log('TourGuideId received:', tourGuideId, 'Type:', typeof tourGuideId, 'Parsed:', parseInt(tourGuideId));
      console.log('Starting fetch reviews for tour guide ID:', parseInt(tourGuideId));
      fetchReviews();
    } else {
      console.log('No tourGuideId provided');
      setLoading(false);
    }
  }, [tourGuideId]);

  // Filter reviews based on search and rating
  useEffect(() => {
    let filtered = reviews;

    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.tourName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (ratingFilter !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(ratingFilter)
      );
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [searchTerm, ratingFilter, reviews]);

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleViewDetails = async (review: TourGuideReview) => {
    // Fetch detail (with responses) from backend
    try {
      const detailedReview = await getTourGuideReviewById(parseInt(review.id));
      if (detailedReview) {
        setSelectedReview(detailedReview);
        setResponseText(detailedReview.response || "");
      } else {
        setSelectedReview(review);
        setResponseText(review.response || "");
      }
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch review details:", error);
      setSelectedReview(review);
      setResponseText(review.response || "");
      setIsDetailModalOpen(true);
    }
  };

  const handleSaveResponse = async () => {
    if (selectedReview && responseText.trim()) {
      try {
        await createOrUpdateTourGuideResponse(
          parseInt(selectedReview.id),
          parseInt(tourGuideId),
          responseText
        );
        setIsDetailModalOpen(false);
        // Refresh reviews after response
        try {
          const reviewsData = await getTourGuideReviewsSimple(parseInt(tourGuideId));
          setReviews(reviewsData);
          setFilteredReviews(reviewsData);
        } catch (refreshError) {
          console.log('Simple refresh failed, trying full query:', refreshError);
          const reviewsData = await getTourGuideReviewsSimple(parseInt(tourGuideId));
          setReviews(reviewsData);
          setFilteredReviews(reviewsData);
        }
      } catch (error) {
        console.error("Failed to save response:", error);
        alert("Failed to save response. Please try again.");
      }
    }
  };

  // Calculate stats
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const respondedReviews = reviews.filter((r) => r.response).length;
  const responseRate =
    reviews.length > 0 ? (respondedReviews / reviews.length) * 100 : 0;

  const renderStars = (rating: number, size: string = "w-4 h-4") => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Tampilkan loading spinner jika loading true
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500">Loading reviews...</span>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reviews & Ratings
        </h1>
        <p className="text-gray-600">
          Monitor and respond to customer feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Average Rating
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {averageRating.toFixed(1)}/5
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-xl font-semibold text-gray-900">
                {reviews.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Response Rate</p>
              <p className="text-xl font-semibold text-gray-900">
                {responseRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                5-Star Reviews
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {ratingDistribution[5]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rating Distribution
        </h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              ratingDistribution[rating as keyof typeof ratingDistribution];
            const percentage =
              reviews.length > 0 ? (count / reviews.length) * 100 : 0;

            return (
              <div key={rating} className="flex items-center">
                <div className="flex items-center w-20">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    {rating}
                  </span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(e.target.value as typeof ratingFilter)
                }
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="space-y-4 p-6">
          {currentReviews.length > 0 ? (
            currentReviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-teal-800">
                        {review.clientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {review.clientName}
                      </h3>
                      <div className="flex items-center mt-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(review.date)}
                        </span>
                        {review.verified && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetails(review)}
                    className="text-teal-600 hover:text-teal-900"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {review.title}
                  </h4>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {review.content}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{review.tourName}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>{review.helpful} helpful</span>
                    {review.response ? (
                      <span className="text-green-600">Responded</span>
                    ) : (
                      <span className="text-orange-600">Needs Response</span>
                    )}
                  </div>
                </div>

                {review.response && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        Your Response
                      </span>
                      <span className="ml-auto text-xs text-gray-500">
                        {formatDate(review.responseDate!)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.response}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No reviews found matching your criteria
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstReview + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastReview, filteredReviews.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredReviews.length}</span>{" "}
                  reviews
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? "z-10 bg-teal-50 border-teal-500 text-teal-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {isDetailModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Review Details
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-teal-800">
                    {selectedReview.clientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedReview.clientName}
                  </h3>
                  <div className="flex items-center mt-1">
                    {renderStars(selectedReview.rating, "w-5 h-5")}
                    <span className="ml-2 text-sm text-gray-500">
                      {formatDate(selectedReview.date)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Tour:</span>{" "}
                    {selectedReview.tourName}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Tour Date:</span>{" "}
                    {formatDate(selectedReview.tourDate)}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedReview.title}
                </h4>
                <p className="text-gray-700">{selectedReview.content}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a thoughtful response to this review..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResponse}
                disabled={!responseText.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedReview.response ? "Update Response" : "Save Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewsContent;
