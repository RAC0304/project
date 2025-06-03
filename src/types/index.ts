// Export all types from tourguide.ts and user.ts
export * from "./tourguide";
export * from "./user";

export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  attractions: Attraction[];
  activities: Activity[];
  bestTimeToVisit: string;
  travelTips: string[];
  category: DestinationCategory[];
  googleMapsUrl: string;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  imageUrl: string;
  border?: string;
  style?: { width: string; height: string; objectFit: string };
}

export type DestinationCategory =
  | "beach"
  | "mountain"
  | "cultural"
  | "adventure"
  | "historical"
  | "nature"
  | "city";

export interface Itinerary {
  id: string;
  title: string;
  duration: string;
  description: string;
  imageUrl: string;
  destinations: string[];
  days: ItineraryDay[];
  difficulty: "easy" | "moderate" | "challenging";
  bestSeason: string;
  estimatedBudget: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: ItineraryActivity[];
  accommodation?: string;
  meals?: string;
  transportation?: string;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location?: string;
}

export interface CulturalInsight {
  id: string;
  title: string;
  category: "food" | "tradition" | "festival" | "art" | "history";
  description: string;
  imageUrl: string;
  content: string;
}

export interface TourGuide {
  id: string;
  name: string;
  specialties: TourGuideSpecialty[];
  location: string;
  description: string;
  shortBio: string;
  imageUrl: string;
  languages: string[];
  experience: number; // years of experience
  rating: number; // out of 5
  reviewCount: number;
  contactInfo: {
    email: string;
    phone?: string;
  };
  availability: string;
  tours: GuidedTour[];
  isVerified: boolean; // indicates if tour guide is verified
}

export type TourGuideSpecialty =
  | "adventure"
  | "cultural"
  | "historical"
  | "nature"
  | "culinary"
  | "photography"
  | "diving";

export interface GuidedTour {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  maxGroupSize: number;
}

export interface Review {
  id: string;
  destinationId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  images: string[];
  helpfulCount: number;
  tags: string[];
}

// User Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: string;
  lastLogin?: string;
  isActive?: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  location?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: boolean;
  theme: "light" | "dark";
}

export type UserRole = "user" | "tour_guide" | "admin";

export interface Permission {
  action: string;
  resource: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
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
  status: "pending" | "confirmed" | "cancelled";
  specialRequests?: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export type AnalyticsMetric = "bookings" | "revenue" | "users";
export type AnalyticsReportType =
  | "revenue"
  | "users"
  | "destinations"
  | "guides"
  | "bookings";
export type AnalyticsReportPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";
export type AnalyticsReportStatus = "available" | "processing" | "error";

export interface AnalyticsItem {
  date: string;
  value: number;
}

export interface TopDestinationItem {
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
}

export interface TopTourGuideItem {
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  description: string;
  type: AnalyticsReportType;
  period: AnalyticsReportPeriod;
  createdAt: string;
  lastUpdated: string;
  status: AnalyticsReportStatus;
}

export interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    totalBookings: number;
    bookingsThisMonth: number;
    totalRevenue: number;
    revenueThisMonth: number;
    averageRating: number;
    totalDestinations: number;
    totalTourGuides: number;
    activeTourGuides: number;
  };
  timeSeries: {
    bookings: AnalyticsItem[];
    revenue: AnalyticsItem[];
    users: AnalyticsItem[];
  };
  topDestinations: TopDestinationItem[];
  topTourGuides: TopTourGuideItem[];
  reports: AnalyticsReport[];
}
