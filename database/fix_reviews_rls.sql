-- Fix RLS policies for reviews table to allow proper access

-- Enable RLS on reviews table if not already enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.reviews;

-- Create new RLS policies for reviews table
-- Allow read access for all authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.reviews
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert for authenticated users (they can create reviews)
CREATE POLICY "Enable insert for authenticated users" ON public.reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow update for review owners
CREATE POLICY "Enable update for review owners" ON public.reviews
    FOR UPDATE USING (auth.uid()::text::bigint = user_id);

-- Allow delete for review owners
CREATE POLICY "Enable delete for review owners" ON public.reviews
    FOR DELETE USING (auth.uid()::text::bigint = user_id);

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT USAGE ON SEQUENCE reviews_id_seq TO authenticated;

-- Also ensure related tables have proper permissions
GRANT SELECT ON public.bookings TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.destinations TO authenticated;
GRANT SELECT ON public.tour_guides TO authenticated;
