import { supabase } from "../utils/supabaseClient";

// Ambil data user_sessions dari Supabase
export async function getUserSessions() {
  const { data, error } = await supabase
    .from("user_sessions")
    .select("*")
    .order("login_time", { ascending: false });
  if (error) throw error;
  return data;
}
