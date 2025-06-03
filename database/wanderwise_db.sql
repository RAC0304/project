-- WanderWise Database Schema
-- Created on: June 3, 2025

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS itinerary_activities;
DROP TABLE IF EXISTS itinerary_days;
DROP TABLE IF EXISTS itinerary_destinations;
DROP TABLE IF EXISTS itinerary_requests;
DROP TABLE IF EXISTS review_responses;
DROP TABLE IF EXISTS review_tags;
DROP TABLE IF EXISTS review_images;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS cultural_insights;
DROP TABLE IF EXISTS travel_tips;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS attractions;
DROP TABLE IF EXISTS destination_categories;
DROP TABLE IF EXISTS destination_images;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS itineraries;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS tour_guide_languages;
DROP TABLE IF EXISTS tour_guides;
DROP TABLE IF EXISTS security_logs;
DROP TABLE IF EXISTS users;

-- Create Users Table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'tour_guide', 'customer') DEFAULT 'customer',
    phone VARCHAR(255) NULL,
    date_of_birth DATE NULL,
    gender ENUM('male', 'female', 'other') NULL,
    profile_picture VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(255) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email_active (email, is_active),
    INDEX idx_role_active (role, is_active),
    INDEX idx_locked_until (locked_until)
);

-- Create Security Logs Table
CREATE TABLE security_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255) NOT NULL,
    user_agent TEXT NOT NULL,
    status ENUM('success', 'failed', 'warning') DEFAULT 'success',
    details TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_status_created (status, created_at),
    INDEX idx_action_created (action, created_at)
);

-- Create Tour Guides Table
CREATE TABLE tour_guides (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    bio TEXT NULL,
    specialties JSON NULL,
    location VARCHAR(255) NOT NULL,
    short_bio TEXT NULL,
    experience INT DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 0,
    review_count INT DEFAULT 0,
    availability VARCHAR(255) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (location),
    INDEX idx_rating (rating),
    INDEX idx_verified (is_verified)
);

-- Create Tour Guide Languages Table
CREATE TABLE tour_guide_languages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tour_guide_id BIGINT UNSIGNED NOT NULL,
    language VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tour_guide_id) REFERENCES tour_guides(id) ON DELETE CASCADE,
    UNIQUE (tour_guide_id, language)
);

-- Create Destinations Table
CREATE TABLE destinations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NULL,
    image_url VARCHAR(255) NULL,
    best_time_to_visit VARCHAR(255) NULL,
    google_maps_url TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_location (location)
);

-- Create Destination Images Table
CREATE TABLE destination_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Create Destination Categories Table
CREATE TABLE destination_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT UNSIGNED NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE (destination_id, category)
);

-- Create Attractions Table
CREATE TABLE attractions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX idx_name (name)
);

-- Create Activities Table
CREATE TABLE activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration VARCHAR(100) NULL,
    price VARCHAR(100) NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX idx_name (name)
);

-- Create Travel Tips Table
CREATE TABLE travel_tips (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT UNSIGNED NOT NULL,
    tip TEXT NOT NULL,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Create Tours Table
CREATE TABLE tours (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tour_guide_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    max_group_size INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tour_guide_id) REFERENCES tour_guides(id) ON DELETE CASCADE,
    INDEX idx_title (title),
    INDEX idx_location (location),
    INDEX idx_price (price),
    INDEX idx_active (is_active)
);

-- Create Itineraries Table
CREATE TABLE itineraries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    difficulty VARCHAR(100) NULL,
    best_season VARCHAR(255) NULL,
    estimated_budget VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_title (title),
    INDEX idx_difficulty (difficulty)
);

-- Create Bookings Table
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tour_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    participants INT NOT NULL,
    status ENUM('confirmed', 'pending', 'cancelled', 'completed') DEFAULT 'pending',
    special_requests TEXT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    payment_status ENUM('paid', 'pending', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_payment (payment_status)
);

-- Create Reviews Table
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NULL,
    destination_id BIGINT UNSIGNED NULL,
    tour_guide_id BIGINT UNSIGNED NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    helpful_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    FOREIGN KEY (tour_guide_id) REFERENCES tour_guides(id) ON DELETE SET NULL,
    INDEX idx_rating (rating),
    INDEX idx_helpful (helpful_count)
);

-- Create Review Images Table
CREATE TABLE review_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Create Review Tags Table
CREATE TABLE review_tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    tag VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    UNIQUE (review_id, tag)
);

-- Create Review Responses Table
CREATE TABLE review_responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Itinerary Destinations Table
CREATE TABLE itinerary_destinations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    itinerary_id BIGINT UNSIGNED NOT NULL,
    destination_id BIGINT UNSIGNED NOT NULL,
    
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE (itinerary_id, destination_id)
);

-- Create Itinerary Days Table
CREATE TABLE itinerary_days (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    itinerary_id BIGINT UNSIGNED NOT NULL,
    day INT NOT NULL,
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
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    itinerary_day_id BIGINT UNSIGNED NOT NULL,
    time VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE
);

-- Create Itinerary Requests Table
CREATE TABLE itinerary_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    itinerary_id BIGINT UNSIGNED NOT NULL,
    tour_guide_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    group_size VARCHAR(50) NOT NULL,
    additional_requests TEXT NULL,
    status ENUM('pending', 'processing', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_guide_id) REFERENCES tour_guides(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

-- Create Cultural Insights Table
CREATE TABLE cultural_insights (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX idx_title (title)
);

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
