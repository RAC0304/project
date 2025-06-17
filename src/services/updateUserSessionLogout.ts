import { supabase } from "../utils/supabaseClient";

export async function updateUserSessionLogout({ userId }: { userId: number }) {
  // Set all active sessions for this user to inactive and update last_activity
  const { data, error } = await supabase
    .from("user_sessions")
    .update({ is_active: false, last_activity: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_active", true);
  if (error) throw error;
  return data;
}
