import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, ThumbsUp, MapPin, Calendar } from "lucide-react";
import { Review } from "../../types";
import { destinations } from "../../data/destinations";

interface ReviewCardProps {
  review: Review;
  displayDestination?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  displayDestination = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Find destination details
  const destination = destinations.find(
    (dest) => dest.id === review.destinationId
  );

  // Format date
  const formattedDate = new Date(review.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <img
              src={review.userAvatar}
              alt={review.userName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">{review.userName}</h3>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formattedDate}
              </div>
            </div>
          </div>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {displayDestination && destination && (
          <Link
            to={`/destinations/${destination.id}`}
            className="inline-flex items-center mt-3 text-sm text-teal-600 hover:text-teal-700"
          >
            <MapPin className="w-4 h-4 mr-1" />
            {destination.name}, {destination.location}
          </Link>
        )}

        <h4 className="text-lg font-semibold mt-3 text-gray-800">
          {review.title}
        </h4>

        <div className="mt-2">
          <p
            className={`text-gray-700 leading-relaxed ${
              isExpanded ? "" : "line-clamp-3"
            }`}
          >
            {review.content}
          </p>
          {review.content.length > 180 && (
            <button
              onClick={toggleExpand}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium mt-1"
            >
              {isExpanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>

        {review.images.length > 0 && (
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openImageModal(index)}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {review.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            ))}
          </div>

          <button className="flex items-center text-gray-500 hover:text-teal-600 text-sm">
            <ThumbsUp className="w-4 h-4 mr-1" />
            Helpful ({review.helpfulCount})
          </button>
        </div>
      </div>

      {/* Image modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={review.images[currentImageIndex]}
              alt={`Review image ${currentImageIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
