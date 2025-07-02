import { supabase } from "../config/supabaseClient";

export interface Tour {
  id?: number; // Made id optional to align with creation logic
  tour_guide_id: number;
  destination_id: number; // Make destination_id required
  destination_name?: string; // Add destination name for display
  title: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  max_group_size: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const TABLE_NAME = "tours";

export async function getTours(): Promise<Tour[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(
      `
      *,
      destinations:destination_id (
        name
      )
    `
    )
    .order("created_at", { ascending: false });
  if (error) throw error;

  // Transform data to include destination_name
  return (data || []).map((tour) => ({
    ...tour,
    destination_name: tour.destinations?.name || null,
  })) as Tour[];
}

export async function getToursByGuide(tour_guide_id: number): Promise<Tour[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("tour_guide_id", tour_guide_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Tour[];
}

export async function createTour(
  tour: Omit<Tour, "id" | "created_at" | "updated_at">
): Promise<Tour> {
  console.log("tourService - createTour received:", tour);
  // Remove id if present
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...tourData } = tour as Tour;
  console.log("tourService - createTour sending to Supabase:", tourData);
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([tourData])
    .select()
    .single();
  if (error) {
    console.error("tourService - createTour error:", error);
    throw error;
  }
  console.log("tourService - createTour result:", data);
  return data as Tour;
}

export async function updateTour(
  id: number,
  tour: Partial<Tour>
): Promise<Tour> {
  console.log("tourService - updateTour received id:", id);
  console.log("tourService - updateTour received tour:", tour);
  // Remove id if present in update object
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...tourData } = tour as Tour;
  console.log("tourService - updateTour sending to Supabase:", tourData);
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(tourData)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("tourService - updateTour error:", error);
    throw error;
  }
  console.log("tourService - updateTour result:", data);
  return data as Tour;
}

export async function deleteTour(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
}
