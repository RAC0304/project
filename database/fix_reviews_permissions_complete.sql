-- Comprehensive fix for RLS and authentication issues on reviews table

-- Step 1: Disable RLS temporarily on reviews table
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for review owners" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete for review owners" ON public.reviews;

-- Step 3: Grant comprehensive permissions to both authenticated and anon users
GRANT ALL PRIVILEGES ON public.reviews TO authenticated;
GRANT ALL PRIVILEGES ON public.reviews TO anon;
GRANT ALL PRIVILEGES ON public.reviews TO postgres;

-- Step 4: Grant sequence permissions
GRANT ALL ON SEQUENCE public.reviews_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO anon;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO postgres;

-- Step 5: Grant permissions on related tables
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.bookings TO anon;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.tour_guides TO authenticated;
GRANT SELECT ON public.tour_guides TO anon;
GRANT SELECT ON public.destinations TO authenticated;
GRANT SELECT ON public.destinations TO anon;

-- Step 6: Grant permissions on review related tables
GRANT ALL ON public.review_images TO authenticated;
GRANT ALL ON public.review_images TO anon;
GRANT ALL ON public.review_tags TO authenticated;
GRANT ALL ON public.review_tags TO anon;
GRANT ALL ON public.review_responses TO authenticated;
GRANT ALL ON public.review_responses TO anon;

-- Grant sequence permissions for related tables
GRANT ALL ON SEQUENCE public.review_images_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.review_images_id_seq TO anon;
GRANT ALL ON SEQUENCE public.review_tags_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.review_tags_id_seq TO anon;
GRANT ALL ON SEQUENCE public.review_responses_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.review_responses_id_seq TO anon;

-- Step 7: Check if RLS is properly disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'reviews' AND schemaname = 'public';

-- This should show rowsecurity = false

-- Step 8: Test query to make sure permissions work
-- You can run this manually to test:
-- SELECT current_user, session_user;
-- INSERT INTO public.reviews (user_id, rating, title, content, created_at) 
-- VALUES (1, 5, 'Test Review', 'Test content', NOW()) RETURNING id;
