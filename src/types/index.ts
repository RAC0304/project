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
