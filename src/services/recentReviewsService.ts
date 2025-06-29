import { supabase } from "../config/supabaseClient";

export interface Review {
  id: number;
  clientName: string;
  rating: number;
  content: string;
  tour: string;
  date: string;
}

export async function getRecentReviewsByGuide(
  tour_guide_id: number
): Promise<Review[]> {
  // Get last 5 reviews for this guide
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, user_id, rating, content, title, created_at, booking_id")
    .eq("tour_guide_id", tour_guide_id)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  if (!reviews || reviews.length === 0) return [];

  // Get user names and tour titles for each review
  const result: Review[] = await Promise.all(
    reviews.map(async (review: any) => {
      // Get user name
      let clientName = "Client";
      if (review.user_id) {
        const { data: user } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("id", review.user_id)
          .single();
        if (user) clientName = `${user.first_name} ${user.last_name}`;
      }
      // Get tour title
      let tour = "Tour";
      if (review.booking_id) {
        const { data: booking } = await supabase
          .from("bookings")
          .select("tour_id")
          .eq("id", review.booking_id)
          .single();
        if (booking && booking.tour_id) {
          const { data: tourData } = await supabase
            .from("tours")
            .select("title")
            .eq("id", booking.tour_id)
            .single();
          if (tourData) tour = tourData.title;
        }
      } return {
        id: review.id,
        clientName,
        rating: review.rating,
        content: review.content,
        tour,
        date: review.created_at?.split("T")[0] || "",
      };
    })
  );
  return result;
}
