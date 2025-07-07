import { supabase } from '../config/supabaseClient';
import { Itinerary } from '../types';

interface ItineraryRow {
    id: number;
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
    id: number;
    itinerary_id: number;
    day_number: number;
    title: string;
    description: string;
    accommodation: string;
    meals: string;
    transportation: string;
}

interface ItineraryActivity {
    id: number;
    itinerary_day_id: number;
    time_start: string;
    title: string;
    description: string;
    location: string;
    duration_minutes: number;
    optional: boolean;
    order_index: number;
}

interface ItineraryDestination {
    id: number;
    itinerary_id: number;
    destination_id: number;
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
        console.log('🔍 Fetching itinerary with ID:', id);

        // Convert string ID to number for the query
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            console.log('❌ Invalid ID format:', id);
            return null;
        }

        const { data: itineraryData, error: itineraryError } = await supabase
            .from('itineraries')
            .select('*')
            .eq('id', numericId)
            .eq('status', 'published')
            .single();

        if (itineraryError) {
            console.error('❌ Error fetching itinerary by ID:', itineraryError);
            return null;
        }

        if (!itineraryData) {
            console.log('❌ No itinerary found with ID:', id);
            return null;
        }

        console.log('✅ Found itinerary by ID:', itineraryData.title);
        const result = await buildCompleteItinerary(itineraryData);
        console.log('✅ Complete itinerary built with', result.days.length, 'days');
        return result;
    } catch (error) {
        console.error('Error in getItineraryById:', error);
        return null;
    }
};

export const getItineraryBySlug = async (slug: string): Promise<Itinerary | null> => {
    try {
        console.log('🔍 Fetching itinerary with slug:', slug);

        const { data: itineraryData, error: itineraryError } = await supabase
            .from('itineraries')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (itineraryError) {
            console.error('❌ Error fetching itinerary by slug:', itineraryError);
            return null;
        }

        if (!itineraryData) {
            console.log('❌ No itinerary found with slug:', slug);
            return null;
        }

        console.log('✅ Found itinerary:', itineraryData.title);
        const result = await buildCompleteItinerary(itineraryData);
        console.log('✅ Complete itinerary built with', result.days.length, 'days');
        return result;
    } catch (error) {
        console.error('❌ Error in getItineraryBySlug:', error);
        return null;
    }
};

// Helper function to build complete itinerary data
const buildCompleteItinerary = async (itineraryData: ItineraryRow): Promise<Itinerary> => {
    const id = itineraryData.id;

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

    // Get tour guides (join itinerary_tour_guides and tour_guides)
    const { data: tourGuidesData, error: tourGuidesError } = await supabase
        .from('itinerary_tour_guides')
        .select(`
            tour_guide_id,
            tour_guides (
                id,
                user_id,
                bio,
                specialties,
                location,
                short_bio,
                experience,
                rating,
                review_count,
                availability,
                is_verified,
                profile_picture,
                created_at,
                updated_at,
                users (
                    first_name,
                    last_name
                )
            )
        `)
        .eq('itinerary_id', id);
    if (tourGuidesError) {
        console.error('Error fetching itinerary tour guides:', tourGuidesError);
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

    // Transform tour guides
    const tourGuides = (tourGuidesData || []).map((row: any) => {
        const tg = row.tour_guides;
        return {
            id: tg.id,
            name: tg.users ? `${tg.users.first_name} ${tg.users.last_name}` : '',
            bio: tg.bio,
            specialties: tg.specialties,
            location: tg.location,
            shortBio: tg.short_bio,
            experience: tg.experience,
            rating: tg.rating,
            reviewCount: tg.review_count,
            availability: tg.availability,
            isVerified: tg.is_verified,
            imageUrl: tg.profile_picture || tg.users?.profile_picture || tg.image_url || '',
        };
    });

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
        updatedAt: itineraryData.updated_at,
        tourGuides,
    };
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

// Search itineraries
export const searchItineraries = async (
    query: string,
    filters?: {
        category?: string;
        difficulty?: string;
        duration?: string;
        minBudget?: number;
        maxBudget?: number;
    }
): Promise<Itinerary[]> => {
    try {
        let supabaseQuery = supabase
            .from('itineraries')
            .select('*')
            .eq('status', 'published');

        // Add text search
        if (query) {
            supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
        }

        // Apply filters
        if (filters?.category) {
            supabaseQuery = supabaseQuery.eq('category', filters.category);
        }
        if (filters?.difficulty) {
            supabaseQuery = supabaseQuery.eq('difficulty', filters.difficulty);
        }

        const { data: itinerariesData, error } = await supabaseQuery
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error searching itineraries:', error);
            throw error;
        }

        if (!itinerariesData || itinerariesData.length === 0) {
            return [];
        }

        // Transform each itinerary (simplified version for search results)
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
        console.error('Error in searchItineraries:', error);
        throw error;
    }
};

