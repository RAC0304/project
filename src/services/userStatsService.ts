import { supabase } from "../utils/supabaseClient";

/**
 * Get user account statistics: reviews written, tours booked, places visited
 * @param {string|number} userId
 * @returns {Promise<{reviews_written: number, tours_booked: number, places_visited: number}>}
 */
export async function getUserAccountStats(userId: string | number): Promise<{
  reviews_written: number;
  tours_booked: number;
  places_visited: number;
}> {
  try {
    // Convert userId to number for consistency
    const numericUserId =
      typeof userId === "string" ? parseInt(userId) : userId;

    // Try to use the RPC function first
    const { data, error } = await supabase.rpc("get_user_account_stats", {
      p_user_id: numericUserId,
    });

    if (error) {
      console.warn(
        "RPC function get_user_account_stats not found, using fallback:",
        error.message
      );
      return await getUserAccountStatsFallback(numericUserId);
    }

    // data is an array of one object
    return data && data[0]
      ? {
          reviews_written: Number(data[0].reviews_written) || 0,
          tours_booked: Number(data[0].tours_booked) || 0,
          places_visited: Number(data[0].places_visited) || 0,
        }
      : { reviews_written: 0, tours_booked: 0, places_visited: 0 };
  } catch (error) {
    console.error("Error getting user account stats:", error);
    const numericUserId =
      typeof userId === "string" ? parseInt(userId) : userId;
    return await getUserAccountStatsFallback(numericUserId);
  }
}

/**
 * Fallback method to get user stats using direct table queries
 * @param {string|number} userId
 * @returns {Promise<{reviews_written: number, tours_booked: number, places_visited: number}>}
 */
async function getUserAccountStatsFallback(userId: string | number): Promise<{
  reviews_written: number;
  tours_booked: number;
  places_visited: number;
}> {
  try {
    console.log("Using fallback method for user stats, userId:", userId);

    // Convert userId to ensure it's a number for database queries
    const numericUserId =
      typeof userId === "string" ? parseInt(userId) : userId;

    if (isNaN(numericUserId)) {
      console.error("Invalid userId provided:", userId);
      return { reviews_written: 0, tours_booked: 0, places_visited: 0 };
    }

    // Get reviews count - check if reviews table exists
    let reviewsCount = 0;
    try {
      const { count } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", numericUserId);
      reviewsCount = count || 0;
    } catch (reviewError) {
      console.warn("Reviews table not accessible:", reviewError);
      reviewsCount = 0;
    }

    // Get bookings count - check if bookings table exists
    let bookingsCount = 0;
    try {
      const { count } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", numericUserId);
      bookingsCount = count || 0;
    } catch (bookingError) {
      console.warn("Bookings table not accessible:", bookingError);
      bookingsCount = 0;
    }

    // Calculate places visited (approximation based on reviews and bookings)
    const placesVisited = Math.max(reviewsCount, bookingsCount);

    const result = {
      reviews_written: reviewsCount,
      tours_booked: bookingsCount,
      places_visited: placesVisited,
    };

    console.log("Fallback stats result:", result);
    return result;
  } catch (error) {
    console.error("Error in getUserAccountStatsFallback:", error);
    // Return default values if everything fails
    return {
      reviews_written: 0,
      tours_booked: 0,
      places_visited: 0,
    };
  }
}
