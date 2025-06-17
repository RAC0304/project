import { supabase } from "../utils/supabaseClient";

export async function createUserSession({
  userId,
  ipAddress,
  userAgent,
  location,
}: {
  userId: number;
  ipAddress: string;
  userAgent: string;
  location?: string;
}) {
  // Ambil waktu lokal perangkat (WIB jika perangkat di Indonesia)
  const now = new Date();
  const localISOString =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0") +
    "T" +
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0") +
    ":" +
    String(now.getSeconds()).padStart(2, "0");

  const { data, error } = await supabase.from("user_sessions").insert([
    {
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      location,
      is_active: true,
      login_time: localISOString,
      last_activity: localISOString,
    },
  ]);
  if (error) throw error;
  return data;
}
