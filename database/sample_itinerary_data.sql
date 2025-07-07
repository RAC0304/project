-- Sample Itinerary Data for Testing
-- Run this in your Supabase SQL Editor after the main migration

-- Insert sample itinerary
INSERT INTO itineraries (
    slug, title, duration, description, image_url, difficulty, best_season, 
    estimated_budget, category, status, featured
) VALUES (
    'bali-cultural-experience',
    'Bali Cultural Experience',
    '7 days',
    'Immerse yourself in the rich culture and traditions of Bali through this comprehensive tour that takes you through ancient temples, traditional villages, and authentic culinary experiences.',
    'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
    'easy',
    'April - October',
    '$800 - $1200',
    'cultural',
    'published',
    true
) ON CONFLICT (slug) DO NOTHING;

-- Get the itinerary ID for linking
DO $$
DECLARE
    itinerary_id BIGINT;
BEGIN
    SELECT id INTO itinerary_id FROM itineraries WHERE slug = 'bali-cultural-experience';
    
    -- Insert sample days
    INSERT INTO itinerary_days (
        itinerary_id, day_number, title, description, accommodation, meals, transportation
    ) VALUES 
    (itinerary_id, 1, 'Arrival in Ubud', 'Arrive in Ubud and explore the cultural heart of Bali', 'Traditional Balinese Resort', 'Welcome dinner', 'Airport transfer'),
    (itinerary_id, 2, 'Temple Hopping', 'Visit ancient temples and learn about Balinese Hindu culture', 'Traditional Balinese Resort', 'Breakfast, lunch', 'Private car'),
    (itinerary_id, 3, 'Village Experience', 'Experience authentic village life and traditional crafts', 'Traditional Balinese Resort', 'All meals included', 'Walking tour')
    ON CONFLICT (itinerary_id, day_number) DO NOTHING;
    
    -- Insert sample activities for Day 1
    INSERT INTO itinerary_activities (
        itinerary_day_id, time_start, title, description, location, duration_minutes, order_index
    ) 
    SELECT 
        id, '10:00', 'Check-in and Welcome', 'Check into resort and welcome briefing', 'Ubud Resort', 60, 1
    FROM itinerary_days 
    WHERE itinerary_id = itinerary_id AND day_number = 1
    ON CONFLICT DO NOTHING;
    
    INSERT INTO itinerary_activities (
        itinerary_day_id, time_start, title, description, location, duration_minutes, order_index
    ) 
    SELECT 
        id, '14:00', 'Ubud Market Tour', 'Explore the traditional Ubud market and local crafts', 'Ubud Traditional Market', 120, 2
    FROM itinerary_days 
    WHERE itinerary_id = itinerary_id AND day_number = 1
    ON CONFLICT DO NOTHING;
    
    INSERT INTO itinerary_activities (
        itinerary_day_id, time_start, title, description, location, duration_minutes, order_index
    ) 
    SELECT 
        id, '18:00', 'Welcome Dinner', 'Traditional Balinese dinner with cultural performance', 'Resort Restaurant', 120, 3
    FROM itinerary_days 
    WHERE itinerary_id = itinerary_id AND day_number = 1
    ON CONFLICT DO NOTHING;
    
    -- Insert sample activities for Day 2
    INSERT INTO itinerary_activities (
        itinerary_day_id, time_start, title, description, location, duration_minutes, order_index
    ) 
    SELECT 
        id, '08:00', 'Tanah Lot Temple', 'Visit the iconic sea temple', 'Tanah Lot', 180, 1
    FROM itinerary_days 
    WHERE itinerary_id = itinerary_id AND day_number = 2
    ON CONFLICT DO NOTHING;
    
    INSERT INTO itinerary_activities (
        itinerary_day_id, time_start, title, description, location, duration_minutes, order_index
    ) 
    SELECT 
        id, '14:00', 'Uluwatu Temple', 'Clifftop temple with stunning ocean views', 'Uluwatu', 180, 2
    FROM itinerary_days 
    WHERE itinerary_id = itinerary_id AND day_number = 2
    ON CONFLICT DO NOTHING;
    
    -- Insert sample activities for Day 3
    INSERT INTO itinerary_activities (
        itinerary_day_id, time_start, title, description, location, duration_minutes, order_index
    ) 
    SELECT 
        id, '09:00', 'Village Walk', 'Explore traditional Balinese village', 'Penglipuran Village', 180, 1
    FROM itinerary_days 
    WHERE itinerary_id = itinerary_id AND day_number = 3
    ON CONFLICT DO NOTHING;
    
    INSERT INTO itinerary_activities (
        itinerary_day_id, time_start, title, description, location, duration_minutes, order_index
    ) 
    SELECT 
        id, '14:00', 'Batik Workshop', 'Learn traditional batik making', 'Local Artisan Studio', 120, 2
    FROM itinerary_days 
    WHERE itinerary_id = itinerary_id AND day_number = 3
    ON CONFLICT DO NOTHING;

END $$;

-- Verify the data
SELECT 
    i.id,
    i.slug,
    i.title,
    i.duration,
    COUNT(d.id) as day_count,
    COUNT(a.id) as activity_count
FROM itineraries i
LEFT JOIN itinerary_days d ON i.id = d.itinerary_id
LEFT JOIN itinerary_activities a ON d.id = a.itinerary_day_id
WHERE i.slug = 'bali-cultural-experience'
GROUP BY i.id, i.slug, i.title, i.duration;
