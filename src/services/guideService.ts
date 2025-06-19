import { supabase } from "../utils/supabaseClient";

export interface NewGuideData {
  user_id: number; // harus sudah ada user
  bio?: string;
  specialties?: any; // jsonb
  location: string;
  short_bio?: string;
  experience?: number;
  rating?: number;
  review_count?: number;
  availability?: string;
  is_verified?: boolean;
}

export async function addNewGuide(data: NewGuideData) {
  const { data: inserted, error } = await supabase.from("tour_guides").insert([
    {
      user_id: data.user_id,
      bio: data.bio || null,
      specialties: data.specialties || null,
      location: data.location,
      short_bio: data.short_bio || null,
      experience: data.experience || 0,
      rating: data.rating || 0,
      review_count: data.review_count || 0,
      availability: data.availability || null,
      is_verified: data.is_verified ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  if (error) {
    throw error;
  }
  return inserted;
}
