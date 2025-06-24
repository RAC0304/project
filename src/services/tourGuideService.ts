import { supabase } from "../config/supabaseClient";

// Interface untuk specialties
export interface TourGuideSpecialties {
  [key: string]: string | boolean | number;
}

// Interface untuk data tour guide
export interface TourGuideData {
  id: number;
  user_id: number;
  bio?: string;
  specialties?: TourGuideSpecialties;
  location: string;
  short_bio?: string;
  experience: number;
  rating: number;
  review_count: number;
  availability?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Join dengan users table
  users?: {
    id: number;
    email: string;
    username?: string;
    first_name: string;
    last_name: string;
    phone?: string;
    profile_picture?: string;
  };
  // Join dengan languages
  tour_guide_languages?: {
    language: string;
  }[];
  // Join dengan tours
  tours?: {
    id: number;
    title: string;
    description: string;
    location: string;
    duration: string;
    price: number;
    max_group_size: number;
    is_active: boolean;
  }[];
}

// Interface untuk statistik tour guide
export interface TourGuideStats {
  totalGuides: number;
  verifiedGuides: number;
  activeGuides: number;
  averageRating: number;
}

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

// Mengambil semua data tour guide
export async function getAllTourGuides(): Promise<TourGuideData[]> {
  try {
    const { data, error } = await supabase
      .from("tour_guides")
      .select(
        `
        *,
        users (
          id,
          email,
          username,
          first_name,
          last_name,
          phone,
          profile_picture
        ),
        tour_guide_languages (
          language
        ),
        tours (
          id,
          title,
          description,
          location,
          duration,
          price,
          max_group_size,
          is_active
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tour guides:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getAllTourGuides:", error);
    throw error;
  }
}

// Mengambil data tour guide berdasarkan ID
export async function getTourGuideById(
  id: number
): Promise<TourGuideData | null> {
  try {
    const { data, error } = await supabase
      .from("tour_guides")
      .select(
        `
        *,
        users (
          id,
          email,
          username,
          first_name,
          last_name,
          phone,
          profile_picture
        ),
        tour_guide_languages (
          language
        ),
        tours (
          id,
          title,
          description,
          location,
          duration,
          price,
          max_group_size,
          is_active
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching tour guide by ID:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getTourGuideById:", error);
    throw error;
  }
}

// Mengambil tour guide berdasarkan lokasi
export async function getTourGuidesByLocation(
  location: string
): Promise<TourGuideData[]> {
  try {
    const { data, error } = await supabase
      .from("tour_guides")
      .select(
        `
        *,
        users (
          id,
          email,
          username,
          first_name,
          last_name,
          phone,
          profile_picture
        ),
        tour_guide_languages (
          language
        )
      `
      )
      .ilike("location", `%${location}%`)
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching tour guides by location:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getTourGuidesByLocation:", error);
    throw error;
  }
}

// Mengambil tour guide yang terverifikasi
export async function getVerifiedTourGuides(): Promise<TourGuideData[]> {
  try {
    const { data, error } = await supabase
      .from("tour_guides")
      .select(
        `
        *,
        users (
          id,
          email,
          username,
          first_name,
          last_name,
          phone,
          profile_picture
        ),
        tour_guide_languages (
          language
        )
      `
      )
      .eq("is_verified", true)
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching verified tour guides:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getVerifiedTourGuides:", error);
    throw error;
  }
}

// Mengambil statistik tour guide
export async function getTourGuideStats(): Promise<TourGuideStats> {
  try {
    const { data, error } = await supabase
      .from("tour_guides")
      .select("is_verified, rating");

    if (error) {
      console.error("Error fetching tour guide stats:", error);
      throw error;
    }

    const totalGuides = data?.length || 0;
    const verifiedGuides =
      data?.filter((guide) => guide.is_verified).length || 0;
    const activeGuides = data?.filter((guide) => guide.rating > 0).length || 0;
    const averageRating =
      data?.length > 0
        ? data.reduce((sum, guide) => sum + (guide.rating || 0), 0) /
          data.length
        : 0;

    return {
      totalGuides,
      verifiedGuides,
      activeGuides,
      averageRating: Number(averageRating.toFixed(1)),
    };
  } catch (error) {
    console.error("Unexpected error in getTourGuideStats:", error);
    throw error;
  }
}

// Update tour guide data
export async function updateTourGuide(
  id: number,
  updateData: Partial<TourGuideData>
): Promise<TourGuideData> {
  try {
    const { data, error } = await supabase
      .from("tour_guides")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        users (
          id,
          email,
          username,
          first_name,
          last_name,
          phone,
          profile_picture
        ),
        tour_guide_languages (
          language
        )
      `
      )
      .single();

    if (error) {
      console.error("Error updating tour guide:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in updateTourGuide:", error);
    throw error;
  }
}
