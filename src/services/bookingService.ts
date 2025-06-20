import { supabase } from "../config/supabaseClient";

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
