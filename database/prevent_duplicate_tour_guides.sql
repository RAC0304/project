-- Add unique constraint to prevent duplicate tour guides for the same user
ALTER TABLE tour_guides 
ADD CONSTRAINT tour_guides_user_id_unique UNIQUE (user_id);

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT tour_guides_user_id_unique ON tour_guides IS 'Ensures each user can only have one tour guide profile';
