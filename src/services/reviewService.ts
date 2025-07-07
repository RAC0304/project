import { supabase } from "../utils/supabaseClient";
import { BookingStatusService } from "./bookingStatusService";

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

export interface BookingReviewData {
  userId: number;
  bookingId: number;
  tourGuideId: number;
  destinationId?: number;
  rating: number;
  title: string;
  content: string;
  tags?: string[];
  images?: string[];
}

export interface ReviewWithDetails {
  id: number;
  user_id: number;
  booking_id: number;
  tour_guide_id: number;
  destination_id?: number;
  rating: number;
  title: string;
  content: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  bookings?: {
    date: string;
    tours?: {
      title: string;
      location: string;
    };
  };
  tour_guides?: {
    users?: {
      first_name: string;
      last_name: string;
      profile_picture?: string;
    };
  };
  review_tags?: Array<{
    tag: string;
  }>;
  review_images?: Array<{
    image_url: string;
  }>;
}

/**
 * Get reviews for a specific destination
 */
export const getDestinationReviews = async (
  destinationId: string
): Promise<DestinationReview[]> => {
  try {
    // First, get the numeric destination ID if a slug is provided
    let numericDestinationId: number;

    if (/^\d+$/.test(destinationId)) {
      // If it's already a number, use it directly
      numericDestinationId = parseInt(destinationId);
    } else {
      // If it's a slug, look up the numeric ID
      const { data: destinationData, error: destinationError } = await supabase
        .from("destinations")
        .select("id")
        .eq("slug", destinationId)
        .single();

      if (destinationError || !destinationData) {
        console.error("Error fetching destination ID:", destinationError);
        return [];
      }

      numericDestinationId = destinationData.id;
    }

    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
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
      `
      )
      .eq("destination_id", numericDestinationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching destination reviews:", error);
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Transform the data to match our interface
    const reviews: DestinationReview[] = data.map((review: any) => ({
      id: review.id.toString(),
      userId: review.user_id.toString(),
      userName: review.users
        ? `${review.users.first_name} ${review.users.last_name}`
        : "Anonymous",
      userAvatar: review.users?.profile_picture || undefined,
      rating: review.rating,
      title: review.title,
      content: review.content,
      date: new Date(review.created_at).toLocaleDateString("id-ID"),
      helpfulCount: review.helpful_count || 0,
      isVerified: review.is_verified || false,
      images: review.review_images?.map((img: any) => img.image_url) || [],
      tourGuide: review.tour_guides
        ? {
          id: review.tour_guides.id.toString(),
          name: review.tour_guides.users
            ? `${review.tour_guides.users.first_name} ${review.tour_guides.users.last_name}`
            : "Tour Guide",
          avatar: review.tour_guides.profile_picture || undefined,
          specialty: (() => {
            const specialties = review.tour_guides.specialties;
            if (Array.isArray(specialties)) {
              return specialties.join(", ");
            } else if (typeof specialties === 'object' && specialties !== null) {
              // Handle object specialty like {nature: true, culture: true, adventure: true, photography: true}
              return Object.keys(specialties).filter(key => specialties[key]).join(", ");
            } else if (typeof specialties === 'string') {
              return specialties;
            }
            return "Tour Guide";
          })(),
        }
        : undefined,
    }));

    return reviews;
  } catch (error) {
    console.error("Error in getDestinationReviews:", error);
    throw error;
  }
};

/**
 * Get average rating for a destination
 */
export const getDestinationRating = async (
  destinationId: string
): Promise<{ averageRating: number; totalReviews: number }> => {
  try {
    // First, get the numeric destination ID if a slug is provided
    let numericDestinationId: number;

    if (/^\d+$/.test(destinationId)) {
      // If it's already a number, use it directly
      numericDestinationId = parseInt(destinationId);
    } else {
      // If it's a slug, look up the numeric ID
      const { data: destinationData, error: destinationError } = await supabase
        .from("destinations")
        .select("id")
        .eq("slug", destinationId)
        .single();

      if (destinationError || !destinationData) {
        console.error("Error fetching destination ID:", destinationError);
        return { averageRating: 0, totalReviews: 0 };
      }

      numericDestinationId = destinationData.id;
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("destination_id", numericDestinationId);

    if (error) {
      console.error("Error fetching destination rating:", error);
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
      totalReviews,
    };
  } catch (error) {
    console.error("Error in getDestinationRating:", error);
    return { averageRating: 0, totalReviews: 0 };
  }
};

/**
 * Add a helpful vote to a review
 */
export const markReviewHelpful = async (reviewId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc("increment_review_helpful_count", {
      review_id: parseInt(reviewId),
    });

    if (error) {
      console.error("Error marking review helpful:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in markReviewHelpful:", error);
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
      .from("reviews")
      .insert({
        destination_id: parseInt(destinationId),
        user_id: parseInt(userId),
        rating,
        title,
        content,
        helpful_count: 0,
        is_verified: false,
      })
      .select()
      .single();

    if (reviewError) {
      console.error("Error submitting review:", reviewError);
      return false;
    }

    // Insert review images if provided
    if (images && images.length > 0 && reviewData) {
      const imageInserts = images.map((imageUrl) => ({
        review_id: reviewData.id,
        image_url: imageUrl,
      }));

      const { error: imageError } = await supabase
        .from("review_images")
        .insert(imageInserts);

      if (imageError) {
        console.error("Error submitting review images:", imageError);
        // Don't return false here as the review was still submitted successfully
      }
    }

    return true;
  } catch (error) {
    console.error("Error in submitDestinationReview:", error);
    return false;
  }
};

/**
 * Submit a new review for a booking
 */
export const submitBookingReview = async (
  reviewData: BookingReviewData
): Promise<boolean> => {
  try {
    const {
      userId,
      bookingId,
      tourGuideId,
      destinationId,
      rating,
      title,
      content,
      images,
    } = reviewData;

    // Insert the review
    const { data: reviewInsertData, error: reviewInsertError } = await supabase
      .from("reviews")
      .insert({
        user_id: userId,
        booking_id: bookingId,
        tour_guide_id: tourGuideId,
        destination_id: destinationId,
        rating,
        title,
        content,
        is_verified: false,
      })
      .select()
      .single();

    if (reviewInsertError) {
      console.error("Error submitting booking review:", reviewInsertError);
      return false;
    }

    // Insert review images if provided
    if (images && images.length > 0 && reviewInsertData) {
      const imageInserts = images.map((imageUrl) => ({
        review_id: reviewInsertData.id,
        image_url: imageUrl,
      }));

      const { error: imageError } = await supabase
        .from("review_images")
        .insert(imageInserts);

      if (imageError) {
        console.error("Error submitting review images:", imageError);
        // Don't return false here as the review was still submitted successfully
      }
    }

    return true;
  } catch (error) {
    console.error("Error in submitBookingReview:", error);
    return false;
  }
};

/**
 * Create review from booking (main function for booking system)
 */
export const createBookingReview = async (reviewData: BookingReviewData) => {
  const {
    userId,
    bookingId,
    tourGuideId,
    destinationId,
    rating,
    title,
    content,
    tags = [],
    images = [],
  } = reviewData;

  // Validate if user can review
  const canReview = await BookingStatusService.canReview(userId, bookingId);
  if (!canReview) {
    throw new Error("You are not eligible to review this booking");
  }

  // Insert review
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .insert({
      user_id: userId,
      booking_id: bookingId,
      tour_guide_id: tourGuideId,
      destination_id: destinationId,
      rating,
      title,
      content,
      is_verified: true, // karena dari booking yang valid
    })
    .select()
    .single();

  if (reviewError) {
    console.error("Error creating booking review:", reviewError);
    throw new Error(`Failed to create review: ${reviewError.message}`);
  }

  // Insert review tags
  if (tags.length > 0) {
    const tagInserts = tags.map((tag) => ({
      review_id: review.id,
      tag,
    }));

    const { error: tagsError } = await supabase
      .from("review_tags")
      .insert(tagInserts);

    if (tagsError) {
      console.error("Error inserting review tags:", tagsError);
      // Don't throw error, tags are optional
    }
  }

  // Insert review images
  if (images.length > 0) {
    const imageInserts = images.map((imageUrl) => ({
      review_id: review.id,
      image_url: imageUrl,
    }));

    const { error: imagesError } = await supabase
      .from("review_images")
      .insert(imageInserts);

    if (imagesError) {
      console.error("Error inserting review images:", imagesError);
      // Don't throw error, images are optional
    }
  }

  return review;
};

/**
 * Get user's reviews from bookings
 */
export const getUserBookingReviews = async (
  userId: number
): Promise<ReviewWithDetails[]> => {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      bookings (
        date,
        tours (
          title,
          location
        )
      ),
      tour_guides (
        users (
          first_name,
          last_name
        )
      ),
      review_tags (
        tag
      ),
      review_images (
        image_url
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!data) return [];

  const reviews: ReviewWithDetails[] = data.map(
    (review: {
      id: number;
      user_id: number;
      booking_id: number;
      tour_guide_id: number;
      destination_id?: number;
      rating: number;
      title: string;
      content: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
      bookings?: {
        date: string;
        tours?: {
          title: string;
          location: string;
        };
      };
      tour_guides?: {
        users?: {
          first_name: string;
          last_name: string;
        };
      };
      review_tags?: Array<{
        tag: string;
      }>;
      review_images?: Array<{
        image_url: string;
      }>;
    }) => ({
      id: review.id,
      user_id: review.user_id,
      booking_id: review.booking_id,
      tour_guide_id: review.tour_guide_id,
      destination_id: review.destination_id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      is_verified: review.is_verified,
      created_at: review.created_at,
      updated_at: review.updated_at,
      bookings: review.bookings,
      tour_guides: review.tour_guides,
      review_tags: review.review_tags
        ? review.review_tags.map((tag: { tag: string }) => ({
          tag: tag.tag,
        }))
        : [],
      review_images: review.review_images
        ? review.review_images.map((img: { image_url: string }) => ({
          image_url: img.image_url,
        }))
        : [],
    })
  );

  return reviews;
};

/**
 * Get reviews for a specific booking
 */
export const getBookingReviews = async (
  bookingId: number
): Promise<ReviewWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        tour_guides(
          users!tour_guides_user_id_fkey(
            first_name,
            last_name
          )
        ),
        review_tags(tag),
        review_images(image_url)
      `
      )
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching booking reviews:", error);
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Transform the data to match our interface
    const reviews: ReviewWithDetails[] = data.map((review: any) => ({
      id: review.id,
      user_id: review.user_id,
      booking_id: review.booking_id,
      tour_guide_id: review.tour_guide_id,
      destination_id: review.destination_id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      is_verified: review.is_verified,
      created_at: review.created_at,
      updated_at: review.updated_at,
      bookings: review.bookings
        ? {
          date: new Date(review.bookings.date).toLocaleDateString("id-ID"),
          tours: review.bookings.tours
            ? {
              title: review.bookings.tours.title,
              location: review.bookings.tours.location,
            }
            : undefined,
        }
        : undefined,
      tour_guides: review.tour_guides
        ? {
          users: review.tour_guides.users
            ? {
              first_name: review.tour_guides.users.first_name,
              last_name: review.tour_guides.users.last_name,
            }
            : undefined,
        }
        : undefined,
      review_tags: review.review_tags
        ? review.review_tags.map((tag: any) => ({
          tag: tag.tag,
        }))
        : [],
      review_images: review.review_images
        ? review.review_images.map((img: any) => ({
          image_url: img.image_url,
        }))
        : [],
    }));

    return reviews;
  } catch (error) {
    console.error("Error in getBookingReviews:", error);
    throw error;
  }
};

