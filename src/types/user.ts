export type UserRole = "user" | "tour_guide" | "admin" | "customer";

export interface TourGuideProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  countryOfOrigin?: string; // untuk user biasa
  avatar?: string;
  // Tour guide specific fields
  bio?: string;
  languages?: string[];
  experience?: string | number;
  specialties?: string[];
  short_bio?: string;
  availability?: string;
  rating?: number;
  review_count?: number;
  is_verified?: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  profile: TourGuideProfile;
  createdAt: string;
  isActive?: boolean;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  profile_picture?: string;
}

export const DEFAULT_PROFILE_IMAGE = "/images/default-profile.png";
