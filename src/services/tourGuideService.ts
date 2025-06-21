import { supabase } from "../config/supabaseClient";

export async function getTourGuideIdByUserId(
  user_id: number | string
): Promise<number | null> {
  try {
    // Convert user_id to string to ensure consistent formatting
    const userId = String(user_id);

    const { data, error } = await supabase
      .from("tour_guides")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching tour guide ID:", error);
      return null;
    }

    if (!data) {
      console.warn("No tour guide found for user_id:", userId);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("Unexpected error in getTourGuideIdByUserId:", error);
    return null;
  }
}
