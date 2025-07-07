import { supabase } from '../config/supabaseClient';

export interface ItineraryTag {
    id: string;
    name: string;
    created_at: string;
}

export interface ItineraryTagRelation {
    id: string;
    itinerary_id: string;
    tag_id: string;
    tag?: ItineraryTag;
}

// Get all tags
export const getAllTags = async (): Promise<ItineraryTag[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_tags')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching tags:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getAllTags:', error);
        throw error;
    }
};

// Create new tag
export const createTag = async (name: string): Promise<ItineraryTag> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_tags')
            .insert([{ name: name.toLowerCase().trim() }])
            .select()
            .single();

        if (error) {
            console.error('Error creating tag:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in createTag:', error);
        throw error;
    }
};

// Get or create tag by name
export const getOrCreateTag = async (name: string): Promise<ItineraryTag> => {
    try {
        const cleanName = name.toLowerCase().trim();

        // Try to find existing tag
        const { data: existingTag, error: findError } = await supabase
            .from('itinerary_tags')
            .select('*')
            .eq('name', cleanName)
            .single();

        if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error finding tag:', findError);
            throw findError;
        }

        if (existingTag) {
            return existingTag;
        }

        // Create new tag if not found
        return await createTag(cleanName);
    } catch (error) {
        console.error('Error in getOrCreateTag:', error);
        throw error;
    }
};

// Delete tag
export const deleteTag = async (tagId: string): Promise<void> => {
    try {
        // First delete all relations
        const { error: relationsError } = await supabase
            .from('itinerary_tag_relations')
            .delete()
            .eq('tag_id', tagId);

        if (relationsError) {
            console.error('Error deleting tag relations:', relationsError);
            throw relationsError;
        }

        // Then delete the tag
        const { error } = await supabase
            .from('itinerary_tags')
            .delete()
            .eq('id', String(tagId));

        if (error) {
            console.error('Error deleting tag:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteTag:', error);
        throw error;
    }
};

// Get tags for a specific itinerary
export const getItineraryTags = async (itineraryId: string): Promise<ItineraryTag[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_tag_relations')
            .select(`
        *,
        itinerary_tags (
          id,
          name,
          created_at
        )
      `)
            .eq('itinerary_id', itineraryId);

        if (error) {
            console.error('Error fetching itinerary tags:', error);
            throw error;
        }

        return data?.map((relation: any) => relation.itinerary_tags) || [];
    } catch (error) {
        console.error('Error in getItineraryTags:', error);
        throw error;
    }
};

// Add tag to itinerary
export const addTagToItinerary = async (
    itineraryId: string,
    tagName: string
): Promise<void> => {
    try {
        // Get or create the tag
        const tag = await getOrCreateTag(tagName);

        // Check if relation already exists
        const { data: existingRelation, error: checkError } = await supabase
            .from('itinerary_tag_relations')
            .select('id')
            .eq('itinerary_id', itineraryId)
            .eq('tag_id', tag.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing relation:', checkError);
            throw checkError;
        }

        if (existingRelation) {
            // Relation already exists
            return;
        }

        // Create new relation
        const { error } = await supabase
            .from('itinerary_tag_relations')
            .insert([{
                itinerary_id: itineraryId,
                tag_id: tag.id
            }]);

        if (error) {
            console.error('Error adding tag to itinerary:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in addTagToItinerary:', error);
        throw error;
    }
};

// Remove tag from itinerary
export const removeTagFromItinerary = async (
    itineraryId: string,
    tagId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_tag_relations')
            .delete()
            .eq('itinerary_id', itineraryId)
            .eq('tag_id', tagId);

        if (error) {
            console.error('Error removing tag from itinerary:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in removeTagFromItinerary:', error);
        throw error;
    }
};

// Set tags for itinerary (replace all existing tags)
export const setItineraryTags = async (
    itineraryId: string,
    tagNames: string[]
): Promise<void> => {
    try {
        // First, remove all existing tags
        const { error: removeError } = await supabase
            .from('itinerary_tag_relations')
            .delete()
            .eq('itinerary_id', itineraryId);

        if (removeError) {
            console.error('Error removing existing tags:', removeError);
            throw removeError;
        }

        // Then add new tags
        if (tagNames.length > 0) {
            const tagPromises = tagNames.map(tagName => getOrCreateTag(tagName));
            const tags = await Promise.all(tagPromises);

            const relations = tags.map(tag => ({
                itinerary_id: itineraryId,
                tag_id: tag.id
            }));

            const { error: insertError } = await supabase
                .from('itinerary_tag_relations')
                .insert(relations);

            if (insertError) {
                console.error('Error inserting new tag relations:', insertError);
                throw insertError;
            }
        }
    } catch (error) {
        console.error('Error in setItineraryTags:', error);
        throw error;
    }
};

// Get itineraries by tag
export const getItinerariesByTag = async (
    tagName: string,
    limit: number = 10
): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_tag_relations')
            .select(`
        *,
        itineraries (
          id,
          slug,
          title,
          duration,
          description,
          image_url,
          difficulty,
          best_season,
          estimated_budget,
          category,
          featured,
          status
        ),
        itinerary_tags (
          name
        )
      `)
            .eq('itinerary_tags.name', tagName.toLowerCase().trim())
            .eq('itineraries.status', 'published')
            .limit(limit);

        if (error) {
            console.error('Error fetching itineraries by tag:', error);
            throw error;
        }

        return data?.map((relation: any) => relation.itineraries) || [];
    } catch (error) {
        console.error('Error in getItinerariesByTag:', error);
        throw error;
    }
};

// Get popular tags (most used)
export const getPopularTags = async (limit: number = 10): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_tag_relations')
            .select(`
        tag_id,
        itinerary_tags (
          id,
          name,
          created_at
        )
      `);

        if (error) {
            console.error('Error fetching popular tags:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Count tag usage
        const tagCounts = data.reduce((acc, relation) => {
            const tagId = relation.tag_id;
            if (!acc[tagId]) {
                acc[tagId] = {
                    tag: relation.itinerary_tags,
                    count: 0
                };
            }
            acc[tagId].count++;
            return acc;
        }, {} as any);

        // Sort by count and return top tags
        return Object.values(tagCounts)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, limit)
            .map((item: any) => ({
                ...item.tag,
                usage_count: item.count
            }));
    } catch (error) {
        console.error('Error in getPopularTags:', error);
        throw error;
    }
};

// Search tags
export const searchTags = async (query: string, limit: number = 10): Promise<ItineraryTag[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_tags')
            .select('*')
            .ilike('name', `%${query.toLowerCase().trim()}%`)
            .order('name', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('Error searching tags:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in searchTags:', error);
        throw error;
    }
};
