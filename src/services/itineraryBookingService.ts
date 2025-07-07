import { supabase } from '../config/supabaseClient';

export interface ItineraryBookingData {
    itinerary_id: string | number;
    user_id: string | number;
    tour_guide_id?: string | number;
    participants: number;
    start_date: string;
    end_date: string;
    total_price?: number;
    currency?: string;
    special_requests?: string;
    contact_email: string;
    contact_phone: string;
}

export interface ItineraryRequestData {
    user_id: string | number;
    itinerary_id: string | number;
    tour_guide_id?: string | number;
    name: string;
    email: string;
    phone?: string;
    start_date: string;
    end_date: string;
    group_size: string;
    additional_requests?: string;
}

export interface ItineraryBooking {
    id: string;
    itinerary_id: string;
    user_id: string;
    tour_guide_id?: string;
    participants: number;
    start_date: string;
    end_date: string;
    total_price?: number;
    currency: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    special_requests?: string;
    contact_email: string;
    contact_phone: string;
    created_at: string;
    updated_at: string;
}

export interface ItineraryRequest {
    id: string;
    user_id: string;
    itinerary_id: string;
    tour_guide_id?: string;
    name: string;
    email: string;
    phone?: string;
    start_date: string;
    end_date: string;
    group_size: string;
    additional_requests?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

// Create new itinerary booking
export const createItineraryBooking = async (
    bookingData: ItineraryBookingData
): Promise<ItineraryBooking> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_bookings')
            .insert([bookingData])
            .select()
            .single();

        if (error) {
            console.error('Error creating itinerary booking:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in createItineraryBooking:', error);
        throw error;
    }
};

// Create new itinerary request
export const createItineraryRequest = async (
    requestData: ItineraryRequestData
): Promise<ItineraryRequest> => {
    try {
        console.log('Creating itinerary request with data:', requestData);

        const { data, error } = await supabase
            .from('itinerary_requests')
            .insert([requestData])
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating itinerary request:', error);

            // Handle specific RLS error
            if (error.code === '42501') {
                throw new Error('Permission denied. Please ensure you are logged in and try again. If the problem persists, contact support.');
            }

            // Handle other specific errors
            if (error.code === '23505') {
                throw new Error('A request with these details already exists.');
            }

            if (error.code === '23503') {
                throw new Error('Invalid reference data. Please check your itinerary and user information.');
            }

            // Generic error
            throw new Error(error.message || 'Failed to create booking request');
        }

        console.log('Itinerary request created successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in createItineraryRequest:', error);
        throw error;
    }
};

// Get user's itinerary bookings
export const getUserItineraryBookings = async (
    userId: string
): Promise<ItineraryBooking[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_bookings')
            .select(`
        *,
        itineraries (
          id,
          title,
          duration,
          image_url
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user itinerary bookings:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUserItineraryBookings:', error);
        throw error;
    }
};

// Get user's itinerary requests
export const getUserItineraryRequests = async (
    userId: string
): Promise<ItineraryRequest[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_requests')
            .select(`
        *,
        itineraries (
          id,
          title,
          duration,
          image_url
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user itinerary requests:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUserItineraryRequests:', error);
        throw error;
    }
};

// Update itinerary booking status
export const updateItineraryBookingStatus = async (
    bookingId: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_bookings')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (error) {
            console.error('Error updating itinerary booking status:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in updateItineraryBookingStatus:', error);
        throw error;
    }
};

// Update itinerary request status
export const updateItineraryRequestStatus = async (
    requestId: string,
    status: 'pending' | 'approved' | 'rejected'
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_requests')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId);

        if (error) {
            console.error('Error updating itinerary request status:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in updateItineraryRequestStatus:', error);
        throw error;
    }
};

// Get itinerary booking by ID
export const getItineraryBookingById = async (
    bookingId: string
): Promise<ItineraryBooking | null> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_bookings')
            .select(`
        *,
        itineraries (
          id,
          title,
          duration,
          image_url,
          description
        ),
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
            .eq('id', bookingId)
            .single();

        if (error) {
            console.error('Error fetching itinerary booking:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getItineraryBookingById:', error);
        return null;
    }
};

// Get itinerary request by ID
export const getItineraryRequestById = async (
    requestId: string
): Promise<ItineraryRequest | null> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_requests')
            .select(`
        *,
        itineraries (
          id,
          title,
          duration,
          image_url,
          description
        ),
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
            .eq('id', requestId)
            .single();

        if (error) {
            console.error('Error fetching itinerary request:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getItineraryRequestById:', error);
        return null;
    }
};

// Delete itinerary booking
export const deleteItineraryBooking = async (
    bookingId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_bookings')
            .delete()
            .eq('id', bookingId);

        if (error) {
            console.error('Error deleting itinerary booking:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteItineraryBooking:', error);
        throw error;
    }
};

// Delete itinerary request
export const deleteItineraryRequest = async (
    requestId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_requests')
            .delete()
            .eq('id', requestId);

        if (error) {
            console.error('Error deleting itinerary request:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteItineraryRequest:', error);
        throw error;
    }
};

// Get all bookings for admin (with pagination)
export const getAllItineraryBookings = async (
    page: number = 1,
    limit: number = 10,
    status?: string
): Promise<{ bookings: ItineraryBooking[], total: number }> => {
    try {
        let query = supabase
            .from('itinerary_bookings')
            .select(`
        *,
        itineraries (
          id,
          title,
          duration,
          image_url
        ),
        users (
          id,
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.error('Error fetching all itinerary bookings:', error);
            throw error;
        }

        return {
            bookings: data || [],
            total: count || 0
        };
    } catch (error) {
        console.error('Error in getAllItineraryBookings:', error);
        throw error;
    }
};

// Get all requests for admin (with pagination)
export const getAllItineraryRequests = async (
    page: number = 1,
    limit: number = 10,
    status?: string
): Promise<{ requests: ItineraryRequest[], total: number }> => {
    try {
        let query = supabase
            .from('itinerary_requests')
            .select(`
        *,
        itineraries (
          id,
          title,
          duration,
          image_url
        ),
        users (
          id,
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.error('Error fetching all itinerary requests:', error);
            throw error;
        }

        return {
            requests: data || [],
            total: count || 0
        };
    } catch (error) {
        console.error('Error in getAllItineraryRequests:', error);
        throw error;
    }
};
