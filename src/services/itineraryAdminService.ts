import { supabase } from '../config/supabaseClient';

export interface CreateItineraryData {
    slug: string;
    title: string;
    duration: string;
    description: string;
    image_url: string;
    difficulty: 'easy' | 'moderate' | 'challenging';
    best_season: string;
    estimated_budget: string;
    category?: string;
    status?: 'draft' | 'published' | 'archived';
    featured?: boolean;
    min_participants?: number;
    max_participants?: number;
    created_by: string;
}

export interface UpdateItineraryData {
    slug?: string;
    title?: string;
    duration?: string;
    description?: string;
    image_url?: string;
    difficulty?: 'easy' | 'moderate' | 'challenging';
    best_season?: string;
    estimated_budget?: string;
    category?: string;
    status?: 'draft' | 'published' | 'archived';
    featured?: boolean;
    min_participants?: number;
    max_participants?: number;
}

export interface CreateItineraryDayData {
    itinerary_id: string;
    day_number: number;
    title: string;
    description: string;
    accommodation?: string;
    meals?: string;
    transportation?: string;
}

export interface UpdateItineraryDayData {
    day_number?: number;
    title?: string;
    description?: string;
    accommodation?: string;
    meals?: string;
    transportation?: string;
}

export interface CreateItineraryActivityData {
    itinerary_day_id: string;
    time_start: string;
    title: string;
    description: string;
    location?: string;
    duration_minutes?: number;
    optional?: boolean;
    order_index?: number;
}

export interface UpdateItineraryActivityData {
    time_start?: string;
    title?: string;
    description?: string;
    location?: string;
    duration_minutes?: number;
    optional?: boolean;
    order_index?: number;
}

// Create new itinerary
export const createItinerary = async (
    itineraryData: CreateItineraryData
): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('itineraries')
            .insert([{
                ...itineraryData,
                status: itineraryData.status || 'draft',
                category: itineraryData.category || 'cultural',
                featured: itineraryData.featured || false,
                min_participants: itineraryData.min_participants || 1,
                max_participants: itineraryData.max_participants || 20
            }])
            .select('id')
            .single();

        if (error) {
            console.error('Error creating itinerary:', error);
            throw error;
        }

        return data.id;
    } catch (error) {
        console.error('Error in createItinerary:', error);
        throw error;
    }
};

// Update itinerary
export const updateItinerary = async (
    itineraryId: string,
    updates: UpdateItineraryData
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itineraries')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', String(itineraryId));

        if (error) {
            console.error('Error updating itinerary:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in updateItinerary:', error);
        throw error;
    }
};

// Delete itinerary
export const deleteItinerary = async (
    itineraryId: string
): Promise<void> => {
    try {
        // First delete all related data
        await deleteItineraryDays(itineraryId);
        await deleteItineraryDestinations(itineraryId);
        await deleteItineraryImages(itineraryId);

        // Then delete the itinerary
        const { error } = await supabase
            .from('itineraries')
            .delete()
            .eq('id', String(itineraryId));

        if (error) {
            console.error('Error deleting itinerary:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteItinerary:', error);
        throw error;
    }
};

// Create itinerary day
export const createItineraryDay = async (
    dayData: CreateItineraryDayData
): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_days')
            .insert([dayData])
            .select('id')
            .single();

        if (error) {
            console.error('Error creating itinerary day:', error);
            throw error;
        }

        return data.id;
    } catch (error) {
        console.error('Error in createItineraryDay:', error);
        throw error;
    }
};

// Update itinerary day
export const updateItineraryDay = async (
    dayId: string,
    updates: UpdateItineraryDayData
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_days')
            .update(updates)
            .eq('id', String(dayId));

        if (error) {
            console.error('Error updating itinerary day:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in updateItineraryDay:', error);
        throw error;
    }
};

