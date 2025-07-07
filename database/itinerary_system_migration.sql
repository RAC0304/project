-- Itinerary System Migration Script for Supabase
-- This script s-- Create the itinerary_activities table
CREATE -- Create the itinerary_bookings table
CREATE TABLE IF NOT EXISTS itinerary_bookings (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_bookings_id_seq'::regclass),
    itinerary_id BIGINT NOT NULL REFERENCES itineraries(id),
    user_id BIGINT NOT NULL REFERENCES public.users(id),
    tour_guide_id BIGINT REFERENCES public.tour_guides(id),
    participants INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    status booking_status DEFAULT 'pending',
    special_requests TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);S itinerary_activities (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_activities_id_seq'::regclass),
    itinerary_day_id BIGINT NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
    time_start TIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    duration_minutes INTEGER,
    optional BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);plete itinerary system with all required tables and relationships

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for better data validation (check if exists first)
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'challenging');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE itinerary_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the main itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
    id BIGINT PRIMARY KEY DEFAULT nextval('itineraries_id_seq'::regclass),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    difficulty difficulty_level DEFAULT 'easy',
    best_season VARCHAR(100),
    estimated_budget VARCHAR(100),
    category VARCHAR(100) DEFAULT 'cultural',
    status itinerary_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    min_participants INTEGER DEFAULT 1,a
    max_participants INTEGER DEFAULT 20,
    created_by BIGINT REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the itinerary_days table
CREATE TABLE IF NOT EXISTS itinerary_days (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_days_id_seq'::regclass),
    itinerary_id BIGINT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    accommodation VARCHAR(255),
    meals VARCHAR(255),
    transportation VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(itinerary_id, day_number)
);

