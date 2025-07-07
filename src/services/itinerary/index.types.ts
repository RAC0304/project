// Re-export all types from the individual service files
export type {
    // Booking types
    ItineraryBookingData,
    ItineraryRequestData,
    ItineraryBooking,
    ItineraryRequest,
} from '../itineraryBookingService';

export type {
    // Review types
    ItineraryReviewData,
    ItineraryReview,
    ItineraryReviewStats,
} from '../itineraryReviewService';

export type {
    // Admin types
    CreateItineraryData,
    UpdateItineraryData,
    CreateItineraryDayData,
    UpdateItineraryDayData,
    CreateItineraryActivityData,
    UpdateItineraryActivityData,
} from '../itineraryAdminService';

export type {
    // Tag types
    ItineraryTag,
    ItineraryTagRelation,
} from '../itineraryTagService';

export type {
    // Stats types
    ItineraryStats,
    ItineraryPopularityStats,
    ItineraryRevenueStats,
    CategoryStats,
    DifficultyStats,
    MonthlyStats,
} from '../itineraryStatsService';