/**
 * Interface for tour guide review display
 */
export interface TourGuideReview {
  id: string;
  tourId: string;
  tourName: string;
  clientName: string;
  clientEmail: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  tourDate: string;
  verified: boolean;
  helpful: number;
  response?: string;
  responseDate?: string;
}

/**
 * Get reviews for a specific tour guide
 */
export const getTourGuideReviews = async (
  tourGuideId: string
): Promise<DestinationReview[]> => {
  try {
    // Convert tourGuideId to number if it's a string
    const numericTourGuideId = parseInt(tourGuideId);

    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        users!reviews_user_id_fkey(
          id,
          first_name,
          last_name,
          profile_picture
        ),
        review_images(image_url)
      `
      )
      .eq("tour_guide_id", numericTourGuideId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tour guide reviews:", error);
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Transform the data to match our interface
    const reviews: DestinationReview[] = data.map((review: any) => ({
      id: review.id.toString(),
      userId: review.user_id.toString(),
      userName: review.users
        ? `${review.users.first_name} ${review.users.last_name}`
        : "Anonymous",
      userAvatar: review.users?.profile_picture || undefined,
      rating: review.rating,
      title: review.title,
      content: review.content,
      date: new Date(review.created_at).toLocaleDateString("id-ID"),
      helpfulCount: review.helpful_count || 0,
      isVerified: review.is_verified || false,
      images: review.review_images?.map((img: any) => img.image_url) || [],
      // No tour guide info needed since this is for tour guide reviews
      tourGuide: undefined,
    }));

    return reviews;
  } catch (error) {
    console.error("Error in getTourGuideReviews:", error);
    throw error;
  }
};

/**
 * Get average rating for a tour guide
 */
export const getTourGuideRating = async (
  tourGuideId: string
): Promise<{ averageRating: number; totalReviews: number }> => {
  try {
    const numericTourGuideId = parseInt(tourGuideId);

    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("tour_guide_id", numericTourGuideId);

    if (error) {
      console.error("Error fetching tour guide rating:", error);
      return { averageRating: 0, totalReviews: 0 };
    }

    if (!data || data.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalReviews = data.length;
    const averageRating = data.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews,
    };
  } catch (error) {
    console.error("Error in getTourGuideRating:", error);
    return { averageRating: 0, totalReviews: 0 };
  }
};

/**
 * Create or update a response to a review
 */
export const createOrUpdateTourGuideResponse = async (
  reviewId: number,
  userId: number,
  responseText: string
): Promise<boolean> => {
  try {
    // First, check if a response already exists
    const { data: existingResponse, error: checkError } = await supabase
      .from("review_responses")
      .select("*")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing response:", checkError);
      throw checkError;
    }

    if (existingResponse) {
      // Update existing response
      const { error } = await supabase
        .from("review_responses")
        .update({
          response: responseText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingResponse.id);

      if (error) {
        console.error("Error updating review response:", error);
        throw error;
      }
    } else {
      // Create new response
      const { error } = await supabase.from("review_responses").insert([
        {
          review_id: reviewId,
          user_id: userId,
          response: responseText,
        },
      ]);

      if (error) {
        console.error("Error creating review response:", error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in createOrUpdateTourGuideResponse:", error);
    throw error;
  }
};

/**
 * Get reviews for a specific tour guide (simplified query for testing)
 */
export const getTourGuideReviewsSimple = async (
  tourGuideId: number
): Promise<TourGuideReview[]> => {
  try {
    console.log("Fetching reviews for tour guide ID (simple):", tourGuideId);

    // Get reviews data with customer information
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        users!reviews_user_id_fkey (
          id,
          first_name,
          last_name,
          username,
          email
        )
      `
      )
      .eq("tour_guide_id", tourGuideId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tour guide reviews (simple):", error);
      throw error;
    }

    console.log("Raw reviews data with customer info:", data);

    if (!data || data.length === 0) {
      console.log("No reviews found for tour guide ID:", tourGuideId);
      return [];
    }

    // Transform data with actual customer names
    return data.map(
      (review): TourGuideReview => ({
        id: review.id.toString(),
        tourId: "", // Will be filled later if needed
        tourName: "Review Tour", // Default tour name
        clientName: review.users
          ? `${review.users.first_name || ""} ${review.users.last_name || ""
            }`.trim() ||
          review.users.username ||
          "Customer"
          : "Anonymous User",
        clientEmail: review.users?.email || "",
        rating: review.rating,
        title: review.title,
        content: review.content,
        date: review.created_at,
        tourDate: review.created_at,
        verified: review.is_verified || false,
        helpful: review.helpful_count || 0,
        response: undefined, // Will be filled later if needed
        responseDate: undefined,
      })
    );
  } catch (error) {
    console.error("Error in getTourGuideReviewsSimple:", error);
    throw error;
  }
};

