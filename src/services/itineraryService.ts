import { supabase } from '../config/supabaseClient';
import { Itinerary } from '../types';

interface ItineraryRow {
    id: string;
    slug: string;
    title: string;
    duration: string;
    description: string;
    image_url: string;
    difficulty: string;
    best_season: string;
    estimated_budget: string;
    category: string;
    status: string;
    featured: boolean;
    min_participants: number;
    max_participants: number;
    created_at: string;
    updated_at: string;
    created_by: number;
}

interface ItineraryDay {
    id: string;
    itinerary_id: string;
    day_number: number;
    title: string;
    description: string;
    accommodation: string;
    meals: string;
    transportation: string;
}

interface ItineraryActivity {
    id: string;
    itinerary_day_id: string;
    time_start: string;
    title: string;
    description: string;
    location: string;
    duration_minutes: number;
    optional: boolean;
    order_index: number;
}

interface ItineraryDestination {
    id: string;
    itinerary_id: string;
    destination_id: string;
    order_index: number;
    destinations: {
        id: string;
        name: string;
        slug: string;
    };
}

interface ItineraryImage {
    id: string;
    itinerary_id: string;
    image_url: string;
    alt_text: string;
    caption: string;
    order_index: number;
}

export const getAllItineraries = async (): Promise<Itinerary[]> => {
    try {
        // Get published itineraries with their related data
        const { data: itinerariesData, error: itinerariesError } = await supabase
            .from('itineraries')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (itinerariesError) {
            console.error('Error fetching itineraries:', itinerariesError);
            throw itinerariesError;
        }

        if (!itinerariesData || itinerariesData.length === 0) {
            return [];
        }

        // Transform each itinerary
        const itineraries: Itinerary[] = await Promise.all(
            itinerariesData.map(async (itinerary: ItineraryRow) => {
                // Get itinerary days
                const { data: daysData, error: daysError } = await supabase
                    .from('itinerary_days')
                    .select('*')
                    .eq('itinerary_id', itinerary.id)
                    .order('day_number', { ascending: true });

                if (daysError) {
                    console.error('Error fetching itinerary days:', daysError);
                }

                // Get destinations
                const { data: destinationsData, error: destinationsError } = await supabase
                    .from('itinerary_destinations')
                    .select(`
            *,
            destinations (
              id,
              name,
              slug
            )
          `)
                    .eq('itinerary_id', itinerary.id)
                    .order('order_index', { ascending: true });

                if (destinationsError) {
                    console.error('Error fetching itinerary destinations:', destinationsError);
                }

                // Get additional images
                const { data: imagesData, error: imagesError } = await supabase
                    .from('itinerary_images')
                    .select('*')
                    .eq('itinerary_id', itinerary.id)
                    .order('order_index', { ascending: true });

                if (imagesError) {
                    console.error('Error fetching itinerary images:', imagesError);
                }

                // Transform days with activities
                const days = await Promise.all(
                    (daysData || []).map(async (day: ItineraryDay) => {
                        const { data: activitiesData, error: activitiesError } = await supabase
                            .from('itinerary_activities')
                            .select('*')
                            .eq('itinerary_day_id', day.id)
                            .order('order_index', { ascending: true });

                        if (activitiesError) {
                            console.error('Error fetching itinerary activities:', activitiesError);
                        }

                        return {
                            day: day.day_number,
                            title: day.title,
                            description: day.description,
                            activities: (activitiesData || []).map((activity: ItineraryActivity) => ({
                                time: activity.time_start,
                                title: activity.title,
                                description: activity.description,
                                location: activity.location || '',
                                duration: activity.duration_minutes ? `${activity.duration_minutes} minutes` : undefined,
                                optional: activity.optional
                            })),
                            accommodation: day.accommodation || '',
                            meals: day.meals || '',
                            transportation: day.transportation || ''
                        };
                    })
                );

                // Transform destinations
                const destinations = (destinationsData || []).map((dest: ItineraryDestination) =>
                    dest.destinations.slug
                );

                // Create images array with main image first
                const images = [itinerary.image_url];
                if (imagesData && imagesData.length > 0) {
                    images.push(...imagesData.map((img: ItineraryImage) => img.image_url));
                }

                return {
                    id: itinerary.id,
                    slug: itinerary.slug,
                    title: itinerary.title,
                    duration: itinerary.duration,
                    description: itinerary.description,
                    imageUrl: itinerary.image_url,
                    images,
                    destinations,
                    difficulty: (itinerary.difficulty as "easy" | "moderate" | "challenging") || 'easy',
                    bestSeason: itinerary.best_season || '',
                    estimatedBudget: itinerary.estimated_budget || '',
                    category: itinerary.category || 'cultural',
                    featured: itinerary.featured || false,
                    minParticipants: itinerary.min_participants || 1,
                    maxParticipants: itinerary.max_participants || 20,
                    days,
                    createdAt: itinerary.created_at,
                    updatedAt: itinerary.updated_at
                };
            })
        );

        return itineraries;
    } catch (error) {
        console.error('Error in getAllItineraries:', error);
        throw error;
    }
};

