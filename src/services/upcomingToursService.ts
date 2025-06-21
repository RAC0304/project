import { supabase } from "../config/supabaseClient";

export interface UpcomingTour {
  id: number;
  title: string;
  date: string; // Kosongkan jika tidak ada field date
  time: string; // Kosongkan jika tidak ada field time
  clients: number; // Dummy 0, karena tidak ada booking
  location: string;
  status: "confirmed" | "pending" | "cancelled";
}

export async function getUpcomingToursByGuide(
  tour_guide_id: number
): Promise<UpcomingTour[]> {
  // Ambil semua tour milik guide ini yang aktif
  const { data: tours, error } = await supabase
    .from("tours")
    .select("id, title, location, is_active")
    .eq("tour_guide_id", tour_guide_id)
    .eq("is_active", true);
  if (error) throw error;
  if (!tours || tours.length === 0) return [];

  // Map ke format UpcomingTour
  const result: UpcomingTour[] = tours.map((tour: any) => ({
    id: tour.id,
    title: tour.title,
    date: "", // Tidak ada field date di tabel tours
    time: "", // Tidak ada field time di tabel tours
    clients: 0, // Tidak ada booking
    location: tour.location,
    status: tour.is_active ? "confirmed" : "pending",
  }));
  return result;
}
