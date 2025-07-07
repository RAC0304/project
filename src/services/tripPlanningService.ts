import { supabase } from '../config/supabaseClient';
import { ItineraryRequest } from './itineraryBookingService';

// Fetch all trip planning requests for a tour guide by tour_guide_id
export const getTripRequestsByGuideId = async (tourGuideId: number) => {

    // FIX: Remove ambiguous users join, just select email and name directly
    const { data, error } = await supabase
        .from('itinerary_requests')
        .select(`*, itineraries (id, title, duration, image_url)`) // remove users join
        .eq('tour_guide_id', tourGuideId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getTripRequestsByGuideId] Error:', error);
        return [];
    }
    return data as ItineraryRequest[];
};
