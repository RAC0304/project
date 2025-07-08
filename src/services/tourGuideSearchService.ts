import { supabase } from "../utils/supabaseClient";

/**
 * Search tour guides by destination, interests, and language.
 * @param destination (string, nama destinasi)
 * @param interests (string[], list specialties)
 * @param language (string, optional)
 * @returns Array of tour guide data
 */
export async function searchTourGuides({ destination, interests, language }: {
    destination?: string;
    interests?: string[];
    language?: string;
}) {
    // 1. Ambil destination_id dari nama
    let destinationId: number | null = null;
    if (destination) {
        const { data: destData } = await supabase
            .from("destinations")
            .select("id")
            .eq("name", destination)
            .maybeSingle();
        destinationId = destData?.id || null;
    }

    // 2. Ambil semua tour_guide_id yang punya tour di destination tersebut
    let tourGuideIds: number[] | null = null;
    if (destinationId) {
        const { data: tours } = await supabase
            .from("tours")
            .select("tour_guide_id")
            .eq("destination_id", destinationId);
        tourGuideIds = (tours || []).map((t) => t.tour_guide_id);
    }

    // 3. Query tour_guides dengan filter id hasil langkah 2
    let query = supabase
        .from("tour_guides")
        .select(`*, users(*), tour_guide_languages(language), tours(*)`);

    if (tourGuideIds && tourGuideIds.length > 0) {
        query = query.in("id", tourGuideIds);
    } else if (destination) {
        // Jika destination dipilih tapi tidak ada tour guide, return kosong
        return [];
    }

    // 4. Ambil data dari Supabase (tanpa filter language di query)
    const { data, error } = await query;
    if (error) throw error;

    // 5. Filter language dan interests di JS
    let filtered = data || [];
    if (language) {
        filtered = filtered.filter((guide) =>
            Array.isArray(guide.tour_guide_languages)
                ? guide.tour_guide_languages.some((l) => l.language === language)
                : false
        );
    }
    if (interests && interests.length > 0) {
        filtered = filtered.filter((guide) => {
            if (!guide.specialties) return false;
            const keys = Array.isArray(guide.specialties)
                ? guide.specialties
                : typeof guide.specialties === "object"
                    ? Object.keys(guide.specialties)
                    : typeof guide.specialties === "string"
                        ? [guide.specialties]
                        : [];
            return interests.some((i) => keys.includes(i));
        });
    }
    return filtered;
}

/**
 * Get unique specialties for a given destination name (for interest dropdown)
 */
export async function getSpecialtiesByDestination(destination?: string): Promise<string[]> {
    if (!destination) {
        // fallback: all specialties
        const { data: guides } = await supabase.from("tour_guides").select("specialties");
        const set = new Set<string>();
        (guides || []).forEach((g) => {
            if (g.specialties) {
                if (Array.isArray(g.specialties)) {
                    g.specialties.forEach((s) => typeof s === "string" && set.add(s));
                } else if (typeof g.specialties === "object") {
                    Object.keys(g.specialties).forEach((k) => set.add(k));
                } else if (typeof g.specialties === "string") {
                    set.add(g.specialties);
                }
            }
        });
        return Array.from(set).sort();
    }
    // Step 1: Find destination_id
    const { data: destData } = await supabase
        .from("destinations")
        .select("id")
        .eq("name", destination)
        .maybeSingle();
    const destinationId = destData?.id;
    if (!destinationId) return [];
    // Step 2: Find all tours with that destination_id
    const { data: tours } = await supabase
        .from("tours")
        .select("tour_guide_id")
        .eq("destination_id", destinationId);
    const tourGuideIds = (tours || []).map((t) => t.tour_guide_id);
    if (!tourGuideIds.length) return [];
    // Step 3: Get specialties from those tour_guides
    const { data: guides } = await supabase
        .from("tour_guides")
        .select("specialties")
        .in("id", tourGuideIds);
    const set = new Set<string>();
    (guides || []).forEach((g) => {
        if (g.specialties) {
            if (Array.isArray(g.specialties)) {
                g.specialties.forEach((s) => typeof s === "string" && set.add(s));
            } else if (typeof g.specialties === "object") {
                Object.keys(g.specialties).forEach((k) => set.add(k));
            } else if (typeof g.specialties === "string") {
                set.add(g.specialties);
            }
        }
    });
    return Array.from(set).sort();
}
