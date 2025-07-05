import { supabase } from "../utils/supabaseClient";

export interface Booking {
  id: number;
  tour_id: number;
  user_id: number;
  date: string;
  participants: number;
  status: string;
  special_requests?: string;
  total_amount: number;
  payment_status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookingRequest {
  tourId: number;
  date: string;
  participants: number;
  specialRequests?: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userId: number; // <-- Add userId from users table
}

export async function getBookingsByGuide(
  tourGuideId: number
): Promise<Booking[]> {
  // Get all tours for this guide
  const { data: tours, error: toursError } = await supabase
    .from("tours")
    .select("id")
    .eq("tour_guide_id", tourGuideId);
  if (toursError || !tours) return [];
  const tourIds = tours.map((t) => t.id);
  if (tourIds.length === 0) return [];
  // Get bookings for those tours
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .in("tour_id", tourIds);
  if (error || !data) return [];
  return data as Booking[];
}

export async function updateBookingStatusSupabase(
  bookingId: number,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);
  if (error) throw error;
}

export async function createBooking(
  bookingData: CreateBookingRequest
): Promise<Booking> {
  // Use userId from bookingData (from users table, not Supabase Auth)
  if (!bookingData.userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert([
      {
        tour_id: bookingData.tourId,
        user_id: bookingData.userId,
        date: bookingData.date,
        participants: bookingData.participants,
        status: "pending",
        special_requests: bookingData.specialRequests,
        total_amount: bookingData.totalAmount,
        payment_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    throw new Error(`Failed to create booking: ${error.message}`);
  }
  // Update user contact info if provided
  if (
    bookingData.customerName ||
    bookingData.customerEmail ||
    bookingData.customerPhone
  ) {
    const updateData: {
      first_name?: string;
      last_name?: string;
      phone?: string;
    } = {};
    if (bookingData.customerName) {
      const nameParts = bookingData.customerName.split(" ");
      updateData.first_name = nameParts[0];
      if (nameParts.length > 1) {
        updateData.last_name = nameParts.slice(1).join(" ");
      }
    }
    if (bookingData.customerPhone) {
      updateData.phone = bookingData.customerPhone;
    }
    await supabase
      .from("users")
      .update(updateData)
      .eq("id", bookingData.userId);
  }
  return data as Booking;
}

export async function getBookingsByUserId(userId: string): Promise<Booking[]> {
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
        price,
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return data || [];
}

export async function getCurrentUser() {
  // For custom auth system (not using Supabase Auth)
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      return null;
    }

    const user = JSON.parse(savedUser);
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
