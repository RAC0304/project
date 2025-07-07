import { supabase } from "../utils/supabaseClient";

/**
 * Check if a payment for a given itinerary_booking_id is completed (status = 'completed')
 */
export async function isItineraryBookingPaid(itineraryBookingId: number | string): Promise<boolean> {
    if (!itineraryBookingId) return false;
    const { data, error } = await supabase
        .from("payments")
        .select("id, status")
        .eq("itinerary_booking_id", itineraryBookingId)
        .eq("status", "completed")
        .maybeSingle();
    if (error) {
        console.error("Error checking payment status:", error);
        return false;
    }
    return !!data;
}
