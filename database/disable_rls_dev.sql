-- TEMPORARY FIX: Disable RLS for Development
-- WARNING: This should only be used for development/testing
-- DO NOT use this in production without proper security review

-- Disable RLS on itinerary_requests table
ALTER TABLE public.itinerary_requests DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to all roles for development
GRANT ALL PRIVILEGES ON public.itinerary_requests TO anon;
GRANT ALL PRIVILEGES ON public.itinerary_requests TO authenticated;
GRANT ALL PRIVILEGES ON public.itinerary_requests TO service_role;

-- Also grant permissions on the sequence
GRANT ALL PRIVILEGES ON SEQUENCE public.itinerary_requests_id_seq TO anon;
GRANT ALL PRIVILEGES ON SEQUENCE public.itinerary_requests_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE public.itinerary_requests_id_seq TO service_role;

-- Ensure other related tables have proper permissions
GRANT SELECT ON public.itineraries TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.tour_guides TO anon, authenticated;

-- Disable RLS on related tables for development
ALTER TABLE public.itineraries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_guides DISABLE ROW LEVEL SECURITY;

-- Grant select permissions on related tables
GRANT ALL PRIVILEGES ON public.itineraries TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.users TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.tour_guides TO anon, authenticated;

SELECT 'RLS disabled successfully for development' AS status;
