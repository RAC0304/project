import { supabase } from "../config/supabaseClient";

export async function getGuideStats(tourGuideId: number) {
  try {
    // Total Tours
    const { count: totalTours } = await supabase
      .from("tours")
      .select("id", { count: "exact", head: true })
      .eq("tour_guide_id", tourGuideId);

    // Active Tours
    const { count: activeTours } = await supabase
      .from("tours")
      .select("id", { count: "exact", head: true })
      .eq("tour_guide_id", tourGuideId)
      .eq("is_active", true);

    // Inactive Tours
    const { count: inactiveTours } = await supabase
      .from("tours")
      .select("id", { count: "exact", head: true })
      .eq("tour_guide_id", tourGuideId)
      .eq("is_active", false);

    // Get tour IDs first
    const { data: tourData, error: tourError } = await supabase
      .from("tours")
      .select("id")
      .eq("tour_guide_id", tourGuideId);

    if (tourError) {
      console.error("Error fetching tours:", tourError);
      return {
        totalTours: totalTours || 0,
        activeTours: activeTours || 0,
        inactiveTours: inactiveTours || 0,
        totalBookings: 0,
        totalClients: 0,
        averageRating: 0,
        monthlyEarnings: 0,
      };
    }

    const tourIds = tourData?.map((t) => t.id) || [];

    if (tourIds.length === 0) {
      return {
        totalTours: totalTours || 0,
        activeTours: activeTours || 0,
        inactiveTours: inactiveTours || 0,
        totalBookings: 0,
        totalClients: 0,
        averageRating: 0,
        monthlyEarnings: 0,
      };
    }

    // Total Bookings
    const { count: totalBookings } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("tour_id", tourIds); // Total Clients (unique user_id in bookings)
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("user_id")
      .in("tour_id", tourIds);

    const totalClients = bookingsData
      ? new Set(bookingsData.map((b) => b.user_id)).size
      : 0;

    // Average Rating (from reviews)
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("rating")
      .in("tour_guide_id", [tourGuideId]);
    let averageRating = 0;
    if (reviewsData && reviewsData.length > 0) {
      averageRating =
        reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) /
        reviewsData.length;
    }

    // Monthly Earnings (sum total_amount from bookings this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { data: monthlyBookings } = await supabase
      .from("bookings")
      .select("total_amount, date")
      .gte("date", startOfMonth.toISOString().split("T")[0])
      .in("tour_id", tourIds);

    const monthlyEarnings = monthlyBookings
      ? monthlyBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      : 0;

    // Total Reviews (review_count dari tabel reviews)
    const { count: totalReviews } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("tour_guide_id", tourGuideId);

    return {
      totalTours: totalTours || 0,
      activeTours: activeTours || 0,
      inactiveTours: inactiveTours || 0,
      totalBookings: totalBookings || 0,
      totalClients,
      averageRating,
      monthlyEarnings,
      totalReviews: totalReviews || 0,
    };
  } catch (error) {
    console.error("Error in getGuideStats:", error);
    return {
      totalTours: 0,
      activeTours: 0,
      inactiveTours: 0,
      totalBookings: 0,
      totalClients: 0,
      averageRating: 0,
      monthlyEarnings: 0,
      totalReviews: 0,
    };
  }
}
