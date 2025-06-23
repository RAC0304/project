-- Fix profile_picture field length issue
-- This script modifies the profile_picture column to allow longer URLs

-- For PostgreSQL/Supabase
ALTER TABLE public.users 
ALTER COLUMN profile_picture TYPE TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.users.profile_picture IS 'User profile picture URL - can be storage URL or external URL';

-- Optional: Add constraint to ensure it's a valid URL format
-- ALTER TABLE public.users 
-- ADD CONSTRAINT valid_profile_picture_url 
-- CHECK (profile_picture IS NULL OR profile_picture ~ '^https?://.*');
