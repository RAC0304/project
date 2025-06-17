import { supabase } from "../utils/supabaseClient";

// Ambil data security_logs dari Supabase
export async function getSecurityLogs() {
  const { data, error } = await supabase
    .from("security_logs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
