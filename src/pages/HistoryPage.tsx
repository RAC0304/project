import { useState } from "react";
import { Star } from "lucide-react";
import femalePhoto from "../asset/image/female.jpg";
import { DEFAULT_AVATAR } from "../asset/image/defaultAvatar";

interface TourGuide {
  id: number;
  name: string;
  location: string;
  date: string;
  duration: string;
  photo: string;
}

const trips: TourGuide[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Bali, Indonesia",
    date: "April 2025",
    duration: "April 1, 2025 - April 7, 2025",
    photo: femalePhoto,
  },
  {
    id: 2,
    name: "Jane Smith",
    location: "Yogyakarta, Indonesia",
    date: "February 2025",
    duration: "February 10, 2025 - February 15, 2025",
    photo: femalePhoto,
  },
];

const HistoryPage: React.FC = () => {
  const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [notification, setNotification] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const satisfactionIcons = [
    { label: "Sad", emoji: "😞" },
    { label: "Neutral", emoji: "😐" },
    { label: "Happy", emoji: "😊" },
  ];

  const handleSelectGuide = (guide: TourGuide) => {
    setSelectedGuide(guide);
    setReviewText("");
    setRating(null);
    setSelectedIcon(null);
    setNotification("");
  };

  const handleSubmitReview = () => {
    if (reviewText.trim()) {
      setNotification("Review submitted!");
      setTimeout(() => {
        setNotification("");
        setSelectedGuide(null);
      }, 3000);
    } else {
      setNotification("Please enter a review before submitting.");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleRatingClick = (num: number) => {
    if (reviewText.trim()) {
      setRating(num);
    }
  };

  const handleSatisfactionClick = (emoji: string) => {
    if (reviewText.trim()) {
      setSelectedIcon(emoji);
    }
  };

  return (
    <div className="w-full px-6 md:px-12 lg:px-20 xl:px-32">
      <div className="text-center mt-12 mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Travel History
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Relive your past adventures and explore the details of your travel
          history with ease.
        </p>
      </div>
      <div className="space-y-4 mb-16">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="p-4 border rounded-lg shadow-sm bg-white flex items-center justify-between w-full"
          >
            {" "}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 relative group">
                <img
                  src={trip.photo}
                  alt={trip.name}
                  className="w-full h-full rounded-full object-cover drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-teal-500/10 pointer-events-none"></div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {trip.name}
                </h2>
                <p className="text-sm text-gray-500">{trip.location}</p>
                <p className="text-sm text-gray-500">{trip.duration}</p>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition"
              onClick={() => handleSelectGuide(trip)}
            >
              Write Review
            </button>
          </div>
        ))}
      </div>{" "}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-xl mx-4 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 relative group mr-4">
                <img
                  src={selectedGuide.photo}
                  alt={selectedGuide.name}
                  className="w-full h-full rounded-full object-cover drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-teal-500/10 pointer-events-none"></div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Review for {selectedGuide.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedGuide.location}
                </p>
              </div>
            </div>
            <textarea
              className="w-full p-2 border rounded-md mb-3"
              placeholder="Share your experience..."
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <div className="mb-3">
              <p className="mb-1 font-medium">Rating:</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={num}
                    size={24}
                    className={`cursor-pointer transition-colors ${
                      reviewText.trim()
                        ? num <= (rating ?? 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                        : "text-gray-200 cursor-not-allowed"
                    }`}
                    onClick={() => handleRatingClick(num)}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="mb-1 font-medium">Satisfaction:</p>
              <div className="flex space-x-4 text-2xl">
                {satisfactionIcons.map((icon, idx) => (
                  <span
                    key={idx}
                    className={`cursor-pointer p-2 rounded-full transition ${
                      reviewText.trim()
                        ? selectedIcon === icon.emoji
                          ? "bg-gray-300"
                          : "hover:bg-gray-100"
                        : "opacity-30 cursor-not-allowed"
                    }`}
                    onClick={() => handleSatisfactionClick(icon.emoji)}
                  >
                    {icon.emoji}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setSelectedGuide(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                onClick={handleSubmitReview}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
      {notification && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white px-8 py-5 rounded-lg shadow-md text-center max-w-xs">
            <p className="text-lg font-semibold text-green-600">
              {notification}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
