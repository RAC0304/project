-- Migration: Add destination_id to tours table
-- This will allow tours to be directly linked to destinations

-- Add destination_id column to tours table
ALTER TABLE tours ADD COLUMN destination_id BIGINT;

-- Add foreign key constraint
ALTER TABLE tours 
ADD CONSTRAINT tours_destination_id_fkey 
FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_tours_destination_id ON tours (destination_id);

-- Sample updates to link existing tours with destinations based on location
-- You need to manually update these based on your actual tour data

-- Example: Link tours based on location name
-- UPDATE tours SET destination_id = 1 WHERE location ILIKE '%bali%';
-- UPDATE tours SET destination_id = 2 WHERE location ILIKE '%jakarta%';
-- UPDATE tours SET destination_id = 3 WHERE location ILIKE '%yogyakarta%' OR location ILIKE '%yogya%';
-- UPDATE tours SET destination_id = 4 WHERE location ILIKE '%lombok%';
-- UPDATE tours SET destination_id = 5 WHERE location ILIKE '%raja ampat%';
-- UPDATE tours SET destination_id = 6 WHERE location ILIKE '%komodo%';
-- UPDATE tours SET destination_id = 7 WHERE location ILIKE '%bromo%';
-- UPDATE tours SET destination_id = 8 WHERE location ILIKE '%toba%';

-- Query to check which tours don't have destination_id set
-- SELECT id, title, location, destination_id FROM tours WHERE destination_id IS NULL;

-- Note: After running this migration, you need to update the application code
-- to include destination_id when creating reviews from bookings