// Delete itinerary day
export const deleteItineraryDay = async (
    dayId: string
): Promise<void> => {
    try {
        // First delete all activities for this day
        const { error: activitiesError } = await supabase
            .from('itinerary_activities')
            .delete()
            .eq('itinerary_day_id', dayId);

        if (activitiesError) {
            console.error('Error deleting itinerary activities:', activitiesError);
            throw activitiesError;
        }

        // Then delete the day
        const { error } = await supabase
            .from('itinerary_days')
            .delete()
            .eq('id', String(dayId));

        if (error) {
            console.error('Error deleting itinerary day:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteItineraryDay:', error);
        throw error;
    }
};

// Delete all days for an itinerary
export const deleteItineraryDays = async (
    itineraryId: string
): Promise<void> => {
    try {
        // Get all day IDs first
        const { data: days, error: daysError } = await supabase
            .from('itinerary_days')
            .select('id')
            .eq('itinerary_id', itineraryId);

        if (daysError) {
            console.error('Error fetching itinerary days:', daysError);
            throw daysError;
        }

        // Delete activities for all days
        if (days && days.length > 0) {
            const dayIds = days.map(day => day.id);
            const { error: activitiesError } = await supabase
                .from('itinerary_activities')
                .delete()
                .in('itinerary_day_id', dayIds);

            if (activitiesError) {
                console.error('Error deleting itinerary activities:', activitiesError);
                throw activitiesError;
            }
        }

        // Delete all days
        const { error } = await supabase
            .from('itinerary_days')
            .delete()
            .eq('itinerary_id', itineraryId);

        if (error) {
            console.error('Error deleting itinerary days:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteItineraryDays:', error);
        throw error;
    }
};

// Create itinerary activity
export const createItineraryActivity = async (
    activityData: CreateItineraryActivityData
): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_activities')
            .insert([{
                ...activityData,
                optional: activityData.optional || false,
                order_index: activityData.order_index || 1
            }])
            .select('id')
            .single();

        if (error) {
            console.error('Error creating itinerary activity:', error);
            throw error;
        }

        return data.id;
    } catch (error) {
        console.error('Error in createItineraryActivity:', error);
        throw error;
    }
};

// Update itinerary activity
export const updateItineraryActivity = async (
    activityId: string,
    updates: UpdateItineraryActivityData
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_activities')
            .update(updates)
            .eq('id', String(activityId));

        if (error) {
            console.error('Error updating itinerary activity:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in updateItineraryActivity:', error);
        throw error;
    }
};

// Delete itinerary activity
export const deleteItineraryActivity = async (
    activityId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_activities')
            .delete()
            .eq('id', String(activityId));

        if (error) {
            console.error('Error deleting itinerary activity:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteItineraryActivity:', error);
        throw error;
    }
};

// Add destination to itinerary
export const addDestinationToItinerary = async (
    itineraryId: string,
    destinationId: string,
    orderIndex: number = 1
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_destinations')
            .insert([{
                itinerary_id: itineraryId,
                destination_id: destinationId,
                order_index: orderIndex
            }]);

        if (error) {
            console.error('Error adding destination to itinerary:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in addDestinationToItinerary:', error);
        throw error;
    }
};

// Remove destination from itinerary
export const removeDestinationFromItinerary = async (
    itineraryId: string,
    destinationId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_destinations')
            .delete()
            .eq('itinerary_id', itineraryId)
            .eq('destination_id', destinationId);

        if (error) {
            console.error('Error removing destination from itinerary:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in removeDestinationFromItinerary:', error);
        throw error;
    }
};

// Delete all destinations for an itinerary
export const deleteItineraryDestinations = async (
    itineraryId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_destinations')
            .delete()
            .eq('itinerary_id', itineraryId);

        if (error) {
            console.error('Error deleting itinerary destinations:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteItineraryDestinations:', error);
        throw error;
    }
};

// Add image to itinerary
export const addImageToItinerary = async (
    itineraryId: string,
    imageUrl: string,
    altText?: string,
    caption?: string,
    orderIndex: number = 1
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_images')
            .insert([{
                itinerary_id: itineraryId,
                image_url: imageUrl,
                alt_text: altText,
                caption: caption,
                order_index: orderIndex
            }]);

        if (error) {
            console.error('Error adding image to itinerary:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in addImageToItinerary:', error);
        throw error;
    }
};

