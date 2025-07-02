import { supabase } from "../config/supabaseClient";

export interface BookingWithDetails {
  id: number;
  tour_id: number;
  user_id: number;
  date: string;
  participants: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  special_requests?: string;
  total_amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
  tours?: {
    id: number;
    title: string;
    description: string;
    location: string;
    duration: string;
    tour_guides?: {
      id: number;
      user_id: number;
      bio: string;
      location: string;
      rating: number;
      users?: {
        first_name: string;
        last_name: string;
        profile_picture?: string;
        phone?: string;
      };
    };
  };
}

export interface BookingStatus {
  upcomingTours: BookingWithDetails[];
  todayTours: BookingWithDetails[];
  completedTours: BookingWithDetails[];
  eligibleForReview: BookingWithDetails[];
}

export class BookingStatusService {
  // Tahap 3: Get upcoming tours untuk customer
  static async getUpcomingTours(userId: number): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        tours (
          id,
          title,
          description,
          location,
          duration,
          tour_guides (
            id,
            user_id,
            bio,
            location,
            rating,
            users (
              first_name,
              last_name,
              profile_picture
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Tahap 4: Get tours hari ini
  static async getTodayTours(userId: number): Promise<BookingWithDetails[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        tours (
          id,
          title,
          description,
          location,
          duration,
          tour_guides (
            id,
            user_id,
            bio,
            users (
              first_name,
              last_name,
              phone,
              profile_picture
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .eq("date", today);

    if (error) throw error;
    return data || [];
  }

  // Tahap 5: Get completed tours
  static async getCompletedTours(
    userId: number
  ): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        tours (
          id,
          title,
          description,
          location,
          duration,
          tour_guides (
            id,
            user_id,
            rating,
            users (
              first_name,
              last_name,
              profile_picture
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Tahap 6: Check if user can review booking
  static async canReview(userId: number, bookingId: number): Promise<boolean> {
    const { data, error } = await supabase.rpc("can_user_review", {
      p_user_id: userId,
      p_booking_id: bookingId,
    });

    if (error) {
      console.error("Error checking review eligibility:", error);
      return false;
    }
    return data;
  }

  // Tahap 6: Get bookings eligible for review
  static async getEligibleForReview(
    userId: number
  ): Promise<BookingWithDetails[]> {
    const { data: completedBookings, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        tours (
          id,
          title,
          tour_guides (
            id,
            users (
              first_name,
              last_name,
              profile_picture
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .eq("payment_status", "paid");

    if (error) throw error;

    // Filter out bookings that already have reviews
    const eligibleBookings = [];

    for (const booking of completedBookings || []) {
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", userId)
        .eq("booking_id", booking.id)
        .single();

      if (!existingReview) {
        eligibleBookings.push(booking);
      }
    }

    return eligibleBookings;
  }

  // Manual update booking status (untuk testing)
  static async updateBookingStatus() {
    const { data, error } = await supabase.rpc("update_booking_status");

    if (error) throw error;
    return data;
  }

  // Get all booking status for customer
  static async getCustomerBookingStatus(
    userId: number
  ): Promise<BookingStatus> {
    const [upcomingTours, todayTours, completedTours, eligibleForReview] =
      await Promise.all([
        this.getUpcomingTours(userId),
        this.getTodayTours(userId),
        this.getCompletedTours(userId),
        this.getEligibleForReview(userId),
      ]);

    return {
      upcomingTours,
      todayTours,
      completedTours,
      eligibleForReview,
    };
  }
}
