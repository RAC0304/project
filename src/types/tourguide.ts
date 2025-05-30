// Tour Guide related types

export type TourStatus = "confirmed" | "pending" | "cancelled";

export interface TourData {
    id: number;
    title: string;
    description: string;
    location: string;
    duration: string;
    price: string;
    date: string;
    time: string;
    capacity: string;
    status: TourStatus;
    clients: number;
}

export interface UpcomingTour {
    id: number;
    title: string;
    date: string;
    time: string;
    clients: number;
    location: string;
    status: TourStatus;
}

export interface GuideStats {
    totalTours: number;
    upcomingTours: number;
    totalClients: number;
    averageRating: number;
    monthlyEarnings: number;
    responseRate: number;
    monthlyBookings: number;
    // Optional trend data
    bookingsTrend?: string;
    earningsTrend?: string;
    clientsTrend?: string;
    ratingTrend?: string;
}

export interface Review {
    id: number;
    clientName: string;
    rating: number;
    comment: string;
    tour: string;
    date: string;
}

export interface Booking {
    id: string;
    tourId: string;
    tourName: string;
    tourGuideId: string;
    tourGuideName: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    date: string;
    participants: number;
    status: "confirmed" | "pending" | "cancelled" | "completed";
    specialRequests?: string;
    totalAmount: number;
    paymentStatus: "paid" | "pending" | "refunded";
    createdAt: string;
    updatedAt: string;
}
