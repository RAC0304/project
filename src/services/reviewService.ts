import { supabase } from '../utils/supabaseClient';

export interface DestinationReview {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title: string;
    content: string;
    date: string;
    helpfulCount: number;
    isVerified: boolean;
    images?: string[];
    tourGuide?: {
        id: string;
        name: string;
        avatar?: string;
        specialty: string;
    };
}

/**
 * Get reviews for a specific destination
 */
export const getDestinationReviews = async (destinationId: string): Promise<DestinationReview[]> => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
        *,
        users!reviews_user_id_fkey(
          id,
          first_name,
          last_name,
          profile_picture
        ),
        tour_guides(
          id,
          profile_picture,
          user_id,
          specialties,
          users!tour_guides_user_id_fkey(
            first_name,
            last_name
          )
        ),
        review_images(image_url)
      `)
            .eq('destination_id', destinationId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching destination reviews:', error);
            throw new Error(`Failed to fetch reviews: ${error.message}`);
        }

        if (!data) {
            return [];
        }

        // Transform the data to match our interface
        const reviews: DestinationReview[] = data.map((review: any) => ({
            id: review.id.toString(),
            userId: review.user_id.toString(),
            userName: review.users ? `${review.users.first_name} ${review.users.last_name}` : 'Anonymous',
            userAvatar: review.users?.profile_picture || undefined,
            rating: review.rating,
            title: review.title,
            content: review.content,
            date: new Date(review.created_at).toLocaleDateString('id-ID'),
            helpfulCount: review.helpful_count || 0,
            isVerified: review.is_verified || false,
            images: review.review_images?.map((img: any) => img.image_url) || [],
            tourGuide: review.tour_guides ? {
                id: review.tour_guides.id.toString(),
                name: review.tour_guides.users ?
                    `${review.tour_guides.users.first_name} ${review.tour_guides.users.last_name}` :
                    'Tour Guide',
                avatar: review.tour_guides.profile_picture || undefined,
                specialty: Array.isArray(review.tour_guides.specialties) ?
                    review.tour_guides.specialties.join(', ') :
                    review.tour_guides.specialties || 'Tour Guide'
            } : undefined
        }));

        return reviews;

    } catch (error) {
        console.error('Error in getDestinationReviews:', error);
        throw error;
    }
};

/**
 * Get average rating for a destination
 */
export const getDestinationRating = async (destinationId: string): Promise<{ averageRating: number; totalReviews: number }> => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('destination_id', destinationId);

        if (error) {
            console.error('Error fetching destination rating:', error);
            return { averageRating: 0, totalReviews: 0 };
        }

        if (!data || data.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }

        const totalReviews = data.length;
        const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / totalReviews;

        return {
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            totalReviews
        };

    } catch (error) {
        console.error('Error in getDestinationRating:', error);
        return { averageRating: 0, totalReviews: 0 };
    }
};

/**
 * Add a helpful vote to a review
 */
export const markReviewHelpful = async (reviewId: string): Promise<boolean> => {
    try {
        const { error } = await supabase.rpc('increment_review_helpful_count', {
            review_id: parseInt(reviewId)
        });

        if (error) {
            console.error('Error marking review helpful:', error);
            return false;
        }

        return true;

    } catch (error) {
        console.error('Error in markReviewHelpful:', error);
        return false;
    }
};

/**
 * Submit a new review for a destination
 */
export const submitDestinationReview = async (
    destinationId: string,
    userId: string,
    rating: number,
    title: string,
    content: string,
    images?: string[]
): Promise<boolean> => {
    try {
        // Insert the review
        const { data: reviewData, error: reviewError } = await supabase
            .from('reviews')
            .insert({
                destination_id: parseInt(destinationId),
                user_id: parseInt(userId),
                rating,
                title,
                content,
                helpful_count: 0,
                is_verified: false
            })
            .select()
            .single();

        if (reviewError) {
            console.error('Error submitting review:', reviewError);
            return false;
        }

        // Insert review images if provided
        if (images && images.length > 0 && reviewData) {
            const imageInserts = images.map(imageUrl => ({
                review_id: reviewData.id,
                image_url: imageUrl
            }));

            const { error: imageError } = await supabase
                .from('review_images')
                .insert(imageInserts);

            if (imageError) {
                console.error('Error submitting review images:', imageError);
                // Don't return false here as the review was still submitted successfully
            }
        }

        return true;

    } catch (error) {
        console.error('Error in submitDestinationReview:', error);
        return false;
    }
};
