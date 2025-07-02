-- Solution for custom user system (not using Supabase Auth)
-- Since you're using user_id from users table instead of Supabase Auth,
-- we need to disable RLS or use different approach

-- Step 1: Completely disable RLS on all review-related tables
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for review owners" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete for review owners" ON public.reviews;

-- Step 3: Grant full permissions to anon role (since you're not using Supabase Auth)
GRANT ALL PRIVILEGES ON public.reviews TO anon;
GRANT ALL PRIVILEGES ON public.review_images TO anon;
GRANT ALL PRIVILEGES ON public.review_tags TO anon;
GRANT ALL PRIVILEGES ON public.review_responses TO anon;

-- Step 4: Grant sequence permissions
GRANT ALL ON SEQUENCE public.reviews_id_seq TO anon;
GRANT ALL ON SEQUENCE public.review_images_id_seq TO anon;
GRANT ALL ON SEQUENCE public.review_tags_id_seq TO anon;
GRANT ALL ON SEQUENCE public.review_responses_id_seq TO anon;

-- Step 5: Also grant permissions to authenticated role (just in case)
GRANT ALL PRIVILEGES ON public.reviews TO authenticated;
GRANT ALL PRIVILEGES ON public.review_images TO authenticated;
GRANT ALL PRIVILEGES ON public.review_tags TO authenticated;
GRANT ALL PRIVILEGES ON public.review_responses TO authenticated;

GRANT ALL ON SEQUENCE public.reviews_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.review_images_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.review_tags_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.review_responses_id_seq TO authenticated;

-- Step 6: Grant permissions on related tables needed for reviews
GRANT SELECT, INSERT, UPDATE ON public.bookings TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.tour_guides TO anon, authenticated;
GRANT SELECT ON public.destinations TO anon, authenticated;
GRANT SELECT ON public.tours TO anon, authenticated;

-- Step 7: Verify RLS is disabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED ❌' 
        ELSE 'RLS DISABLED ✅' 
    END as status
FROM pg_tables 
WHERE tablename IN ('reviews', 'review_images', 'review_tags', 'review_responses') 
AND schemaname = 'public'
ORDER BY tablename;

-- Expected result: All should show 'RLS DISABLED ✅'
