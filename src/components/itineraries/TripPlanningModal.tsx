import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Users,
  MessageSquare,
  MapPin,
  Star,
  Check,
  AlertCircle,
} from "lucide-react";
import { Itinerary } from "../../types";
// import { tourGuides } from "../../data/tourGuides";
import { useEnhancedAuth } from "../../contexts/useEnhancedAuth";
import { createItineraryRequest } from "../../services/itineraryBookingService";
import { BOOKING_CONFIG, BookingUtils } from "../../config/bookingConfig";

interface TripPlanningModalProps {
  itinerary: Itinerary;
  onClose: () => void;
}

const TripPlanningModal: React.FC<TripPlanningModalProps> = ({
  itinerary,
  onClose,
}) => {
  const { user, isLoggedIn } = useEnhancedAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    startDate: "",
    endDate: "",
    groupSize: "2",
    additionalRequests: "",
    selectedGuideId: "", // New field for selected guide
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill form data if user is logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: user.profile?.firstName && user.profile?.lastName
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user.username || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
      }));
    }
  }, [isLoggedIn, user]);

  // Use tour guides from itinerary if available (from backend relation)
  // Map image_url (snake_case) to imageUrl (camelCase) if needed
  // @ts-ignore: allow dynamic property for backward compatibility
  const matchingGuides = ((itinerary as any).tourGuides || []).map((guide: any) => {
    const imageUrl =
      guide.imageUrl ||
      guide.profile_picture ||
      (guide.users && guide.users.profile_picture) ||
      guide.image_url ||
      '';
    console.log('Guide:', guide.name, 'imageUrl:', imageUrl, 'profile_picture:', guide.profile_picture, 'users.profile_picture:', guide.users?.profile_picture);
    return {
      ...guide,
      imageUrl,
    };
  });

  // Calculate min date (today + minimum advance booking days)
  const minDate = BOOKING_CONFIG.DATE.MIN_DATE();
  const maxDate = BOOKING_CONFIG.DATE.MAX_DATE();

  // Extract the duration number from the itinerary duration string (e.g., "7 days" -> 7)
  const getDurationDays = () => {
    return BookingUtils.parseDurationDays(itinerary.duration);
  };

  // Parse group size from string (handle ranges like "3-4" or "7+")
  const parseGroupSize = (groupSize: string): number => {
    return BookingUtils.parseGroupSize(groupSize);
  };

  // Calculate estimated price based on duration and group size
  const calculateEstimatedPrice = () => {
    const hasGuide = formData.selectedGuideId !== "";
    return BookingUtils.calculatePrice(itinerary.duration, formData.groupSize, hasGuide);
  };

  // Calculate default end date based on itinerary duration
  const calculateEndDate = (startDate: string) => {
    if (!startDate) return "";
    const date = new Date(startDate);
    const durationDays = getDurationDays();
    date.setDate(date.getDate() + (durationDays - 1)); // Subtract 1 because the start date counts as day 1
    return date.toISOString().split("T")[0];
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for start date to auto-suggest end date
    if (name === "startDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endDate: calculateEndDate(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const selectGuide = (guideId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGuideId: prev.selectedGuideId === guideId ? "" : guideId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Check if user is logged in
      if (!isLoggedIn || !user) {
        setError("Please log in to book an itinerary");
        setIsSubmitting(false);
        return;
      }

      // Validate form data using config
      const validation = BookingUtils.validateBookingForm(formData);
      if (!validation.isValid) {
        setError(validation.errors.join('. '));
        setIsSubmitting(false);
        return;
      }

      // Prepare request data
      const requestData = {
        user_id: user.id,
        itinerary_id: itinerary.id,
        tour_guide_id: formData.selectedGuideId || undefined,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        start_date: formData.startDate,
        end_date: formData.endDate,
        group_size: formData.groupSize,
        additional_requests: formData.additionalRequests.trim() || undefined,
      };

      console.log('Submitting itinerary request:', requestData);

      // Create the itinerary request
      const result = await createItineraryRequest(requestData);
      console.log('Itinerary request created:', result);

      setIsSuccess(true);

      // Close modal after showing success message
      setTimeout(() => {
        onClose();
      }, BOOKING_CONFIG.UI.SUCCESS_MODAL_AUTO_CLOSE);

    } catch (err) {
      console.error('Error creating itinerary request:', err);

      // Handle different types of errors
      if (err instanceof Error) {
        if (err.message.includes('Permission denied') || err.message.includes('42501')) {
          setError('Permission denied. This may be due to database security settings. Please contact support or try again later.');
        } else if (err.message.includes('network')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again or contact support.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format dates for display
  const formatDateRange = () => {
    if (formData.startDate && formData.endDate) {
      return `${BookingUtils.formatDate(formData.startDate)} - ${BookingUtils.formatDate(formData.endDate)}`;
    }
    return "";
  };

  // Find the selected guide details
  const selectedGuide = matchingGuides.find(
    (guide: any) => guide.id === formData.selectedGuideId
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isSuccess ? "Request Sent!" : `Plan Your ${itinerary.title} Trip`}
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
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Thank you for your interest!
            </h3>
            <p className="text-gray-600 mb-3">
              We've received your request for the {itinerary.title} itinerary
              during {formatDateRange()}.
            </p>
            {selectedGuide && (
              <p className="text-gray-600 mb-6">
                Your request with tour guide {selectedGuide.name} has been
                received. They will contact you shortly to discuss your trip
                details.
              </p>
            )}
            {!selectedGuide && (
              <p className="text-gray-600 mb-6">
                Our travel experts will review your requirements and get back to
                you within 24 hours.
              </p>
            )}
            <button
              onClick={onClose}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Authentication Warning */}
            {!isLoggedIn && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-yellow-800 text-sm">
                  Please log in to submit a booking request.
                </p>
              </div>
            )}

            <div className="p-4 bg-teal-50 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {itinerary.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {itinerary.duration} • {itinerary.difficulty} difficulty
              </p>
              <div className="flex flex-wrap gap-2">
                {itinerary.destinations.map((destination) => (
                  <span
                    key={destination}
                    className="px-3 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                  >
                    {destination}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number (optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Travel Dates
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute top-[11px] left-0 pl-3 pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <label htmlFor="startDate" className="sr-only">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    min={minDate}
                    max={maxDate}
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                  <span className="block text-xs text-gray-500 mt-1">
                    Start date
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute top-[11px] left-0 pl-3 pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <label htmlFor="endDate" className="sr-only">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    min={formData.startDate || minDate}
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    disabled={true}
                    className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 focus:outline-none"
                  />
                  <span className="block text-xs text-gray-500 mt-1">
                    End date (set to {itinerary.duration} from start)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="groupSize"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Number of Travelers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  id="groupSize"
                  name="groupSize"
                  required
                  value={formData.groupSize}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                >
                  {BOOKING_CONFIG.GROUP_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tour Guide Selection */}
            {matchingGuides.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select a Tour Guide (Optional)
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  These guides specialize in destinations in your itinerary:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchingGuides.map((guide: any) => (
                    <div
                      key={guide.id}
                      onClick={() => selectGuide(guide.id)}
                      className={`border rounded-lg p-3 cursor-pointer flex items-start space-x-3 transition-colors ${formData.selectedGuideId === guide.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-teal-300"
                        }`}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={guide.imageUrl || "/default-avatar.png"}
                          alt={guide.name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/default-avatar.png";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">
                            {guide.name}
                          </h4>
                          {formData.selectedGuideId === guide.id && (
                            <div className="bg-teal-500 text-white p-1 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-0.5 mb-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{guide.location}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(guide.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">
                            ({guide.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Estimation */}
            {formData.startDate && formData.endDate && formData.groupSize && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Estimated Price
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Base price ({getDurationDays()} days × {formData.groupSize} travelers)</span>
                    <span>{BookingUtils.formatPrice(BOOKING_CONFIG.PRICING.BASE_PRICE_PER_DAY * getDurationDays() * parseGroupSize(formData.groupSize))}</span>
                  </div>
                  {formData.selectedGuideId && (
                    <div className="flex justify-between">
                      <span>Tour guide ({getDurationDays()} days)</span>
                      <span>{BookingUtils.formatPrice(BOOKING_CONFIG.PRICING.GUIDE_SURCHARGE_PER_DAY * getDurationDays())}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Estimated Cost</span>
                      <span>{BookingUtils.formatPrice(calculateEstimatedPrice())}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * This is an estimated price. Final pricing will be confirmed after consultation.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="additionalRequests"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Special Requests or Requirements
              </label>
              <textarea
                id="additionalRequests"
                name="additionalRequests"
                rows={3}
                maxLength={BOOKING_CONFIG.FORM.MAX_SPECIAL_REQUESTS_LENGTH}
                placeholder="Tell us about any special requirements, customizations, or questions you have..."
                value={formData.additionalRequests}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isLoggedIn}
                className={`px-6 py-2 rounded-md transition-colors flex items-center ${isSubmitting || !isLoggedIn
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
                  } text-white`}
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
                  !isLoggedIn ? "Please Log In" : "Request Planning"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TripPlanningModal;
