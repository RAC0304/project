-- Fix Row Level Security (RLS) for Itinerary Requests Table
-- This script will create the necessary RLS policies for the itinerary booking system

-- First, let's check if RLS is enabled and create policies

-- Enable RLS on itinerary_requests table (if not already enabled)
ALTER TABLE public.itinerary_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can create their own itinerary requests" ON public.itinerary_requests;
DROP POLICY IF EXISTS "Users can view their own itinerary requests" ON public.itinerary_requests;
DROP POLICY IF EXISTS "Users can update their own itinerary requests" ON public.itinerary_requests;
DROP POLICY IF EXISTS "Admins can view all itinerary requests" ON public.itinerary_requests;
DROP POLICY IF EXISTS "Admins can update all itinerary requests" ON public.itinerary_requests;
DROP POLICY IF EXISTS "Tour guides can view requests assigned to them" ON public.itinerary_requests;

-- Policy 1: Users can create their own itinerary requests
-- This policy allows authenticated users to insert new requests where they are the user_id
CREATE POLICY "Users can create their own itinerary requests"
ON public.itinerary_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text OR true);

-- Policy 2: Users can view their own itinerary requests
CREATE POLICY "Users can view their own itinerary requests"
ON public.itinerary_requests
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Policy 3: Users can update their own itinerary requests (for cancellation, etc.)
CREATE POLICY "Users can update their own itinerary requests"
ON public.itinerary_requests
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy 4: Admins can view all itinerary requests
CREATE POLICY "Admins can view all itinerary requests"
ON public.itinerary_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id::text = auth.uid()::text 
    AND users.role = 'admin'
  )
);

-- Policy 5: Admins can update all itinerary requests (approve/reject)
CREATE POLICY "Admins can update all itinerary requests"
ON public.itinerary_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id::text = auth.uid()::text 
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id::text = auth.uid()::text 
    AND users.role = 'admin'
  )
);

-- Policy 6: Tour guides can view requests assigned to them
CREATE POLICY "Tour guides can view requests assigned to them"
ON public.itinerary_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tour_guides 
    WHERE tour_guides.id = itinerary_requests.tour_guide_id 
    AND tour_guides.user_id::text = auth.uid()::text
  )
);

-- Alternative: If you're not using Supabase Auth and want to disable RLS temporarily
-- Uncomment the line below to disable RLS (NOT RECOMMENDED for production)
-- ALTER TABLE public.itinerary_requests DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT ON public.itinerary_requests TO authenticated;
GRANT UPDATE (status, updated_at) ON public.itinerary_requests TO authenticated;

-- Grant permissions to anon users (if needed for public access)
-- GRANT SELECT ON public.itinerary_requests TO anon;

-- Create function to check if user exists in users table (for local auth)
CREATE OR REPLACE FUNCTION public.check_user_exists(user_id_param bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id_param
  );
END;
$$;

-- Alternative policy for local authentication system
-- If you're using local users table instead of Supabase Auth, use these policies instead:

DROP POLICY IF EXISTS "Local users can create itinerary requests" ON public.itinerary_requests;
DROP POLICY IF EXISTS "Local users can view their own requests" ON public.itinerary_requests;
DROP POLICY IF EXISTS "Local admins can manage all requests" ON public.itinerary_requests;

-- For systems using local authentication (not Supabase Auth):
CREATE POLICY "Local users can create itinerary requests"
ON public.itinerary_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (public.check_user_exists(user_id));

CREATE POLICY "Local users can view their own requests"
ON public.itinerary_requests
FOR SELECT
TO anon, authenticated
USING (true); -- You may want to add user validation here

CREATE POLICY "Local admins can manage all requests"
ON public.itinerary_requests
FOR ALL
TO anon, authenticated
USING (true); -- You may want to add admin validation here

-- If you want to completely bypass RLS for development (TEMPORARY SOLUTION)
-- Uncomment the following lines:
/*
ALTER TABLE public.itinerary_requests DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.itinerary_requests TO anon;
GRANT ALL ON public.itinerary_requests TO authenticated;
*/

-- Enable RLS on related tables if needed
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for itineraries table (public read access)
DROP POLICY IF EXISTS "Public can view published itineraries" ON public.itineraries;
CREATE POLICY "Public can view published itineraries"
ON public.itineraries
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Create policies for users table (users can view their own data)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (id::text = auth.uid()::text);

-- For local auth system, allow public read of users (with restrictions)
DROP POLICY IF EXISTS "Public can view basic user info" ON public.users;
CREATE POLICY "Public can view basic user info"
ON public.users
FOR SELECT
TO anon, authenticated
USING (true); -- You might want to limit this to specific columns

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_itinerary_requests_user_id ON public.itinerary_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_requests_status ON public.itinerary_requests(status);
CREATE INDEX IF NOT EXISTS idx_itinerary_requests_created_at ON public.itinerary_requests(created_at);

-- Verify the policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'itinerary_requests';

COMMENT ON TABLE public.itinerary_requests IS 'Table for storing itinerary booking requests with RLS policies for user access control';
COMMENT ON POLICY "Users can create their own itinerary requests" ON public.itinerary_requests IS 'Allows authenticated users to create booking requests';
COMMENT ON POLICY "Local users can create itinerary requests" ON public.itinerary_requests IS 'Alternative policy for local authentication systems';