-- Create the itinerary_activities table
CREATE TABLE IF NOT EXISTS itinerary_activities (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_activities_id_seq'::regclass),
    itinerary_day_id BIGINT NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
    time_start VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    duration_minutes INTEGER,
    optional BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the itinerary_destinations table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS itinerary_destinations (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_destinations_id_seq'::regclass),
    itinerary_id BIGINT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    destination_id BIGINT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(itinerary_id, destination_id)
);

-- Create the itinerary_images table
CREATE TABLE IF NOT EXISTS itinerary_images (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_images_id_seq'::regclass),
    itinerary_id BIGINT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    caption TEXT,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the itinerary_bookings table
CREATE TABLE IF NOT EXISTS itinerary_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tour_guide_id UUID REFERENCES tour_guides(id),
    participants INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    status booking_status DEFAULT 'pending',
    special_requests TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the itinerary_requests table
CREATE TABLE IF NOT EXISTS itinerary_requests (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_requests_id_seq'::regclass),
    user_id BIGINT NOT NULL REFERENCES public.users(id),
    itinerary_id BIGINT NOT NULL REFERENCES itineraries(id),
    tour_guide_id BIGINT REFERENCES public.tour_guides(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    group_size VARCHAR(50) NOT NULL,
    additional_requests TEXT,
    status request_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the itinerary_reviews table
CREATE TABLE IF NOT EXISTS itinerary_reviews (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_reviews_id_seq'::regclass),
    itinerary_id BIGINT NOT NULL REFERENCES itineraries(id),
    user_id BIGINT NOT NULL REFERENCES public.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(itinerary_id, user_id) -- Prevent duplicate reviews from same user
);

-- Create the itinerary_tags table
CREATE TABLE IF NOT EXISTS itinerary_tags (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_tags_id_seq'::regclass),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the itinerary_tag_relations table (many-to-many)
CREATE TABLE IF NOT EXISTS itinerary_tag_relations (
    id BIGINT PRIMARY KEY DEFAULT nextval('itinerary_tag_relations_id_seq'::regclass),
    itinerary_id BIGINT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES itinerary_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(itinerary_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_itineraries_status ON itineraries(status);
CREATE INDEX IF NOT EXISTS idx_itineraries_category ON itineraries(category);
CREATE INDEX IF NOT EXISTS idx_itineraries_difficulty ON itineraries(difficulty);
CREATE INDEX IF NOT EXISTS idx_itineraries_featured ON itineraries(featured);
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON itineraries(created_at);
CREATE INDEX IF NOT EXISTS idx_itineraries_slug ON itineraries(slug);

CREATE INDEX IF NOT EXISTS idx_itinerary_days_itinerary_id ON itinerary_days(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_day_number ON itinerary_days(day_number);

CREATE INDEX IF NOT EXISTS idx_itinerary_activities_day_id ON itinerary_activities(itinerary_day_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_order ON itinerary_activities(order_index);

CREATE INDEX IF NOT EXISTS idx_itinerary_bookings_user_id ON itinerary_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_bookings_itinerary_id ON itinerary_bookings(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_bookings_status ON itinerary_bookings(status);
CREATE INDEX IF NOT EXISTS idx_itinerary_bookings_dates ON itinerary_bookings(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_itinerary_requests_user_id ON itinerary_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_requests_itinerary_id ON itinerary_requests(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_requests_status ON itinerary_requests(status);

CREATE INDEX IF NOT EXISTS idx_itinerary_reviews_itinerary_id ON itinerary_reviews(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_reviews_user_id ON itinerary_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_reviews_rating ON itinerary_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_itinerary_tags_name ON itinerary_tags(name);

-- Create functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS update_itineraries_updated_at ON itineraries;
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_itinerary_days_updated_at ON itinerary_days;
CREATE TRIGGER update_itinerary_days_updated_at BEFORE UPDATE ON itinerary_days
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_itinerary_activities_updated_at ON itinerary_activities;
CREATE TRIGGER update_itinerary_activities_updated_at BEFORE UPDATE ON itinerary_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_itinerary_bookings_updated_at ON itinerary_bookings;
CREATE TRIGGER update_itinerary_bookings_updated_at BEFORE UPDATE ON itinerary_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_itinerary_requests_updated_at ON itinerary_requests;
CREATE TRIGGER update_itinerary_requests_updated_at BEFORE UPDATE ON itinerary_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_itinerary_reviews_updated_at ON itinerary_reviews;
CREATE TRIGGER update_itinerary_reviews_updated_at BEFORE UPDATE ON itinerary_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_tag_relations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing ones first to avoid conflicts)

-- Itineraries: Published ones are public, others only for authenticated users
DROP POLICY IF EXISTS "Published itineraries are viewable by everyone" ON itineraries;
CREATE POLICY "Published itineraries are viewable by everyone" ON itineraries
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can view all itineraries" ON itineraries;
CREATE POLICY "Authenticated users can view all itineraries" ON itineraries
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin users can manage itineraries" ON itineraries;
CREATE POLICY "Admin users can manage itineraries" ON itineraries
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Itinerary days, activities, destinations, images: Follow parent itinerary permissions
DROP POLICY IF EXISTS "Itinerary days follow parent permissions" ON itinerary_days;
CREATE POLICY "Itinerary days follow parent permissions" ON itinerary_days
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM itineraries 
        WHERE id = itinerary_days.itinerary_id 
        AND (status = 'published' OR auth.role() = 'authenticated')
    ));

DROP POLICY IF EXISTS "Itinerary activities follow parent permissions" ON itinerary_activities;
CREATE POLICY "Itinerary activities follow parent permissions" ON itinerary_activities
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM itinerary_days 
        JOIN itineraries ON itineraries.id = itinerary_days.itinerary_id
        WHERE itinerary_days.id = itinerary_activities.itinerary_day_id 
        AND (itineraries.status = 'published' OR auth.role() = 'authenticated')
    ));

DROP POLICY IF EXISTS "Itinerary destinations follow parent permissions" ON itinerary_destinations;
CREATE POLICY "Itinerary destinations follow parent permissions" ON itinerary_destinations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM itineraries 
        WHERE id = itinerary_destinations.itinerary_id 
        AND (status = 'published' OR auth.role() = 'authenticated')
    ));

DROP POLICY IF EXISTS "Itinerary images follow parent permissions" ON itinerary_images;
CREATE POLICY "Itinerary images follow parent permissions" ON itinerary_images
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM itineraries 
        WHERE id = itinerary_images.itinerary_id 
        AND (status = 'published' OR auth.role() = 'authenticated')
    ));

-- Bookings: Users can only see their own bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON itinerary_bookings;
CREATE POLICY "Users can view their own bookings" ON itinerary_bookings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bookings" ON itinerary_bookings;
CREATE POLICY "Users can insert their own bookings" ON itinerary_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON itinerary_bookings;
CREATE POLICY "Users can update their own bookings" ON itinerary_bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Requests: Users can only see their own requests
DROP POLICY IF EXISTS "Users can view their own requests" ON itinerary_requests;
CREATE POLICY "Users can view their own requests" ON itinerary_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own requests" ON itinerary_requests;
CREATE POLICY "Users can insert their own requests" ON itinerary_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own requests" ON itinerary_requests;
CREATE POLICY "Users can update their own requests" ON itinerary_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: Public readable, authenticated users can write
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON itinerary_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON itinerary_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON itinerary_reviews;
CREATE POLICY "Authenticated users can insert reviews" ON itinerary_reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON itinerary_reviews;
CREATE POLICY "Users can update their own reviews" ON itinerary_reviews
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON itinerary_reviews;
CREATE POLICY "Users can delete their own reviews" ON itinerary_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Tags: Public readable, admin writable
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON itinerary_tags;
CREATE POLICY "Tags are viewable by everyone" ON itinerary_tags
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin users can manage tags" ON itinerary_tags;
CREATE POLICY "Admin users can manage tags" ON itinerary_tags
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Tag relations: Public readable, admin writable
DROP POLICY IF EXISTS "Tag relations are viewable by everyone" ON itinerary_tag_relations;
CREATE POLICY "Tag relations are viewable by everyone" ON itinerary_tag_relations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin users can manage tag relations" ON itinerary_tag_relations;
CREATE POLICY "Admin users can manage tag relations" ON itinerary_tag_relations
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create a function to get itinerary statistics
CREATE OR REPLACE FUNCTION get_itinerary_stats()
RETURNS TABLE (
    total_itineraries BIGINT,
    published_itineraries BIGINT,
    draft_itineraries BIGINT,
    total_bookings BIGINT,
    total_reviews BIGINT,
    average_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_itineraries,
        COUNT(*) FILTER (WHERE status = 'published') as published_itineraries,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_itineraries,
        (SELECT COUNT(*) FROM itinerary_bookings) as total_bookings,
        (SELECT COUNT(*) FROM itinerary_reviews) as total_reviews,
        (SELECT COALESCE(AVG(rating), 0) FROM itinerary_reviews) as average_rating
    FROM itineraries;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_itinerary_stats() TO authenticated;

-- Create a view for popular itineraries
CREATE OR REPLACE VIEW popular_itineraries AS
SELECT 
    i.id,
    i.slug,
    i.title,
    i.image_url,
    i.duration,
    i.description,
    COUNT(DISTINCT ib.id) as booking_count,
    COUNT(DISTINCT ir.id) as review_count,
    COALESCE(AVG(ir.rating), 0) as average_rating
FROM itineraries i
LEFT JOIN itinerary_bookings ib ON i.id = ib.itinerary_id
LEFT JOIN itinerary_reviews ir ON i.id = ir.itinerary_id
WHERE i.status = 'published'
GROUP BY i.id, i.slug, i.title, i.image_url, i.duration, i.description
ORDER BY booking_count DESC, review_count DESC, average_rating DESC;

-- Grant access to the view
GRANT SELECT ON popular_itineraries TO authenticated, anon;

-- Insert some sample data for testing (optional)
-- Uncomment the following lines if you want to insert sample data

/*
-- Insert sample itinerary
INSERT INTO itineraries (
    slug, title, duration, description, image_url, difficulty, best_season, 
    estimated_budget, category, status, featured
) VALUES (
    'bali-cultural-experience',
    'Bali Cultural Experience',
    '7 days',
    'Immerse yourself in the rich culture and traditions of Bali through this comprehensive tour.',
    'https://example.com/bali-culture.jpg',
    'easy',
    'April - October',
    '$800 - $1200',
    'cultural',
    'published',
    true
);

-- Insert sample day
INSERT INTO itinerary_days (
    itinerary_id, day_number, title, description, accommodation, meals, transportation
) VALUES (
    (SELECT id FROM itineraries WHERE slug = 'bali-cultural-experience'),
    1,
    'Arrival in Ubud',
    'Arrive in Ubud and explore the cultural heart of Bali.',
    'Traditional Balinese Resort',
    'Welcome dinner',
    'Airport transfer'
);

-- Insert sample activity
INSERT INTO itinerary_activities (
    itinerary_day_id, time_start, title, description, location, duration_minutes, order_index
) VALUES (
    (SELECT id FROM itinerary_days WHERE day_number = 1 AND itinerary_id = (SELECT id FROM itineraries WHERE slug = 'bali-cultural-experience')),
    '10:00',
    'Traditional Village Walk',
    'Explore a traditional Balinese village and meet local artisans.',
    'Penglipuran Village',
    120,
    1
);

-- Insert sample tags
INSERT INTO itinerary_tags (name) VALUES 
    ('cultural'),
    ('traditional'),
    ('village'),
    ('artisan'),
    ('temple')
ON CONFLICT (name) DO NOTHING;

-- Link tags to itinerary
INSERT INTO itinerary_tag_relations (itinerary_id, tag_id)
SELECT 
    (SELECT id FROM itineraries WHERE slug = 'bali-cultural-experience'),
    id
FROM itinerary_tags 
WHERE name IN ('cultural', 'traditional', 'village');
*/

-- Create helpful functions for the application

-- Function to search itineraries
CREATE OR REPLACE FUNCTION search_itineraries(
    search_query TEXT DEFAULT '',
    category_filter TEXT DEFAULT '',
    difficulty_filter TEXT DEFAULT '',
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    slug VARCHAR,
    title VARCHAR,
    duration VARCHAR,
    description TEXT,
    image_url VARCHAR,
    difficulty difficulty_level,
    category VARCHAR,
    best_season VARCHAR,
    estimated_budget VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id, i.slug, i.title, i.duration, i.description, 
        i.image_url, i.difficulty, i.category, i.best_season, i.estimated_budget
    FROM itineraries i
    WHERE 
        i.status = 'published'
        AND (search_query = '' OR i.title ILIKE '%' || search_query || '%' OR i.description ILIKE '%' || search_query || '%')
        AND (category_filter = '' OR i.category = category_filter)
        AND (difficulty_filter = '' OR i.difficulty::TEXT = difficulty_filter)
    ORDER BY i.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_itineraries(TEXT, TEXT, TEXT, INTEGER) TO authenticated, anon;

-- Function to get itinerary with full details
CREATE OR REPLACE FUNCTION get_itinerary_details(itinerary_slug TEXT)
RETURNS TABLE (
    id UUID,
    slug VARCHAR,
    title VARCHAR,
    duration VARCHAR,
    description TEXT,
    image_url VARCHAR,
    difficulty difficulty_level,
    best_season VARCHAR,
    estimated_budget VARCHAR,
    category VARCHAR,
    featured BOOLEAN,
    min_participants INTEGER,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id, i.slug, i.title, i.duration, i.description, i.image_url,
        i.difficulty, i.best_season, i.estimated_budget, i.category,
        i.featured, i.min_participants, i.max_participants, 
        i.created_at, i.updated_at
    FROM itineraries i
    WHERE i.slug = itinerary_slug AND i.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_itinerary_details(TEXT) TO authenticated, anon;

-- Create a function to check if user has reviewed an itinerary
CREATE OR REPLACE FUNCTION has_user_reviewed_itinerary(
    user_id UUID,
    itinerary_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM itinerary_reviews 
        WHERE user_id = $1 AND itinerary_id = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION has_user_reviewed_itinerary(UUID, UUID) TO authenticated;

-- Migration completed successfully
-- Remember to run this script in your Supabase SQL editor
-- and adjust the references to match your existing table structure (e.g., destinations, tour_guides, auth.users)
