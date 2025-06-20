import { supabase } from "../config/supabaseClient";

export async function getTourGuideIdByUserId(
  user_id: number | string
): Promise<number | null> {
  const { data, error } = await supabase
    .from("tour_guides")
    .select("id")
    .eq("user_id", user_id)
    .single();
  if (error || !data) return null;
  return data.id;
}
