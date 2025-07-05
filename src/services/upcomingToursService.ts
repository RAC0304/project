import { supabase } from "../utils/supabaseClient";

export interface UpcomingTour {
  id: number;
  title: string;
  date: string;
  time: string;
  clients: number;
  location: string;
  status: "confirmed" | "pending" | "cancelled";
  tour_id?: number; // Add tour_id for modal fetching
}

interface Tour {
  id: number;
  title: string;
  location: string;
  is_active: boolean;
}

export async function getUpcomingToursByGuide(
  tour_guide_id: number
): Promise<UpcomingTour[]> {
  try {
    console.log("getUpcomingToursByGuide called with tour_guide_id:", tour_guide_id);
    
    // Get bookings for tours owned by this guide
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        date,
        participants,
        status,
        tour_id,
        tours!inner (
          id,
          title,
          location,
          is_active,
          tour_guide_id
        )
      `)
      .eq("tours.tour_guide_id", tour_guide_id)
      .eq("tours.is_active", true)
      .in("status", ["confirmed", "pending"])
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true });

    console.log("Upcoming tours query result:", { bookings, error });

    if (error) {
      console.error("Error fetching upcoming tours:", error);
      return [];
    }

    if (!bookings || bookings.length === 0) {
      console.log("No bookings found, fetching active tours instead");
      // If no bookings, return active tours without booking details
      const { data: tours, error: tourError } = await supabase
        .from("tours")
        .select("id, title, location, is_active")
        .eq("tour_guide_id", tour_guide_id)
        .eq("is_active", true)
        .limit(5);

      console.log("Active tours query result:", { tours, tourError });

      if (tourError) {
        console.error("Error fetching tours:", tourError);
        return [];
      }

      const result = (tours || []).map((tour: Tour) => ({
        id: tour.id,
        title: tour.title,
        date: "",
        time: "",
        clients: 0,
        location: tour.location,
        status: "pending" as const,
        tour_id: tour.id, // Use the same tour ID
      }));
      
      console.log("Returning tours without bookings:", result);
      return result;
    }

    // Map bookings to UpcomingTour format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: UpcomingTour[] = bookings.map((booking: any) => ({
      id: booking.id, // This is the booking ID
      title: booking.tours?.title || "Unknown Tour",
      date: booking.date || "",
      time: "09:00 AM", // Default time since we don't have specific times
      clients: booking.participants || 0,
      location: booking.tours?.location || "Unknown Location",
      status: booking.status as "confirmed" | "pending" | "cancelled",
      tour_id: booking.tours?.id || booking.tour_id, // Add the actual tour ID for fetching details
    }));

    console.log("Returning upcoming tours with bookings:", result);
    return result;
  } catch (error) {
    console.error("Error in getUpcomingToursByGuide:", error);
    return [];
  }
}
