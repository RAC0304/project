// Main itinerary services
export * from '../itineraryService';
export * from '../itineraryBookingService';
export * from '../itineraryReviewService';
export * from '../itineraryAdminService';
export * from '../itineraryTagService';
export * from '../itineraryStatsService';

// Re-export types for convenience
export type {
    // Booking types
    ItineraryBookingData,
    ItineraryRequestData,
    ItineraryBooking,
    ItineraryRequest,

    // Review types
    ItineraryReviewData,
    ItineraryReview,
    ItineraryReviewStats,

    // Admin types
    CreateItineraryData,
    UpdateItineraryData,
    CreateItineraryDayData,
    UpdateItineraryDayData,
    CreateItineraryActivityData,
    UpdateItineraryActivityData,

    // Tag types
    ItineraryTag,
    ItineraryTagRelation,

    // Stats types
    ItineraryStats,
    ItineraryPopularityStats,
    ItineraryRevenueStats,
    CategoryStats,
    DifficultyStats,
    MonthlyStats
} from './index.types';
