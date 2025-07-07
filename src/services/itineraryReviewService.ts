import { supabase } from '../config/supabaseClient';

export interface ItineraryReviewData {
    itinerary_id: string;
    user_id: string;
    rating: number;
    comment?: string;
}

export interface ItineraryReview {
    id: string;
    itinerary_id: string;
    user_id: string;
    rating: number;
    comment?: string;
    helpful_count: number;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        first_name: string;
        last_name: string;
        profile_picture?: string;
    };
}

export interface ItineraryReviewStats {
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

// Create new itinerary review
export const createItineraryReview = async (
    reviewData: ItineraryReviewData
): Promise<ItineraryReview> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_reviews')
            .insert([reviewData])
            .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          profile_picture
        )
      `)
            .single();

        if (error) {
            console.error('Error creating itinerary review:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in createItineraryReview:', error);
        throw error;
    }
};

// Get reviews for a specific itinerary
export const getItineraryReviews = async (
    itineraryId: string,
    page: number = 1,
    limit: number = 10
): Promise<{ reviews: ItineraryReview[], total: number }> => {
    try {
        const { data, error, count } = await supabase
            .from('itinerary_reviews')
            .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          profile_picture
        )
      `, { count: 'exact' })
            .eq('itinerary_id', itineraryId)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.error('Error fetching itinerary reviews:', error);
            throw error;
        }

        return {
            reviews: data || [],
            total: count || 0
        };
    } catch (error) {
        console.error('Error in getItineraryReviews:', error);
        throw error;
    }
};

// Get review statistics for a specific itinerary
export const getItineraryReviewStats = async (
    itineraryId: string
): Promise<ItineraryReviewStats> => {
    try {
        // Get all reviews for the itinerary
        const { data: reviews, error } = await supabase
            .from('itinerary_reviews')
            .select('rating')
            .eq('itinerary_id', itineraryId);

        if (error) {
            console.error('Error fetching itinerary review stats:', error);
            throw error;
        }

        if (!reviews || reviews.length === 0) {
            return {
                average_rating: 0,
                total_reviews: 0,
                rating_distribution: {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0
                }
            };
        }

        // Calculate statistics
        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / totalReviews;

        // Calculate rating distribution
        const ratingDistribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        reviews.forEach(review => {
            ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        });

        return {
            average_rating: Number(averageRating.toFixed(1)),
            total_reviews: totalReviews,
            rating_distribution: ratingDistribution
        };
    } catch (error) {
        console.error('Error in getItineraryReviewStats:', error);
        throw error;
    }
};

// Update itinerary review
export const updateItineraryReview = async (
    reviewId: string,
    updates: Partial<ItineraryReviewData>
): Promise<ItineraryReview> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_reviews')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', reviewId)
            .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          profile_picture
        )
      `)
            .single();

        if (error) {
            console.error('Error updating itinerary review:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in updateItineraryReview:', error);
        throw error;
    }
};

// Delete itinerary review
export const deleteItineraryReview = async (
    reviewId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_reviews')
            .delete()
            .eq('id', reviewId);

        if (error) {
            console.error('Error deleting itinerary review:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteItineraryReview:', error);
        throw error;
    }
};

// Get user's reviews
export const getUserItineraryReviews = async (
    userId: string
): Promise<ItineraryReview[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_reviews')
            .select(`
        *,
        itineraries (
          id,
          title,
          image_url
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user itinerary reviews:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUserItineraryReviews:', error);
        throw error;
    }
};

// Check if user has already reviewed an itinerary
export const hasUserReviewedItinerary = async (
    userId: string,
    itineraryId: string
): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_reviews')
            .select('id')
            .eq('user_id', userId)
            .eq('itinerary_id', itineraryId)
            .limit(1);

        if (error) {
            console.error('Error checking if user has reviewed itinerary:', error);
            throw error;
        }

        return data && data.length > 0;
    } catch (error) {
        console.error('Error in hasUserReviewedItinerary:', error);
        throw error;
    }
};

// Increment helpful count for a review
export const incrementReviewHelpfulCount = async (
    reviewId: string
): Promise<void> => {
    try {
        // First get the current helpful count
        const { data: currentReview, error: fetchError } = await supabase
            .from('itinerary_reviews')
            .select('helpful_count')
            .eq('id', reviewId)
            .single();

        if (fetchError) {
            console.error('Error fetching current review:', fetchError);
            throw fetchError;
        }

        // Then increment it
        const { error } = await supabase
            .from('itinerary_reviews')
            .update({
                helpful_count: (currentReview.helpful_count || 0) + 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', reviewId);

        if (error) {
            console.error('Error incrementing review helpful count:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in incrementReviewHelpfulCount:', error);
        throw error;
    }
};

// Get recent reviews (for dashboard/admin)
export const getRecentItineraryReviews = async (
    limit: number = 5
): Promise<ItineraryReview[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_reviews')
            .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          profile_picture
        ),
        itineraries (
          id,
          title,
          image_url
        )
      `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent itinerary reviews:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getRecentItineraryReviews:', error);
        throw error;
    }
};

// Get top rated itineraries
export const getTopRatedItineraries = async (
    limit: number = 10
): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_reviews')
            .select(`
        itinerary_id,
        rating,
        itineraries (
          id,
          title,
          image_url,
          duration,
          description
        )
      `)
            .order('rating', { ascending: false })
            .limit(limit * 3); // Get more to calculate averages

        if (error) {
            console.error('Error fetching top rated itineraries:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Group by itinerary and calculate average ratings
        const itineraryRatings = data.reduce((acc, review) => {
            const itineraryId = review.itinerary_id;
            if (!acc[itineraryId]) {
                acc[itineraryId] = {
                    itinerary: review.itineraries,
                    ratings: [],
                    totalRating: 0,
                    count: 0
                };
            }
            acc[itineraryId].ratings.push(review.rating);
            acc[itineraryId].totalRating += review.rating;
            acc[itineraryId].count++;
            return acc;
        }, {} as any);

        // Calculate averages and sort
        const topRated = Object.values(itineraryRatings)
            .map((item: any) => ({
                ...item.itinerary,
                average_rating: item.totalRating / item.count,
                review_count: item.count
            }))
            .sort((a: any, b: any) => b.average_rating - a.average_rating)
            .slice(0, limit);

        return topRated;
    } catch (error) {
        console.error('Error in getTopRatedItineraries:', error);
        throw error;
    }
};
