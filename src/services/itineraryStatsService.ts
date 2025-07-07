import { supabase } from '../config/supabaseClient';

export interface ItineraryStats {
    total_itineraries: number;
    published_itineraries: number;
    draft_itineraries: number;
    featured_itineraries: number;
    total_bookings: number;
    total_requests: number;
    average_rating: number;
    total_reviews: number;
}

export interface ItineraryPopularityStats {
    itinerary_id: string;
    title: string;
    slug: string;
    image_url: string;
    view_count: number;
    booking_count: number;
    request_count: number;
    review_count: number;
    average_rating: number;
}

export interface ItineraryRevenueStats {
    itinerary_id: string;
    title: string;
    total_revenue: number;
    booking_count: number;
    average_booking_value: number;
}

export interface CategoryStats {
    category: string;
    count: number;
    percentage: number;
}

export interface DifficultyStats {
    difficulty: string;
    count: number;
    percentage: number;
}

export interface MonthlyStats {
    month: string;
    year: number;
    bookings: number;
    revenue: number;
    new_itineraries: number;
}

// Get general itinerary statistics
export const getItineraryStats = async (): Promise<ItineraryStats> => {
    try {
        // Get itinerary counts
        const { data: itineraryData, error: itineraryError } = await supabase
            .from('itineraries')
            .select('status, featured');

        if (itineraryError) {
            console.error('Error fetching itinerary stats:', itineraryError);
            throw itineraryError;
        }

        const totalItineraries = itineraryData?.length || 0;
        const publishedItineraries = itineraryData?.filter(i => i.status === 'published').length || 0;
        const draftItineraries = itineraryData?.filter(i => i.status === 'draft').length || 0;
        const featuredItineraries = itineraryData?.filter(i => i.featured === true).length || 0;

        // Get booking counts
        const { data: bookingData, error: bookingError } = await supabase
            .from('itinerary_bookings')
            .select('id');

        if (bookingError) {
            console.error('Error fetching booking stats:', bookingError);
            throw bookingError;
        }

        const totalBookings = bookingData?.length || 0;

        // Get request counts
        const { data: requestData, error: requestError } = await supabase
            .from('itinerary_requests')
            .select('id');

        if (requestError) {
            console.error('Error fetching request stats:', requestError);
            throw requestError;
        }

        const totalRequests = requestData?.length || 0;

        // Get review stats
        const { data: reviewData, error: reviewError } = await supabase
            .from('itinerary_reviews')
            .select('rating');

        if (reviewError) {
            console.error('Error fetching review stats:', reviewError);
            throw reviewError;
        }

        const totalReviews = reviewData?.length || 0;
        const averageRating = totalReviews > 0
            ? reviewData.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

        return {
            total_itineraries: totalItineraries,
            published_itineraries: publishedItineraries,
            draft_itineraries: draftItineraries,
            featured_itineraries: featuredItineraries,
            total_bookings: totalBookings,
            total_requests: totalRequests,
            average_rating: Number(averageRating.toFixed(1)),
            total_reviews: totalReviews
        };
    } catch (error) {
        console.error('Error in getItineraryStats:', error);
        throw error;
    }
};

