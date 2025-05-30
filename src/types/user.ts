export type UserRole = "user" | "tour_guide" | "admin";

export interface TourGuideProfile {
    firstName: string;
    lastName: string;
    phone: string;
    location: string;
    bio: string;
    languages?: string[];
    experience?: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    profile: TourGuideProfile;
    createdAt: string;
}

export const DEFAULT_PROFILE_IMAGE = '/images/default-profile.png';