// Remove image from itinerary
export const removeImageFromItinerary = async (
    imageId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_images')
            .delete()
            .eq('id', String(imageId));

        if (error) {
            console.error('Error removing image from itinerary:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in removeImageFromItinerary:', error);
        throw error;
    }
};

// Delete all images for an itinerary
export const deleteItineraryImages = async (
    itineraryId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_images')
            .delete()
            .eq('itinerary_id', itineraryId);

        if (error) {
            console.error('Error deleting itinerary images:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteItineraryImages:', error);
        throw error;
    }
};

// Get all itineraries for admin (with pagination and filters)
export const getAllItinerariesForAdmin = async (
    page: number = 1,
    limit: number = 10,
    filters?: {
        status?: string;
        category?: string;
        difficulty?: string;
        featured?: boolean;
        search?: string;
    }
): Promise<{ itineraries: any[], total: number }> => {
    try {
        let query = supabase
            .from('itineraries')
            .select('*', { count: 'exact' });

        // Apply filters
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.category) {
            query = query.eq('category', filters.category);
        }
        if (filters?.difficulty) {
            query = query.eq('difficulty', filters.difficulty);
        }
        if (filters?.featured !== undefined) {
            query = query.eq('featured', filters.featured);
        }
        if (filters?.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.error('Error fetching itineraries for admin:', error);
            throw error;
        }

        return {
            itineraries: data || [],
            total: count || 0
        };
    } catch (error) {
        console.error('Error in getAllItinerariesForAdmin:', error);
        throw error;
    }
};

// Duplicate itinerary
export const duplicateItinerary = async (
    itineraryId: string,
    newTitle: string,
    newSlug: string
): Promise<string> => {
    try {
        // Get original itinerary
        const { data: originalItinerary, error: fetchError } = await supabase
            .from('itineraries')
            .select('*')
            .eq('id', itineraryId)
            .single();

        if (fetchError) {
            console.error('Error fetching original itinerary:', fetchError);
            throw fetchError;
        }

        // Create new itinerary
        const newItineraryId = await createItinerary({
            ...originalItinerary,
            title: newTitle,
            slug: newSlug,
            status: 'draft'
        });

        // Get and duplicate days
        const { data: originalDays, error: daysError } = await supabase
            .from('itinerary_days')
            .select('*')
            .eq('itinerary_id', itineraryId)
            .order('day_number', { ascending: true });

        if (daysError) {
            console.error('Error fetching original days:', daysError);
            throw daysError;
        }

        if (originalDays && originalDays.length > 0) {
            for (const day of originalDays) {
                const newDayId = await createItineraryDay({
                    itinerary_id: newItineraryId,
                    day_number: day.day_number,
                    title: day.title,
                    description: day.description,
                    accommodation: day.accommodation,
                    meals: day.meals,
                    transportation: day.transportation
                });

                // Get and duplicate activities
                const { data: originalActivities, error: activitiesError } = await supabase
                    .from('itinerary_activities')
                    .select('*')
                    .eq('itinerary_day_id', day.id)
                    .order('order_index', { ascending: true });

                if (activitiesError) {
                    console.error('Error fetching original activities:', activitiesError);
                    throw activitiesError;
                }

                if (originalActivities && originalActivities.length > 0) {
                    for (const activity of originalActivities) {
                        await createItineraryActivity({
                            itinerary_day_id: newDayId,
                            time_start: activity.time_start,
                            title: activity.title,
                            description: activity.description,
                            location: activity.location,
                            duration_minutes: activity.duration_minutes,
                            optional: activity.optional,
                            order_index: activity.order_index
                        });
                    }
                }
            }
        }

        return newItineraryId;
    } catch (error) {
        console.error('Error in duplicateItinerary:', error);
        throw error;
    }
};