/**
 * Debug function to check reviews data directly
 */
export const debugTourGuideReviews = async (tourGuideId: number) => {
  console.log(
    "=== DEBUG: Checking reviews for tour guide ID:",
    tourGuideId,
    "==="
  );

  try {
    // 1. Check if tour guide exists
    const { data: tourGuide, error: tgError } = await supabase
      .from("tour_guides")
      .select("*")
      .eq("id", tourGuideId)
      .single();

    console.log("Tour guide found:", tourGuide);
    if (tgError) console.error("Tour guide error:", tgError);

    // 2. Check total reviews in database
    const { data: allReviews, error: allError } = await supabase
      .from("reviews")
      .select("id, tour_guide_id, title, rating")
      .limit(10);

    console.log("All reviews in database (sample):", allReviews);
    if (allError) console.error("All reviews error:", allError);

    // 3. Check reviews specifically for this tour guide
    const { data: specificReviews, error: specificError } = await supabase
      .from("reviews")
      .select("*")
      .eq("tour_guide_id", tourGuideId);

    console.log("Reviews for tour guide ID", tourGuideId, ":", specificReviews);
    if (specificError) console.error("Specific reviews error:", specificError);

    // 4. Check if there are ANY reviews with tour_guide_id (fix invalid count query)
    const { data: anyTGReviews, error: anyError } = await supabase
      .from("reviews")
      .select("tour_guide_id, rating")
      .not("tour_guide_id", "is", null)
      .limit(5);

    console.log("Reviews with tour_guide_id (sample):", anyTGReviews);
    if (anyError) console.error("Any tour guide reviews error:", anyError);

    return {
      tourGuideExists: !!tourGuide,
      totalReviews: allReviews?.length || 0,
      reviewsForTourGuide: specificReviews?.length || 0,
      data: specificReviews,
    };
  } catch (error) {
    console.error("Debug error:", error);
    return null;
  }
};

