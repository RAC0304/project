-- Temporary fix: Disable RLS on reviews table to test
-- This is for testing purposes only - you should re-enable with proper policies later

-- First, disable RLS temporarily
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE reviews_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE reviews_id_seq TO anon;

-- Also grant permissions on related tables
GRANT SELECT ON public.bookings TO authenticated;
GRANT SELECT ON public.bookings TO anon;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
