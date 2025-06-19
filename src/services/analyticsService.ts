import { supabase } from "../config/supabaseClient";
import {
  getTopDestinations as getTopDestinationsSupabase,
  getTopTourGuides as getTopTourGuidesSupabase,
  getAllReports as getAllReportsSupabase,
} from "../services/analyticsService";

export async function getTotalUsers() {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

export async function getMonthlyRevenue() {
  const { data, error } = await supabase
    .from("bookings")
    .select("amount, created_at")
    .gte("created_at", getStartOfMonth())
    .lte("created_at", getEndOfMonth());
  if (error) throw error;
  return data?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
}

export async function getTimeSeriesData(
  metric: "bookings" | "revenue" | "users"
) {
  let table = "";
  if (metric === "bookings" || metric === "revenue") table = "bookings";
  if (metric === "users") table = "users";

  const { data, error } = await supabase
    .from(table)
    .select("created_at" + (metric === "revenue" ? ",amount" : ""));
  if (error) throw error;

  // Group by month for last 6 months
  const now = new Date();
  const months: { date: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();
    let value = 0;
    if (data) {
      const filtered = data.filter((item: any) => {
        const itemDate = new Date(item.created_at);
        return (
          itemDate.getFullYear() === year &&
          itemDate.getMonth() === d.getMonth()
        );
      });
      if (metric === "revenue") {
        value = filtered.reduce(
          (sum: number, b: any) => sum + (b.amount || 0),
          0
        );
      } else {
        value = filtered.length;
      }
    }
    months.push({ date: month, value });
  }
  return months;
}

export const getTopDestinations = async (limit = 5) => {
  return await getTopDestinationsSupabase(limit);
};

export const getTopTourGuides = async (limit = 5) => {
  return await getTopTourGuidesSupabase(limit);
};

export const getAllReports = async () => {
  return await getAllReportsSupabase();
};

function getStartOfMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;
}
function getEndOfMonth() {
  const now = new Date();
  // Ambil tanggal 1 bulan berikutnya, lalu mundur 1 hari
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const lastDay = new Date(nextMonth.getTime() - 1);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(lastDay.getDate()).padStart(2, "0")}`;
}
