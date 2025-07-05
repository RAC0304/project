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
    console.log(
      "getUpcomingToursByGuide called with tour_guide_id:",
      tour_guide_id
    );

    // First, get all tours for this guide
    const { data: tours, error: toursError } = await supabase
      .from("tours")
      .select("id, title, location, is_active")
      .eq("tour_guide_id", tour_guide_id)
      .eq("is_active", true);

    console.log("Tours query result:", { tours, toursError });

    if (toursError) {
      console.error("Error fetching tours:", toursError);
      return [];
    }

    if (!tours || tours.length === 0) {
      console.log("No tours found for this guide");
      return [];
    }

    const tourIds = tours.map((tour) => tour.id);
    console.log("Tour IDs:", tourIds);

    // Get upcoming bookings for these tours
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        date,
        participants,
        status,
        tour_id,
        payment_status,
        created_at,
        tours!inner (
          id,
          title,
          location,
          tour_guide_id,
          is_active
        )
      `
      )
      .in("tour_id", tourIds)
      .in("status", ["confirmed", "pending"])
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true });

    console.log("Bookings query result:", { bookings, bookingsError });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return [];
    }

    // If there are upcoming bookings, group by tour and aggregate client counts
    if (bookings && bookings.length > 0) {
      // Group bookings by tour_id and aggregate participant counts
      const tourBookingMap = new Map<number, any>();

      bookings.forEach((booking: any) => {
        const tourId = booking.tour_id;
        if (!tourBookingMap.has(tourId)) {
          tourBookingMap.set(tourId, {
            ...booking,
            totalClients: 0,
            allBookings: []
          });
        }

        const tourData = tourBookingMap.get(tourId);
        tourData.totalClients += booking.participants || 0;
        tourData.allBookings.push(booking);

        // Use the earliest date for the tour
        if (!tourData.date || booking.date < tourData.date) {
          tourData.date = booking.date;
          tourData.id = booking.id; // Use the earliest booking ID
        }
      });

      const result: UpcomingTour[] = Array.from(tourBookingMap.values()).map((tourData: any) => {
        // Determine the overall status based on tour active status and booking statuses
        const bookingStatuses = tourData.allBookings.map((b: any) => b.status);
        const isActiveTour = tourData.tours?.is_active;
        let overallStatus: "confirmed" | "pending" | "cancelled" = "pending";

        // If tour is active and has confirmed bookings, mark as confirmed
        if (isActiveTour && bookingStatuses.includes("confirmed")) {
          overallStatus = "confirmed";
        } else if (isActiveTour && bookingStatuses.includes("pending")) {
          overallStatus = "pending";
        } else if (isActiveTour && bookingStatuses.every((status: string) => status === "cancelled")) {
          overallStatus = "cancelled";
        } else if (isActiveTour) {
          // If tour is active but no specific booking status, default to confirmed
          overallStatus = "confirmed";
        }

        return {
          id: tourData.id, // This is the booking ID
          title: tourData.tours?.title || "Unknown Tour",
          date: tourData.date || "",
          time: tourData.created_at ? new Date(tourData.created_at).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) : "09:00", // Format time from created_at
          clients: tourData.totalClients,
          location: tourData.tours?.location || "Unknown Location",
          status: overallStatus,
          tour_id: tourData.tours?.id || tourData.tour_id, // Add the actual tour ID for fetching details
        };
      });

      console.log("Returning upcoming tours with aggregated bookings:", result);
      return result;
    }

    // If no upcoming bookings, show active tours as potential upcoming tours
    console.log("No upcoming bookings found, showing active tours");
    const result = tours.map((tour: Tour) => ({
      id: tour.id,
      title: tour.title,
      date: "",
      time: "",
      clients: 0,
      location: tour.location,
      status: "confirmed" as const, // Active tours should be confirmed, not pending
      tour_id: tour.id, // Use the same tour ID
    }));

    console.log("Returning active tours as upcoming:", result);
    return result;
  } catch (error) {
    console.error("Error in getUpcomingToursByGuide:", error);
    return [];
  }
}
