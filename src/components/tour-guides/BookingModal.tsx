import React, { useState } from "react";
import { X, Calendar, Clock, Users, CreditCard } from "lucide-react";
import { TourGuide } from "../../types";

interface BookingModalProps {
  guide: TourGuide;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ guide, onClose }) => {
  const [selectedTour, setSelectedTour] = useState(guide.tours[0]?.id || "");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Reset form after 3 seconds of showing success message
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 1500);
  };

  const selectedTourDetails = guide.tours.find(
    (tour) => tour.id === selectedTour
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isSuccess ? "Booking Confirmed" : "Book a Tour with " + guide.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Thank you for your booking!
            </h3>
            <p className="text-gray-600 mb-6">
              A confirmation has been sent to your email. {guide.name} will
              contact you soon to confirm the details.
            </p>
            <button
              onClick={onClose}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <img
                src={guide.imageUrl}
                alt={guide.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-900">{guide.name}</h3>
                <p className="text-sm text-gray-500">
                  {guide.location} • {guide.experience} years experience
                </p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(guide.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm text-gray-500">
                    ({guide.reviewCount})
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Tour
              </label>
              <select
                value={selectedTour}
                onChange={(e) => setSelectedTour(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              >
                {guide.tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.title} - {tour.duration} - {tour.price}
                  </option>
                ))}
              </select>
            </div>

            {selectedTourDetails && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedTourDetails.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedTourDetails.description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedTourDetails.duration}
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="w-4 h-4 mr-1" />
                    Max {selectedTourDetails.maxGroupSize} people
                  </div>
                  <div className="flex items-center font-medium text-teal-700">
                    <CreditCard className="w-4 h-4 mr-1" />
                    {selectedTourDetails.price}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Participants
                </label>
                <input
                  type="number"
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  min={1}
                  max={selectedTourDetails?.maxGroupSize || 10}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Book Now"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
