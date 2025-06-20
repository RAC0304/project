import { supabase } from "../config/supabaseClient";
import { Booking } from "./bookingService";

export interface BookingWithDetails extends Booking {
  userName?: string;
  userEmail?: string;
  tourName?: string;
}

export async function getBookingsWithDetailsByGuide(
  tourGuideId: number
): Promise<BookingWithDetails[]> {
  // Get all tours for this guide
  const { data: tours, error: toursError } = await supabase
    .from("tours")
    .select("id, title")
    .eq("tour_guide_id", tourGuideId);
  if (toursError || !tours) return [];
  const tourIds = tours.map((t) => t.id);
  if (tourIds.length === 0) return [];
  // Get bookings for those tours
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .in("tour_id", tourIds);
  if (error || !bookings) return [];
  // Get users
  const userIds = Array.from(new Set(bookings.map((b) => b.user_id)));
  const { data: users } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .in("id", userIds);
  // Map details
  return bookings.map((b) => {
    const user = users?.find((u) => u.id === b.user_id);
    const tour = tours.find((t) => t.id === b.tour_id);
    return {
      ...b,
      userName: user
        ? `${user.first_name} ${user.last_name}`
        : `User #${b.user_id}`,
      userEmail: user?.email || "",
      tourName: tour?.title || `Tour #${b.tour_id}`,
    };
  });
}