// Get popular itineraries statistics
export const getPopularItineraries = async (
    limit: number = 10
): Promise<ItineraryPopularityStats[]> => {
    try {
        const { data: itineraries, error: itinerariesError } = await supabase
            .from('itineraries')
            .select('id, title, slug, image_url')
            .eq('status', 'published');

        if (itinerariesError) {
            console.error('Error fetching itineraries:', itinerariesError);
            throw itinerariesError;
        }

        if (!itineraries || itineraries.length === 0) {
            return [];
        }

        const popularityStats = await Promise.all(
            itineraries.map(async (itinerary) => {
                // Get booking count
                const { data: bookings, error: bookingError } = await supabase
                    .from('itinerary_bookings')
                    .select('id')
                    .eq('itinerary_id', itinerary.id);

                if (bookingError) {
                    console.error('Error fetching bookings for itinerary:', bookingError);
                }

                // Get request count
                const { data: requests, error: requestError } = await supabase
                    .from('itinerary_requests')
                    .select('id')
                    .eq('itinerary_id', itinerary.id);

                if (requestError) {
                    console.error('Error fetching requests for itinerary:', requestError);
                }

                // Get review stats
                const { data: reviews, error: reviewError } = await supabase
                    .from('itinerary_reviews')
                    .select('rating')
                    .eq('itinerary_id', itinerary.id);

                if (reviewError) {
                    console.error('Error fetching reviews for itinerary:', reviewError);
                }

                const bookingCount = bookings?.length || 0;
                const requestCount = requests?.length || 0;
                const reviewCount = reviews?.length || 0;
                const averageRating = reviewCount > 0 && reviews
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
                    : 0;

                return {
                    itinerary_id: itinerary.id,
                    title: itinerary.title,
                    slug: itinerary.slug,
                    image_url: itinerary.image_url,
                    view_count: 0, // Would need to implement view tracking
                    booking_count: bookingCount,
                    request_count: requestCount,
                    review_count: reviewCount,
                    average_rating: Number(averageRating.toFixed(1))
                };
            })
        );

        // Sort by combined popularity score (bookings + requests + reviews)
        return popularityStats
            .sort((a, b) => {
                const scoreA = a.booking_count + a.request_count + a.review_count;
                const scoreB = b.booking_count + b.request_count + b.review_count;
                return scoreB - scoreA;
            })
            .slice(0, limit);
    } catch (error) {
        console.error('Error in getPopularItineraries:', error);
        throw error;
    }
};

// Get revenue statistics
export const getRevenueStats = async (
    limit: number = 10
): Promise<ItineraryRevenueStats[]> => {
    try {
        const { data: bookings, error: bookingError } = await supabase
            .from('itinerary_bookings')
            .select(`
        itinerary_id,
        total_price,
        status,
        itineraries (
          title
        )
      `)
            .eq('status', 'confirmed');

        if (bookingError) {
            console.error('Error fetching booking revenue:', bookingError);
            throw bookingError;
        }

        if (!bookings || bookings.length === 0) {
            return [];
        }

        // Group by itinerary and calculate revenue
        const revenueByItinerary = bookings.reduce((acc, booking) => {
            const itineraryId = booking.itinerary_id;
            if (!acc[itineraryId]) {
                acc[itineraryId] = {
                    itinerary_id: itineraryId,
                    title: (booking.itineraries as any).title,
                    total_revenue: 0,
                    booking_count: 0,
                    bookings: []
                };
            }
            acc[itineraryId].total_revenue += Number(booking.total_price || 0);
            acc[itineraryId].booking_count += 1;
            acc[itineraryId].bookings.push(booking);
            return acc;
        }, {} as any);

        // Calculate average booking value and sort by revenue
        const revenueStats = Object.values(revenueByItinerary)
            .map((item: any) => ({
                itinerary_id: item.itinerary_id,
                title: item.title,
                total_revenue: item.total_revenue,
                booking_count: item.booking_count,
                average_booking_value: item.booking_count > 0
                    ? item.total_revenue / item.booking_count
                    : 0
            }))
            .sort((a, b) => b.total_revenue - a.total_revenue)
            .slice(0, limit);

        return revenueStats;
    } catch (error) {
        console.error('Error in getRevenueStats:', error);
        throw error;
    }
};

// Get category distribution
export const getCategoryStats = async (): Promise<CategoryStats[]> => {
    try {
        const { data: itineraries, error } = await supabase
            .from('itineraries')
            .select('category')
            .eq('status', 'published');

        if (error) {
            console.error('Error fetching category stats:', error);
            throw error;
        }

        if (!itineraries || itineraries.length === 0) {
            return [];
        }

        const total = itineraries.length;
        const categoryCounts = itineraries.reduce((acc, itinerary) => {
            const category = itinerary.category || 'other';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as any);

        return Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count: count as number,
            percentage: Number(((count as number / total) * 100).toFixed(1))
        }));
    } catch (error) {
        console.error('Error in getCategoryStats:', error);
        throw error;
    }
};

