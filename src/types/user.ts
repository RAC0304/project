export type UserRole = "user" | "tour_guide" | "admin" | "customer";

export interface TourGuideProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  countryOfOrigin?: string; // untuk user biasa
  // bio?: string;
  // languages?: string[];
  // experience?: string;
  avatar?: string;
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
}

export const DEFAULT_PROFILE_IMAGE = "/images/default-profile.png";
