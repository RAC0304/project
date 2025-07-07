import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Users,
  CreditCard,
  MapPin,
  Star,
  Info,
  CheckCircle,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { TourGuide } from "../../types";
import { createBooking } from "../../services/bookingService";
import { useEnhancedAuth } from "../../contexts/useEnhancedAuth";

interface BookingModalProps {
  guide: TourGuide;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ guide, onClose }) => {
  const { user } = useEnhancedAuth();
  const [selectedTour, setSelectedTour] = useState(guide.tours[0]?.id || "");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [status] = useState("pending");
  const [paymentStatus] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user data when modal opens
  useEffect(() => {
    if (user) {
      setName(
        `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim()
      );
      setEmail(user.email || "");
      setPhone(user.profile.phone || "");
    }
    // Set default tour if available
    if (guide.tours && guide.tours.length > 0) {
      setSelectedTour(guide.tours[0].id);
    }
  }, [guide.tours, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (!user) throw new Error("User not authenticated");
      const selectedTourDetails = guide.tours.find(
        (tour) => tour.id === selectedTour
      );
      if (!selectedTourDetails) {
        throw new Error("Selected tour not found");
      }
      // Calculate total amount
      const pricePerPerson = parseFloat(
        selectedTourDetails.price.replace(/[^0-9.]/g, "")
      );
      const totalAmount = pricePerPerson * participants;
      const bookingData = {
        tourId: parseInt(selectedTour),
        userId: Number(user.id),
        date,
        participants,
        status,
        specialRequests: specialRequests || undefined,
        totalAmount,
        paymentStatus,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
      };
      await createBooking(bookingData);
      setIsSuccess(true);
      // Close modal after 3 seconds of showing success message
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Booking error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create booking"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTourDetails = guide.tours.find(
    (tour) => tour.id === selectedTour
  );

  // Calculate expected total
  const calculateTotal = () => {
    if (!selectedTourDetails) return "$0.00";
    const pricePerPerson = parseFloat(
      selectedTourDetails.price.replace(/[^0-9.]/g, "")
    );
    return `$${(pricePerPerson * participants).toFixed(2)}`;
  };

  // Check if there are active tours
  const hasActiveTours = guide.tours && guide.tours.length > 0;

  // Show error if no tours available
  if (!hasActiveTours) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              No Tours Available
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            This tour guide doesn't have any tours available for booking at the
            moment.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header dengan gambar background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent rounded-t-xl z-10"></div>
          <img
            src={guide.imageUrl}
            alt={guide.name}
            className="w-full h-36 object-cover rounded-t-xl"
          />
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">
              {isSuccess ? "Booking Confirmed" : "Book a Tour"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none bg-black/30 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Guide info bar */}
        <div className="bg-gray-50 px-6 py-3 flex items-center border-b border-gray-200">
          <img
            src={guide.imageUrl}
            alt={guide.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
          />
          <div className="ml-3">
            <p className="font-medium text-gray-800">{guide.name}</p>
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{guide.location}</span>
              <span className="mx-1">•</span>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
              <span>
                {guide.rating} ({guide.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-50 shadow-inner">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Successful!
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Thank you for your booking. A confirmation has been sent to your
              email.
              <span className="block mt-2 font-medium">
                {guide.name} will contact you soon to confirm the details.
              </span>
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 mx-auto max-w-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
              <p className="text-lg font-mono font-bold">{`WW-${Date.now()
                .toString()
                .substr(-6)}`}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md transition-colors font-semibold shadow-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-md p-4 animate-pulse">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Booking Error
                    </h3>
                    <div className="mt-1 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tour Selection and Details */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                Tour Details
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Tour
                </label>
                <select
                  value={selectedTour}
                  onChange={(e) => setSelectedTour(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white"
                  required
                >
                  {guide.tours.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.title} - {tour.duration} - {tour.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display selected tour information */}
              {selectedTourDetails && (
                <div className="mt-3 p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                  <h4 className="font-medium text-sm text-teal-700 mb-2">
                    {selectedTourDetails.title}
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 inline text-gray-500" />
                      Duration:{" "}
                      <span className="font-medium ml-1">
                        {selectedTourDetails.duration}
                      </span>
                    </p>
                    <p className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1 inline text-gray-500" />
                      Price per person:{" "}
                      <span className="font-medium ml-1">
                        {selectedTourDetails.price}
                      </span>
                    </p>
                  </div>
                  {selectedTourDetails.description && (
                    <p className="text-xs text-gray-600 mt-2 border-t border-gray-100 pt-2">
                      {selectedTourDetails.description.substring(0, 120)}
                      {selectedTourDetails.description.length > 120
                        ? "..."
                        : ""}
                    </p>
                  )}
                </div>
              )}

              {/* user_id (hidden) */}
              <input type="hidden" value={user?.id || ""} name="user_id" />

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline-block mr-1" /> Tour Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                {/* participants */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-4 h-4 inline-block mr-1" /> Participants
                  </label>
                  <input
                    type="number"
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    min={1}
                    max={selectedTourDetails?.maxGroupSize || 10}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2 text-teal-600" />
                Contact Information
              </h3>
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
              <div className="mt-3">
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
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="Any dietary restrictions, accessibility requirements, or special requests..."
              />
            </div>

            {/* Payment Section */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-yellow-600" />
                Payment Summary
              </h3>

              <div className="flex justify-between items-center text-sm mb-2">
                <span>Tour price:</span>
                <span>{selectedTourDetails?.price || "$0"} per person</span>
              </div>

              <div className="flex justify-between items-center text-sm mb-2">
                <span>Number of participants:</span>
                <span>{participants}</span>
              </div>

              <div className="border-t border-yellow-200 my-2 pt-2"></div>

              <div className="flex justify-between items-center font-medium">
                <span>Total amount:</span>
                <span className="text-lg">{calculateTotal()}</span>
              </div>

              <p className="mt-3 text-xs text-gray-600 flex items-start">
                <Info className="w-4 h-4 mr-1 text-yellow-600 flex-shrink-0 mt-0.5" />
                Payment will be collected after booking confirmation. We accept
                credit cards, PayPal, and bank transfers.
              </p>
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
                className="flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Book Now
                  </>
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