export const getItineraryById = async (id: string): Promise<Itinerary | null> => {
    try {
        const { data: itineraryData, error: itineraryError } = await supabase
            .from('itineraries')
            .select('*')
            .eq('id', id)
            .single();

        if (itineraryError) {
            console.error('Error fetching itinerary:', itineraryError);
            return null;
        }

        if (!itineraryData) {
            return null;
        }

        // Get itinerary days
        const { data: daysData, error: daysError } = await supabase
            .from('itinerary_days')
            .select('*')
            .eq('itinerary_id', id)
            .order('day_number', { ascending: true });

        if (daysError) {
            console.error('Error fetching itinerary days:', daysError);
        }

        // Get destinations
        const { data: destinationsData, error: destinationsError } = await supabase
            .from('itinerary_destinations')
            .select(`
        *,
        destinations (
          id,
          name,
          slug
        )
      `)
            .eq('itinerary_id', id)
            .order('order_index', { ascending: true });

        if (destinationsError) {
            console.error('Error fetching itinerary destinations:', destinationsError);
        }

        // Get additional images
        const { data: imagesData, error: imagesError } = await supabase
            .from('itinerary_images')
            .select('*')
            .eq('itinerary_id', id)
            .order('order_index', { ascending: true });

        if (imagesError) {
            console.error('Error fetching itinerary images:', imagesError);
        }

        // Transform days with activities
        const days = await Promise.all(
            (daysData || []).map(async (day: ItineraryDay) => {
                const { data: activitiesData, error: activitiesError } = await supabase
                    .from('itinerary_activities')
                    .select('*')
                    .eq('itinerary_day_id', day.id)
                    .order('order_index', { ascending: true });

                if (activitiesError) {
                    console.error('Error fetching itinerary activities:', activitiesError);
                }

                return {
                    day: day.day_number,
                    title: day.title,
                    description: day.description,
                    activities: (activitiesData || []).map((activity: ItineraryActivity) => ({
                        time: activity.time_start,
                        title: activity.title,
                        description: activity.description,
                        location: activity.location || '',
                        duration: activity.duration_minutes ? `${activity.duration_minutes} minutes` : undefined,
                        optional: activity.optional
                    })),
                    accommodation: day.accommodation || '',
                    meals: day.meals || '',
                    transportation: day.transportation || ''
                };
            })
        );

        // Transform destinations
        const destinations = (destinationsData || []).map((dest: ItineraryDestination) =>
            dest.destinations.slug
        );

        // Create images array with main image first
        const images = [itineraryData.image_url];
        if (imagesData && imagesData.length > 0) {
            images.push(...imagesData.map((img: ItineraryImage) => img.image_url));
        }

        return {
            id: itineraryData.id,
            slug: itineraryData.slug,
            title: itineraryData.title,
            duration: itineraryData.duration,
            description: itineraryData.description,
            imageUrl: itineraryData.image_url,
            images,
            destinations,
            difficulty: (itineraryData.difficulty as "easy" | "moderate" | "challenging") || 'easy',
            bestSeason: itineraryData.best_season || '',
            estimatedBudget: itineraryData.estimated_budget || '',
            category: itineraryData.category || 'cultural',
            featured: itineraryData.featured || false,
            minParticipants: itineraryData.min_participants || 1,
            maxParticipants: itineraryData.max_participants || 20,
            days,
            createdAt: itineraryData.created_at,
            updatedAt: itineraryData.updated_at
        };
    } catch (error) {
        console.error('Error in getItineraryById:', error);
        return null;
    }
};

export const getFeaturedItineraries = async (limit: number = 3): Promise<Itinerary[]> => {
    try {
        const { data: itinerariesData, error: itinerariesError } = await supabase
            .from('itineraries')
            .select('*')
            .eq('status', 'published')
            .eq('featured', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (itinerariesError) {
            console.error('Error fetching featured itineraries:', itinerariesError);
            throw itinerariesError;
        }

        if (!itinerariesData || itinerariesData.length === 0) {
            return [];
        }

        // Transform each itinerary (simplified version for featured)
        const itineraries: Itinerary[] = itinerariesData.map((itinerary: ItineraryRow) => ({
            id: itinerary.id,
            slug: itinerary.slug,
            title: itinerary.title,
            duration: itinerary.duration,
            description: itinerary.description,
            imageUrl: itinerary.image_url,
            images: [itinerary.image_url],
            destinations: [], // Will be populated if needed
            difficulty: (itinerary.difficulty as "easy" | "moderate" | "challenging") || 'easy',
            bestSeason: itinerary.best_season || '',
            estimatedBudget: itinerary.estimated_budget || '',
            category: itinerary.category || 'cultural',
            featured: itinerary.featured || false,
            minParticipants: itinerary.min_participants || 1,
            maxParticipants: itinerary.max_participants || 20,
            days: [], // Will be populated if needed
            createdAt: itinerary.created_at,
            updatedAt: itinerary.updated_at
        }));

        return itineraries;
    } catch (error) {
        console.error('Error in getFeaturedItineraries:', error);
        throw error;
    }
};
