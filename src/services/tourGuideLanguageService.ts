import { supabase } from "../utils/supabaseClient";

/**
 * Get all unique languages from tour_guide_languages table
 */
export async function getAllTourGuideLanguages(): Promise<string[]> {
    const { data, error } = await supabase
        .from("tour_guide_languages")
        .select("language");
    if (error) {
        console.error("Error fetching tour guide languages:", error);
        return [];
    }
    // Return unique, sorted languages
    return Array.from(new Set((data || []).map((row) => row.language).filter(Boolean))).sort();
}