// Get itineraries by category
export const getItinerariesByCategory = async (
    category: string,
    limit: number = 10
): Promise<Itinerary[]> => {
    try {
        const { data: itinerariesData, error } = await supabase
            .from('itineraries')
            .select('*')
            .eq('status', 'published')
            .eq('category', category)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching itineraries by category:', error);
            throw error;
        }

        if (!itinerariesData || itinerariesData.length === 0) {
            return [];
        }

        // Transform each itinerary (simplified version)
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
        console.error('Error in getItinerariesByCategory:', error);
        throw error;
    }
};

// Get related itineraries (similar category, difficulty, or destinations)
export const getRelatedItineraries = async (
    itineraryId: string,
    limit: number = 4
): Promise<Itinerary[]> => {
    try {
        // First get the current itinerary details
        const { data: currentItinerary, error: currentError } = await supabase
            .from('itineraries')
            .select('category, difficulty')
            .eq('id', itineraryId)
            .single();

        if (currentError) {
            console.error('Error fetching current itinerary:', currentError);
            throw currentError;
        }

        // Get related itineraries
        const { data: relatedData, error: relatedError } = await supabase
            .from('itineraries')
            .select('*')
            .eq('status', 'published')
            .neq('id', itineraryId)
            .or(`category.eq.${currentItinerary.category},difficulty.eq.${currentItinerary.difficulty}`)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (relatedError) {
            console.error('Error fetching related itineraries:', relatedError);
            throw relatedError;
        }

        if (!relatedData || relatedData.length === 0) {
            // If no related found, get some random published itineraries
            const { data: randomData, error: randomError } = await supabase
                .from('itineraries')
                .select('*')
                .eq('status', 'published')
                .neq('id', itineraryId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (randomError) {
                console.error('Error fetching random itineraries:', randomError);
                throw randomError;
            }

            return randomData?.map((itinerary: ItineraryRow) => ({
                id: itinerary.id,
                slug: itinerary.slug,
                title: itinerary.title,
                duration: itinerary.duration,
                description: itinerary.description,
                imageUrl: itinerary.image_url,
                images: [itinerary.image_url],
                destinations: [],
                difficulty: (itinerary.difficulty as "easy" | "moderate" | "challenging") || 'easy',
                bestSeason: itinerary.best_season || '',
                estimatedBudget: itinerary.estimated_budget || '',
                category: itinerary.category || 'cultural',
                featured: itinerary.featured || false,
                minParticipants: itinerary.min_participants || 1,
                maxParticipants: itinerary.max_participants || 20,
                days: [],
                createdAt: itinerary.created_at,
                updatedAt: itinerary.updated_at
            })) || [];
        }

        // Transform related itineraries
        const relatedItineraries: Itinerary[] = relatedData.map((itinerary: ItineraryRow) => ({
            id: itinerary.id,
            slug: itinerary.slug,
            title: itinerary.title,
            duration: itinerary.duration,
            description: itinerary.description,
            imageUrl: itinerary.image_url,
            images: [itinerary.image_url],
            destinations: [],
            difficulty: (itinerary.difficulty as "easy" | "moderate" | "challenging") || 'easy',
            bestSeason: itinerary.best_season || '',
            estimatedBudget: itinerary.estimated_budget || '',
            category: itinerary.category || 'cultural',
            featured: itinerary.featured || false,
            minParticipants: itinerary.min_participants || 1,
            maxParticipants: itinerary.max_participants || 20,
            days: [],
            createdAt: itinerary.created_at,
            updatedAt: itinerary.updated_at
        }));

        return relatedItineraries;
    } catch (error) {
        console.error('Error in getRelatedItineraries:', error);
        throw error;
    }
};