// Get difficulty distribution
export const getDifficultyStats = async (): Promise<DifficultyStats[]> => {
    try {
        const { data: itineraries, error } = await supabase
            .from('itineraries')
            .select('difficulty')
            .eq('status', 'published');

        if (error) {
            console.error('Error fetching difficulty stats:', error);
            throw error;
        }

        if (!itineraries || itineraries.length === 0) {
            return [];
        }

        const total = itineraries.length;
        const difficultyCounts = itineraries.reduce((acc, itinerary) => {
            const difficulty = itinerary.difficulty || 'easy';
            acc[difficulty] = (acc[difficulty] || 0) + 1;
            return acc;
        }, {} as any);

        return Object.entries(difficultyCounts).map(([difficulty, count]) => ({
            difficulty,
            count: count as number,
            percentage: Number(((count as number / total) * 100).toFixed(1))
        }));
    } catch (error) {
        console.error('Error in getDifficultyStats:', error);
        throw error;
    }
};

// Get monthly statistics
export const getMonthlyStats = async (
    months: number = 12
): Promise<MonthlyStats[]> => {
    try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        // Get monthly bookings
        const { data: bookings, error: bookingError } = await supabase
            .from('itinerary_bookings')
            .select('created_at, total_price, status')
            .gte('created_at', startDate.toISOString());

        if (bookingError) {
            console.error('Error fetching monthly bookings:', bookingError);
            throw bookingError;
        }

        // Get monthly new itineraries
        const { data: newItineraries, error: itineraryError } = await supabase
            .from('itineraries')
            .select('created_at')
            .gte('created_at', startDate.toISOString());

        if (itineraryError) {
            console.error('Error fetching monthly itineraries:', itineraryError);
            throw itineraryError;
        }

        // Group by month
        const monthlyData = {} as any;

        // Process bookings
        bookings?.forEach(booking => {
            const date = new Date(booking.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: date.toLocaleString('default', { month: 'long' }),
                    year: date.getFullYear(),
                    bookings: 0,
                    revenue: 0,
                    new_itineraries: 0
                };
            }

            monthlyData[monthKey].bookings += 1;
            if (booking.status === 'confirmed') {
                monthlyData[monthKey].revenue += Number(booking.total_price || 0);
            }
        });

        // Process new itineraries
        newItineraries?.forEach(itinerary => {
            const date = new Date(itinerary.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: date.toLocaleString('default', { month: 'long' }),
                    year: date.getFullYear(),
                    bookings: 0,
                    revenue: 0,
                    new_itineraries: 0
                };
            }

            monthlyData[monthKey].new_itineraries += 1;
        });

        // Convert to array and sort by date
        return Object.entries(monthlyData)
            .map(([, data]) => data as MonthlyStats)
            .sort((a, b) => {
                const dateA = new Date(a.year, new Date(Date.parse(a.month + ' 1, 2000')).getMonth());
                const dateB = new Date(b.year, new Date(Date.parse(b.month + ' 1, 2000')).getMonth());
                return dateA.getTime() - dateB.getTime();
            });
    } catch (error) {
        console.error('Error in getMonthlyStats:', error);
        throw error;
    }
};

// Get booking status distribution
export const getBookingStatusStats = async (): Promise<any[]> => {
    try {
        const { data: bookings, error } = await supabase
            .from('itinerary_bookings')
            .select('status');

        if (error) {
            console.error('Error fetching booking status stats:', error);
            throw error;
        }

        if (!bookings || bookings.length === 0) {
            return [];
        }

        const total = bookings.length;
        const statusCounts = bookings.reduce((acc, booking) => {
            const status = booking.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as any);

        return Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count: count as number,
            percentage: Number(((count as number / total) * 100).toFixed(1))
        }));
    } catch (error) {
        console.error('Error in getBookingStatusStats:', error);
        throw error;
    }
};

// Get request status distribution
export const getRequestStatusStats = async (): Promise<any[]> => {
    try {
        const { data: requests, error } = await supabase
            .from('itinerary_requests')
            .select('status');

        if (error) {
            console.error('Error fetching request status stats:', error);
            throw error;
        }

        if (!requests || requests.length === 0) {
            return [];
        }

        const total = requests.length;
        const statusCounts = requests.reduce((acc, request) => {
            const status = request.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as any);

        return Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count: count as number,
            percentage: Number(((count as number / total) * 100).toFixed(1))
        }));
    } catch (error) {
        console.error('Error in getRequestStatusStats:', error);
        throw error;
    }
};
