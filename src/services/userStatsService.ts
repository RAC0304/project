import { supabase } from "../utils/supabaseClient";

/**
 * Get user account statistics: reviews written, tours booked, places visited
 * @param {string|number} userId
 * @returns {Promise<{reviews_written: number, tours_booked: number, places_visited: number}>}
 */
export async function getUserAccountStats(userId) {
  const { data, error } = await supabase.rpc("get_user_account_stats", {
    p_user_id: userId,
  });
  if (error) throw error;
  // data is an array of one object
  return data && data[0]
    ? data[0]
    : { reviews_written: 0, tours_booked: 0, places_visited: 0 };
}
