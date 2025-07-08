import { getAllTourGuides } from "./tourGuideService";

/**
 * Fetch unique specialties from all tour guides (flattened and deduplicated).
 * Returns an array of unique specialty strings (sorted).
 */
export async function getAllTourGuideSpecialties(): Promise<string[]> {
    const guides = await getAllTourGuides();
    const specialtiesSet = new Set<string>();
    guides.forEach((guide) => {
        if (guide.specialties) {
            if (Array.isArray(guide.specialties)) {
                // If specialties is an array (shouldn't be, but just in case)
                (guide.specialties as any[]).forEach((s) => {
                    if (typeof s === "string") specialtiesSet.add(s);
                });
            } else if (typeof guide.specialties === "object") {
                Object.keys(guide.specialties).forEach((key) => {
                    if (typeof key === "string" && key.trim() !== "") specialtiesSet.add(key);
                });
            } else if (typeof guide.specialties === "string") {
                specialtiesSet.add(guide.specialties);
            }
        }
    });
    return Array.from(specialtiesSet).sort();
}
