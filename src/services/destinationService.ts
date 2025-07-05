import { supabase } from "../utils/supabaseClient";
import { Destination, DestinationCategory } from "../types";

export interface DestinationFilters {
  search?: string;
  categories?: DestinationCategory[];
  limit?: number;
  offset?: number;
}

export interface DestinationResponse {
  destinations: Destination[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch destinations from Supabase with filtering and pagination
 */
export const getDestinations = async (
  filters: DestinationFilters = {}
): Promise<DestinationResponse> => {
  try {
    const { search, categories, limit = 50, offset = 0 } = filters;

    // Start building the query
    let query = supabase
      .from("destinations")
      .select(
        `
        *,
        destination_categories!inner(category),
        destination_images(image_url),
        attractions(id, name, description, image_url),
        activities(id, name, description, duration, price, image_url),
        travel_tips(tip)
      `
      )
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,location.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Add category filter if provided
    if (categories && categories.length > 0) {
      query = query.in("destination_categories.category", categories);
    }

    // Order by name
    query = query.order("name");

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching destinations:", error);
      throw new Error(`Failed to fetch destinations: ${error.message}`);
    }

    if (!data) {
      return { destinations: [], total: 0, hasMore: false };
    }

    // Transform the data to match our Destination interface
    const destinations: Destination[] = data.map((item: any) => ({
      id: item.slug || item.id.toString(),
      name: item.name,
      location: item.location,
      description: item.description,
      shortDescription:
        item.short_description || item.description.substring(0, 150) + "...",
      imageUrl: item.image_url || item.destination_images?.[0]?.image_url || "",
      images:
        item.destination_images?.map((img: any) => img.image_url) ||
        [item.image_url].filter(Boolean),
      attractions:
        item.attractions?.map((attraction: any) => ({
          id: attraction.id.toString(),
          name: attraction.name,
          description: attraction.description,
          imageUrl: attraction.image_url || "",
        })) || [],
      activities:
        item.activities?.map((activity: any) => ({
          id: activity.id.toString(),
          name: activity.name,
          description: activity.description,
          duration: activity.duration || "",
          price: activity.price || "",
          imageUrl: activity.image_url || "",
        })) || [],
      bestTimeToVisit: item.best_time_to_visit || "Sepanjang tahun",
      travelTips: item.travel_tips?.map((tip: any) => tip.tip) || [],
      category:
        item.destination_categories?.map((cat: any) => cat.category) || [],
      googleMapsUrl: item.google_maps_url || "",
      reviews: [], // We'll implement this later when review system is in place
    }));

    // Get total count for pagination
    const totalCount = count || destinations.length;
    const hasMore = offset + limit < totalCount;

    return {
      destinations,
      total: totalCount,
      hasMore,
    };
  } catch (error) {
    console.error("Error in getDestinations:", error);
    throw error;
  }
};

/**
 * Get a single destination by ID/slug
 */
export const getDestinationById = async (
  id: string
): Promise<Destination | null> => {
  try {
    // Check if id is numeric (for id) or string (for slug)
    const isNumericId = /^\d+$/.test(id);

    const { data, error } = await supabase
      .from("destinations")
      .select(
        `
        *,
        destination_categories(category),
        destination_images(image_url),
        attractions(id, name, description, image_url),
        activities(id, name, description, duration, price, image_url),
        travel_tips(tip)
      `
      )
      .eq(isNumericId ? "id" : "slug", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No data found
      }
      console.error("Error fetching destination:", error);
      throw new Error(`Failed to fetch destination: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    // Transform the data to match our Destination interface
    const destination: Destination = {
      id: data.slug || data.id.toString(),
      name: data.name,
      location: data.location,
      description: data.description,
      shortDescription:
        data.short_description || data.description.substring(0, 150) + "...",
      imageUrl: data.image_url || data.destination_images?.[0]?.image_url || "",
      images:
        data.destination_images?.map((img: any) => img.image_url) ||
        [data.image_url].filter(Boolean),
      attractions:
        data.attractions?.map((attraction: any) => ({
          id: attraction.id.toString(),
          name: attraction.name,
          description: attraction.description,
          imageUrl: attraction.image_url || "",
        })) || [],
      activities:
        data.activities?.map((activity: any) => ({
          id: activity.id.toString(),
          name: activity.name,
          description: activity.description,
          duration: activity.duration || "",
          price: activity.price || "",
          imageUrl: activity.image_url || "",
        })) || [],
      bestTimeToVisit: data.best_time_to_visit || "Sepanjang tahun",
      travelTips: data.travel_tips?.map((tip: any) => tip.tip) || [],
      category: (() => {
        // Ensure category is always an array
        if (!data.destination_categories) return [];

        if (Array.isArray(data.destination_categories)) {
          return data.destination_categories
            .map((cat: any) => cat.category)
            .filter(Boolean);
        }

        // Handle single category object
        if (
          typeof data.destination_categories === "object" &&
          data.destination_categories.category
        ) {
          return [data.destination_categories.category];
        }

        return [];
      })(),
      googleMapsUrl: data.google_maps_url || "",
      reviews: [], // We'll implement this later when review system is in place
    };

    return destination;
  } catch (error) {
    console.error("Error in getDestinationById:", error);
    throw error;
  }
};

/**
 * Get all available destination categories
 */
export const getDestinationCategories = async (): Promise<
  DestinationCategory[]
> => {
  try {
    const { data, error } = await supabase
      .from("destination_categories")
      .select("category")
      .order("category");

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    // Get unique categories
    const uniqueCategories = [
      ...new Set(data?.map((item) => item.category) || []),
    ];
    return uniqueCategories as DestinationCategory[];
  } catch (error) {
    console.error("Error in getDestinationCategories:", error);
    return [
      "beach",
      "mountain",
      "cultural",
      "adventure",
      "historical",
      "nature",
      "city",
    ]; // fallback
  }
};

/**
 * Search destinations by name, location, or description
 */
export const searchDestinations = async (
  searchTerm: string,
  limit: number = 20
): Promise<Destination[]> => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const result = await getDestinations({
      search: searchTerm.trim(),
      limit,
    });

    return result.destinations;
  } catch (error) {
    console.error("Error in searchDestinations:", error);
    throw error;
  }
};

/**
 * Get popular destinations (can be based on booking count, reviews, etc.)
 */
export const getPopularDestinations = async (
  limit: number = 10
): Promise<Destination[]> => {
  try {
    // For now, just get the first destinations ordered by name
    // Later we can implement popularity based on booking count or reviews
    const result = await getDestinations({ limit });
    return result.destinations;
  } catch (error) {
    console.error("Error in getPopularDestinations:", error);
    throw error;
  }
};

/**
 * Get destinations by category
 */
export const getDestinationsByCategory = async (
  categories: DestinationCategory[],
  limit: number = 20
): Promise<Destination[]> => {
  try {
    const result = await getDestinations({
      categories,
      limit,
    });

    return result.destinations;
  } catch (error) {
    console.error("Error in getDestinationsByCategory:", error);
    throw error;
  }
};

/**
 * Get simple destination list for dropdowns
 */
export const getDestinationsForDropdown = async (): Promise<
  { id: number; name: string }[]
> => {
  try {
    const { data, error } = await supabase
      .from("destinations")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("Error fetching destinations for dropdown:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getDestinationsForDropdown:", error);
    return [];
  }
};

/**
 * Get random destinations
 */
export const getRandomDestinations = async (
  limit: number = 4
): Promise<Destination[]> => {
  try {
    // Get all destinations first, then shuffle client-side for true randomness
    const { data, error } = await supabase
      .from("destinations")
      .select(
        `
        *,
        destination_categories(category),
        destination_images(image_url),
        attractions(id, name, description, image_url),
        activities(id, name, description, duration, price, image_url),
        travel_tips(tip)
      `
      )
      .order("id");

    if (error) {
      console.error("Error fetching destinations:", error);
      throw new Error(`Failed to fetch destinations: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Shuffle the array and take the first 'limit' items
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    const randomDestinations = shuffled.slice(0, limit);

    // Transform the data to match our Destination interface
    const destinations: Destination[] = randomDestinations.map((item: any) => ({
      id: item.slug || item.id.toString(),
      name: item.name,
      location: item.location,
      description: item.description,
      shortDescription:
        item.short_description || item.description.substring(0, 150) + "...",
      imageUrl: item.image_url || item.destination_images?.[0]?.image_url || "",
      images:
        item.destination_images
          ?.map((img: any) => img.image_url)
          .filter(Boolean) || [item.image_url].filter(Boolean),
      attractions:
        item.attractions?.map((attraction: any) => ({
          id: attraction.id.toString(),
          name: attraction.name,
          description: attraction.description,
          imageUrl: attraction.image_url || "",
        })) || [],
      activities:
        item.activities?.map((activity: any) => ({
          id: activity.id.toString(),
          name: activity.name,
          description: activity.description,
          duration: activity.duration || "",
          price: activity.price || "",
          imageUrl: activity.image_url || "",
        })) || [],
      bestTimeToVisit: item.best_time_to_visit || "Sepanjang tahun",
      travelTips: item.travel_tips?.map((tip: any) => tip.tip) || [],
      category:
        item.destination_categories?.map((cat: any) => cat.category) || [],
      googleMapsUrl: item.google_maps_url || "",
      reviews: [], // We'll implement this later when review system is in place
    }));

    return destinations;
  } catch (error) {
    console.error("Error in getRandomDestinations:", error);
    throw error;
  }
};
