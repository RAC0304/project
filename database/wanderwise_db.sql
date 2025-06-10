-- WanderWise Database Schema
-- Created on: June 3, 2025
-- Database: PostgreSQL

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS itinerary_activities CASCADE;
DROP TABLE IF EXISTS itinerary_days CASCADE;
DROP TABLE IF EXISTS itinerary_destinations CASCADE;
DROP TABLE IF EXISTS itinerary_requests CASCADE;
DROP TABLE IF EXISTS review_responses CASCADE;
DROP TABLE IF EXISTS review_tags CASCADE;
DROP TABLE IF EXISTS review_images CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS cultural_insights CASCADE;
DROP TABLE IF EXISTS travel_tips CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS attractions CASCADE;
DROP TABLE IF EXISTS destination_categories CASCADE;
DROP TABLE IF EXISTS destination_images CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS itineraries CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS tour_guide_languages CASCADE;
DROP TABLE IF EXISTS tour_guides CASCADE;
DROP TABLE IF EXISTS security_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_gender CASCADE;
DROP TYPE IF EXISTS security_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- Create custom ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'tour_guide', 'customer');
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE security_status AS ENUM ('success', 'failed', 'warning');
CREATE TYPE booking_status AS ENUM ('confirmed', 'pending', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'refunded');
CREATE TYPE request_status AS ENUM ('pending', 'processing', 'confirmed', 'cancelled');

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    phone VARCHAR(255) NULL,
    date_of_birth DATE NULL,
    gender user_gender NULL,
    profile_picture VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(255) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_email_active ON users (email, is_active);
CREATE INDEX idx_users_role_active ON users (role, is_active);
CREATE INDEX idx_users_locked_until ON users (locked_until);

-- Create trigger for users updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Security Logs Table
CREATE TABLE security_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255) NOT NULL,
    user_agent TEXT NOT NULL,
    status security_status DEFAULT 'success',
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for security_logs table
CREATE INDEX idx_security_logs_user_created ON security_logs (user_id, created_at);
CREATE INDEX idx_security_logs_status_created ON security_logs (status, created_at);
CREATE INDEX idx_security_logs_action_created ON security_logs (action, created_at);

-- Create trigger for security_logs updated_at
CREATE TRIGGER update_security_logs_updated_at BEFORE UPDATE ON security_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Tour Guides Table
CREATE TABLE tour_guides (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bio TEXT NULL,
    specialties JSONB NULL,
    location VARCHAR(255) NOT NULL,
    short_bio TEXT NULL,
    experience INTEGER DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    availability VARCHAR(255) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for tour_guides table
CREATE INDEX idx_tour_guides_location ON tour_guides (location);
CREATE INDEX idx_tour_guides_rating ON tour_guides (rating);
CREATE INDEX idx_tour_guides_verified ON tour_guides (is_verified);

-- Create trigger for tour_guides updated_at
CREATE TRIGGER update_tour_guides_updated_at BEFORE UPDATE ON tour_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Tour Guide Languages Table
CREATE TABLE tour_guide_languages (
    id BIGSERIAL PRIMARY KEY,
    tour_guide_id BIGINT NOT NULL,
    language VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tour_guide_id) REFERENCES tour_guides(id) ON DELETE CASCADE,
    UNIQUE (tour_guide_id, language)
);

