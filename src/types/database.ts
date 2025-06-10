// Database entity types based on the schema

export type UserRole = "admin" | "tour_guide" | "customer";
export type UserGender = "male" | "female" | "other";
export type SecurityStatus = "success" | "failed" | "warning";
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type PaymentStatus = "paid" | "pending" | "refunded";
export type RequestStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "cancelled";

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: Date;
  password: string;
  role: UserRole;
  phone?: string;
  date_of_birth?: Date;
  gender?: UserGender;
  profile_picture?: string;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until?: Date;
  last_login_at?: Date;
  last_login_ip?: string;
  remember_token?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TourGuide {
  id: number;
  user_id: number;
  bio?: string;
  specialties?: any; // JSONB
  location: string;
  short_bio?: string;
  experience: number;
  rating: number;
  review_count: number;
  availability?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Destination {
  id: number;
  slug: string;
  name: string;
  location: string;
  description: string;
  short_description?: string;
  image_url?: string;
  best_time_to_visit?: string;
  google_maps_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Tour {
  id: number;
  tour_guide_id: number;
  title: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  max_group_size: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: number;
  tour_id: number;
  user_id: number;
  date: Date;
  participants: number;
  status: BookingStatus;
  special_requests?: string;
  total_amount: number;
  payment_status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Review {
  id: number;
  user_id: number;
  booking_id?: number;
  destination_id?: number;
  tour_guide_id?: number;
  rating: number;
  title: string;
  content: string;
  helpful_count: number;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Itinerary {
  id: number;
  slug: string;
  title: string;
  duration: string;
  description: string;
  image_url?: string;
  difficulty?: string;
  best_season?: string;
  estimated_budget?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SecurityLog {
  id: number;
  user_id?: number;
  action: string;
  ip_address: string;
  user_agent: string;
  status: SecurityStatus;
  details?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ItineraryRequest {
  id: number;
  user_id: number;
  itinerary_id: number;
  tour_guide_id?: number;
  name: string;
  email: string;
  phone?: string;
  start_date: Date;
  end_date: Date;
  group_size: string;
  additional_requests?: string;
  status: RequestStatus;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
}