/**
 * Get a specific tour guide review by ID
 */
export const getTourGuideReviewById = async (
  reviewId: number
): Promise<TourGuideReview | null> => {
  try {
    console.log("Fetching review by ID:", reviewId);

    // Get review data with customer information and tour guide response
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        users!reviews_user_id_fkey (
          id,
          first_name,
          last_name,
          username,
          email
        ),
        review_responses (
          response,
          created_at
        )
      `
      )
      .eq("id", reviewId)
      .single();

    if (error) {
      console.error("Error fetching review by ID:", error);
      throw error;
    }

    if (!data) {
      console.log("No review found with ID:", reviewId);
      return null;
    }

    console.log("Review data with response:", data);

    // Transform data with tour guide response
    const review: TourGuideReview = {
      id: data.id.toString(),
      tourId: "", // Will be filled later if needed
      tourName: "Review Tour", // Default tour name
      clientName: data.users
        ? `${data.users.first_name || ""} ${data.users.last_name || ""
          }`.trim() ||
        data.users.username ||
        "Customer"
        : "Anonymous User",
      clientEmail: data.users?.email || "",
      rating: data.rating,
      title: data.title,
      content: data.content,
      date: data.created_at,
      tourDate: data.created_at,
      verified: data.is_verified || false,
      helpful: data.helpful_count || 0,
      response: data.review_responses?.response || undefined,
      responseDate: data.review_responses?.created_at || undefined,
    };

    return review;
  } catch (error) {
    console.error("Error in getTourGuideReviewById:", error);
    throw error;
  }
};