-- Create trigger for tour_guide_languages updated_at
CREATE TRIGGER update_tour_guide_languages_updated_at BEFORE UPDATE ON tour_guide_languages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Destinations Table
CREATE TABLE destinations (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NULL,
    image_url VARCHAR(255) NULL,
    best_time_to_visit VARCHAR(255) NULL,
    google_maps_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for destinations table
CREATE INDEX idx_destinations_name ON destinations (name);
CREATE INDEX idx_destinations_location ON destinations (location);

-- Create trigger for destinations updated_at
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Destination Images Table
CREATE TABLE destination_images (
    id BIGSERIAL PRIMARY KEY,
    destination_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Create trigger for destination_images updated_at
CREATE TRIGGER update_destination_images_updated_at BEFORE UPDATE ON destination_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Destination Categories Table
CREATE TABLE destination_categories (
    id BIGSERIAL PRIMARY KEY,
    destination_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE (destination_id, category)
);

-- Create Attractions Table
CREATE TABLE attractions (
    id BIGSERIAL PRIMARY KEY,
    destination_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Create indexes for attractions table
CREATE INDEX idx_attractions_name ON attractions (name);

-- Create trigger for attractions updated_at
CREATE TRIGGER update_attractions_updated_at BEFORE UPDATE ON attractions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Activities Table
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    destination_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration VARCHAR(100) NULL,
    price VARCHAR(100) NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Create indexes for activities table
CREATE INDEX idx_activities_name ON activities (name);

-- Create trigger for activities updated_at
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Travel Tips Table
CREATE TABLE travel_tips (
    id BIGSERIAL PRIMARY KEY,
    destination_id BIGINT NOT NULL,
    tip TEXT NOT NULL,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Create Tours Table
CREATE TABLE tours (
    id BIGSERIAL PRIMARY KEY,
    tour_guide_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    max_group_size INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tour_guide_id) REFERENCES tour_guides(id) ON DELETE CASCADE
);

-- Create indexes for tours table
CREATE INDEX idx_tours_title ON tours (title);
CREATE INDEX idx_tours_location ON tours (location);
CREATE INDEX idx_tours_price ON tours (price);
CREATE INDEX idx_tours_active ON tours (is_active);

-- Create trigger for tours updated_at
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Itineraries Table
CREATE TABLE itineraries (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    difficulty VARCHAR(100) NULL,
    best_season VARCHAR(255) NULL,
    estimated_budget VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for itineraries table
CREATE INDEX idx_itineraries_title ON itineraries (title);
CREATE INDEX idx_itineraries_difficulty ON itineraries (difficulty);

-- Create trigger for itineraries updated_at
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Bookings Table
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    participants INTEGER NOT NULL,
    status booking_status DEFAULT 'pending',
    special_requests TEXT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for bookings table
CREATE INDEX idx_bookings_date ON bookings (date);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_payment ON bookings (payment_status);

-- Create trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Reviews Table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NULL,
    destination_id BIGINT NULL,
    tour_guide_id BIGINT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    FOREIGN KEY (tour_guide_id) REFERENCES tour_guides(id) ON DELETE SET NULL
);

-- Create indexes for reviews table
CREATE INDEX idx_reviews_rating ON reviews (rating);
CREATE INDEX idx_reviews_helpful ON reviews (helpful_count);

-- Create trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Review Images Table
CREATE TABLE review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Create Review Tags Table
CREATE TABLE review_tags (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    UNIQUE (review_id, tag)
);

-- Create Review Responses Table
CREATE TABLE review_responses (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create trigger for review_responses updated_at
CREATE TRIGGER update_review_responses_updated_at BEFORE UPDATE ON review_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Itinerary Destinations Table
CREATE TABLE itinerary_destinations (
    id BIGSERIAL PRIMARY KEY,
    itinerary_id BIGINT NOT NULL,
    destination_id BIGINT NOT NULL,
    
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE (itinerary_id, destination_id)
);

-- Create Itinerary Days Table
CREATE TABLE itinerary_days (
    id BIGSERIAL PRIMARY KEY,
    itinerary_id BIGINT NOT NULL,
    day INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    accommodation VARCHAR(255) NULL,
    meals VARCHAR(255) NULL,
    transportation VARCHAR(255) NULL,
    
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    UNIQUE (itinerary_id, day)
);

-- Create Itinerary Activities Table
CREATE TABLE itinerary_activities (
    id BIGSERIAL PRIMARY KEY,
    itinerary_day_id BIGINT NOT NULL,
    time VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE
);

-- Create Itinerary Requests Table
CREATE TABLE itinerary_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    itinerary_id BIGINT NOT NULL,
    tour_guide_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    group_size VARCHAR(50) NOT NULL,
    additional_requests TEXT NULL,
    status request_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_guide_id) REFERENCES tour_guides(id) ON DELETE SET NULL
);

-- Create indexes for itinerary_requests table
CREATE INDEX idx_itinerary_requests_status ON itinerary_requests (status);

-- Create trigger for itinerary_requests updated_at
CREATE TRIGGER update_itinerary_requests_updated_at BEFORE UPDATE ON itinerary_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Cultural Insights Table
CREATE TABLE cultural_insights (
    id BIGSERIAL PRIMARY KEY,
    destination_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Create indexes for cultural_insights table
CREATE INDEX idx_cultural_insights_title ON cultural_insights (title);

-- Create trigger for cultural_insights updated_at
CREATE TRIGGER update_cultural_insights_updated_at BEFORE UPDATE ON cultural_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample Data: Insert admin user
INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@wanderwise.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Add comments explaining schema relationships
/*
Database Relationships:

1. One user can be associated with one tour_guide profile (1:1)
2. One tour_guide can offer many tours (1:N)
3. One tour_guide can speak multiple languages (1:N)
4. One destination can have many attractions, activities, and travel tips (1:N)
5. One destination can have multiple images and categories (1:N)
6. One tour can have multiple bookings (1:N)
7. One user can make multiple bookings (1:N)
8. One user can write multiple reviews (1:N)
9. One review can have many images and tags (1:N)
10. One review can have multiple responses (1:N)
11. One itinerary can include multiple destinations (N:M)
12. One itinerary can have multiple day plans (1:N)
13. One itinerary day can have multiple activities (1:N)
14. One itinerary can receive multiple booking requests (1:N)
*/
