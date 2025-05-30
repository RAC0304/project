import { GuideStats, UpcomingTour, Review, TourData } from '../types/tourguide';
import { getBookingsByTourGuideId } from './bookings';

// Helper function to get guide's bookings and ensure proper ID format
export const getGuideBookings = (guideId: string) => {
    const formattedGuideId = guideId.startsWith('guide-')
        ? guideId
        : `guide-${guideId.toString().padStart(3, '0')}`;
    return getBookingsByTourGuideId(formattedGuideId);
};

// Calculate guide stats based on actual bookings
export const calculateGuideStats = (guideId: string): GuideStats => {
    const guideBookings = getGuideBookings(guideId);
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const upcomingBookings = guideBookings.filter(booking => new Date(booking.date) > currentDate);
    const monthlyBookings = guideBookings.filter(booking => new Date(booking.date) >= monthStart);
    const totalEarnings = monthlyBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    return {
        totalTours: guideBookings.length,
        upcomingTours: upcomingBookings.length,
        totalClients: guideBookings.reduce((sum, booking) => sum + booking.participants, 0),
        averageRating: 4.8, // We would need a separate reviews system to calculate this
        monthlyEarnings: totalEarnings,
        monthlyBookings: monthlyBookings.length,
        responseRate: 98, // Placeholder - would need a separate system to track message responses
        bookingsTrend: `${((monthlyBookings.length / Math.max(1, guideBookings.length)) * 100).toFixed(0)}% this month`,
        earningsTrend: `IDR ${totalEarnings.toLocaleString('id-ID')}`,
        clientsTrend: `${upcomingBookings.length} upcoming`,
        ratingTrend: 'Active guide'
    };
};

// Helper function to get upcoming tours for a guide
export const getUpcomingTours = (guideId: string): UpcomingTour[] => {
    // Get all bookings for this guide
    const guideBookings = getGuideBookings(guideId);

    // Get upcoming tours based on actual bookings
    const now = new Date();
    const upcomingBookings = guideBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= now;
    });    // Convert bookings to UpcomingTour format
    const upcomingToursFromBookings: UpcomingTour[] = upcomingBookings.map((booking, index) => ({
        id: parseInt(booking.id.replace('booking-', '')) || index + 1000, // Use booking ID instead of tour ID for uniqueness
        title: booking.tourName,
        date: booking.date,
        time: "09:00 AM", // Default time since bookings don't have time
        clients: booking.participants,
        location: "Indonesia", // Default location
        status: booking.status as "confirmed" | "pending" | "cancelled",
    }));

    return upcomingToursFromBookings;
};

export const upcomingTours: UpcomingTour[] = [
    {
        id: 1,
        title: "Historic Jakarta Walking Tour",
        date: "2025-06-15",
        time: "09:00 AM",
        clients: 6,
        location: "Jakarta, Indonesia",
        status: "confirmed",
    },
    {
        id: 2,
        title: "Borobudur Sunrise Private Tour",
        date: "2025-06-25",
        time: "02:00 PM",
        clients: 4,
        location: "Magelang, Indonesia",
        status: "confirmed",
    },
    {
        id: 3,
        title: "Bali Cultural Experience",
        date: "2025-07-10",
        time: "11:00 AM",
        clients: 8,
        location: "Ubud, Bali, Indonesia",
        status: "pending",
    },
];

export const recentReviews: Review[] = [
    {
        id: 1,
        clientName: "Sarah Johnson",
        rating: 5,
        comment: "Amazing tour! The guide was incredibly knowledgeable about Jakarta's history and made the city come alive.",
        tour: "Historic Jakarta Walking Tour",
        date: "2024-01-10",
    },
    {
        id: 2,
        clientName: "David Chen",
        rating: 5,
        comment: "Best guide ever! Highly recommend for anyone visiting Borobudur.",
        tour: "Borobudur Sunrise Private Tour",
        date: "2024-01-08",
    },
    {
        id: 3,
        clientName: "Emma Wilson",
        rating: 4,
        comment: "Great experience in Bali, very professional and friendly.",
        tour: "Bali Cultural Experience",
        date: "2024-01-05",
    },
];

export const tours: TourData[] = [
    {
        id: 1,
        title: "Historic Jakarta Walking Tour",
        description: "Explore the historic heart of Jakarta with a knowledgeable local guide.",
        location: "Jakarta, Indonesia",
        duration: "3",
        price: "49.99",
        date: "2024-01-15",
        time: "09:00",
        capacity: "10",
        status: "confirmed",
        clients: 6
    },
    {
        id: 2,
        title: "Borobudur Sunrise Private Tour",
        description: "Experience the magical sunrise at the ancient Borobudur temple.",
        location: "Magelang, Indonesia",
        duration: "5",
        price: "89.99",
        date: "2024-01-16",
        time: "04:00",
        capacity: "6",
        status: "confirmed",
        clients: 4
    },
    {
        id: 3,
        title: "Bali Cultural Experience",
        description: "Immerse yourself in Balinese culture with traditional dances and ceremonies.",
        location: "Ubud, Bali, Indonesia",
        duration: "4",
        price: "59.99",
        date: "2024-01-18",
        time: "11:00",
        capacity: "12",
        status: "pending",
        clients: 8
    },
];

// Example bookings data moved to bookings.ts
// Use getGuideBookings() to get actual booking data
