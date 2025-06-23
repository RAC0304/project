-- Create function to get user account statistics
-- This function calculates reviews written, tours booked, and places visited for a user

CREATE OR REPLACE FUNCTION get_user_account_stats(p_user_id bigint)
RETURNS TABLE (
    reviews_written bigint,
    tours_booked bigint,
    places_visited bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(r.review_count, 0) as reviews_written,
        COALESCE(b.booking_count, 0) as tours_booked,
        COALESCE(GREATEST(COALESCE(r.review_count, 0), COALESCE(b.booking_count, 0)), 0) as places_visited
    FROM 
        (SELECT 1) as dummy -- dummy table to ensure we get a result
    LEFT JOIN (
        SELECT COUNT(*) as review_count
        FROM reviews 
        WHERE user_id = p_user_id
    ) r ON true
    LEFT JOIN (
        SELECT COUNT(*) as booking_count
        FROM bookings 
        WHERE user_id = p_user_id
    ) b ON true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_account_stats(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_account_stats(bigint) TO anon;
