-- Sample data for Destinations and related entities
-- This script inserts sample data into the destinations table and all related tables

-- Clear existing data (if needed)
DELETE FROM destination_images;
DELETE FROM attractions;
DELETE FROM activities;
DELETE FROM travel_tips;
DELETE FROM destination_categories;
DELETE FROM destinations;

-- Insert destinations
INSERT INTO destinations (id, slug, name, location, description, short_description, image_url, best_time_to_visit, google_maps_url, created_at, updated_at) 
VALUES 
(1, 'bali-indonesia', 'Bali', 'Bali, Indonesia', 
'Bali is a living postcard, an Indonesian paradise that feels like a fantasy. Soak up the sun on a stretch of fine white sand, or commune with the tropical creatures as you dive along coral ridges or the colorful wreck of a WWII war ship. On shore, the lush jungle shelters stone temples and mischievous monkeys. The "artistic capital" of Ubud is the perfect place to see a cultural dance performance, take a batik or silver-smithing workshop, or invigorate your mind and body in a yoga class.',
'Island paradise with beautiful beaches, vibrant culture, and ancient temples', 
'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800',
'April to October', 
'https://goo.gl/maps/XEQCoRy3MgUtCz6J7',
'2023-05-01 08:00:00',
'2023-05-01 08:00:00'),

(2, 'kyoto-japan', 'Kyoto', 'Kyoto, Japan', 
'Kyoto, once the capital of Japan, is a city on the island of Honshu. It''s famous for its numerous classical Buddhist temples, as well as gardens, imperial palaces, Shinto shrines and traditional wooden houses. It''s also known for formal traditions such as kaiseki dining, consisting of multiple courses of precise dishes, and geisha, female entertainers often found in the Gion district.',
'Ancient Japanese capital with over 1,600 Buddhist temples and 400 Shinto shrines', 
'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800',
'March to May and October to November', 
'https://goo.gl/maps/AZ2xH1NeQtPRJsrH9',
'2023-05-01 09:00:00',
'2023-05-01 09:00:00'),

(3, 'santorini-greece', 'Santorini', 'Cyclades Islands, Greece', 
'Santorini is one of the Cyclades islands in the Aegean Sea. It was devastated by a volcanic eruption in the 16th century BC, forever shaping its rugged landscape. The whitewashed, cubiform houses of its 2 principal towns, Fira and Oia, cling to cliffs above an underwater caldera (crater). They overlook the sea, small islands to the west and beaches made up of black, red and white lava pebbles.',
'Stunning Greek island with white-washed buildings and breathtaking sunsets', 
'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800',
'Late April to Early November', 
'https://goo.gl/maps/LTRJyQQvvkipenJ29',
'2023-05-02 10:00:00',
'2023-05-02 10:00:00'),

(4, 'machu-picchu-peru', 'Machu Picchu', 'Cusco Region, Peru', 
'Machu Picchu is an ancient Incan citadel set high in the Andes Mountains in Peru, above the Urubamba River valley. Built in the 15th century and later abandoned, it''s renowned for its sophisticated dry-stone walls that fuse huge blocks without the use of mortar, intriguing buildings that play on astronomical alignments and panoramic views. Its exact former use remains a mystery.',
'Ancient Incan city nestled among the clouds in the Andes Mountains', 
'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800',
'May to October', 
'https://goo.gl/maps/d7DPXhaXfgbzXgAF6',
'2023-05-02 11:00:00',
'2023-05-02 11:00:00'),

(5, 'raja-ampat-indonesia', 'Raja Ampat', 'West Papua, Indonesia', 
'Raja Ampat, or the Four Kings, is an archipelago located off the northwest tip of Bird''s Head Peninsula on the island of New Guinea. It comprises over 1,500 small islands, cays, and shoals surrounding the four main islands of Misool, Salawati, Batanta, and Waigeo. Raja Ampat is known for its rich marine biodiversity and is a paradise for divers and nature lovers.',
'Remote archipelago with the richest marine biodiversity on Earth', 
'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=800',
'October to April', 
'https://goo.gl/maps/nxoJ3JwSF6ajThSu5',
'2023-05-03 12:00:00',
'2023-05-03 12:00:00');

-- Insert destination_images
INSERT INTO destination_images (destination_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800'),
(1, 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800'),
(1, 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=800'),
(2, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800'),
(2, 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800'),
(3, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800'),
(3, 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800'),
(4, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800'),
(4, 'https://images.unsplash.com/photo-1587595551272-fce011e5b748?auto=format&fit=crop&w=800'),
(5, 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=800'),
(5, 'https://images.unsplash.com/photo-1583228858080-f31b5cdd94cc?auto=format&fit=crop&w=800');

-- Insert attractions
INSERT INTO attractions (destination_id, name, description, image_url) VALUES
(1, 'Pura Tanah Lot', 'Ancient Hindu sea temple perched on a rocky outcrop', 'https://images.unsplash.com/photo-1558005137-d9619a5c539f?auto=format&fit=crop&w=800'),
(1, 'Sacred Monkey Forest', 'Natural sanctuary with three Hindu temples and hundreds of monkeys', 'https://images.unsplash.com/photo-1584546525852-f372288a4d2a?auto=format&fit=crop&w=800'),
(1, 'Tegallalang Rice Terraces', 'Stunning terraced rice fields using traditional Balinese irrigation system', 'https://images.unsplash.com/photo-1596392301391-76e3571b531b?auto=format&fit=crop&w=800'),
(2, 'Fushimi Inari Shrine', 'Famous shrine with thousands of vermilion torii gates', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800'),
(2, 'Kinkaku-ji (Golden Pavilion)', 'Zen Buddhist temple covered in gold leaf', 'https://images.unsplash.com/photo-1583400315517-a58712ccb3ef?auto=format&fit=crop&w=800'),
(3, 'Oia Sunset Point', 'Famous viewpoint for watching Santorini''s legendary sunsets', 'https://images.unsplash.com/photo-1599577180618-dd26372fef1f?auto=format&fit=crop&w=800'),
(3, 'Red Beach', 'Unique beach with red volcanic sand and towering red cliffs', 'https://images.unsplash.com/photo-1560703245-a7778e0bbe45?auto=format&fit=crop&w=800'),
(4, 'Sun Gate (Inti Punku)', 'Ancient stone entryway with panoramic views of Machu Picchu', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800'),
(4, 'Temple of the Sun', 'Semi-circular temple dedicated to the Incan sun god Inti', 'https://images.unsplash.com/photo-1587595551272-fce011e5b748?auto=format&fit=crop&w=800'),
(5, 'Wayag Islands', 'Iconic karst islands with the best views in Raja Ampat', 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=800'),
(5, 'Kabui Passage', 'Narrow sea passage between limestone cliffs with rich marine life', 'https://images.unsplash.com/photo-1583228858080-f31b5cdd94cc?auto=format&fit=crop&w=800');

-- Insert activities
INSERT INTO activities (destination_id, name, description, duration, price, image_url) VALUES
(1, 'Balinese Cooking Class', 'Learn to prepare traditional Balinese dishes with local ingredients', '4 hours', '$45', 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&w=800'),
(1, 'Mount Batur Sunrise Trek', 'Hike up an active volcano to watch the sunrise over Bali', '7 hours', '$65', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800'),
(1, 'Ubud Art Tour', 'Explore Ubud''s art scene including galleries and artist workshops', '3 hours', '$25', 'https://images.unsplash.com/photo-1547656807-9733c2b738eb?auto=format&fit=crop&w=800'),
(2, 'Kimono Experience', 'Rent a traditional kimono and walk around historic Gion district', '4 hours', '$50', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800'),
(2, 'Tea Ceremony Workshop', 'Learn the traditional Japanese tea ceremony from a tea master', '1.5 hours', '$35', 'https://images.unsplash.com/photo-1522866389991-13be3589a06f?auto=format&fit=crop&w=800'),
(3, 'Catamaran Sunset Cruise', 'Sail around the caldera enjoying drinks and watching the sunset', '5 hours', '$95', 'https://images.unsplash.com/photo-1586016414761-bce889daa6c7?auto=format&fit=crop&w=800'),
(3, 'Wine Tasting Tour', 'Visit local wineries and taste Santorini''s unique volcanic wines', '4 hours', '$85', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800'),
(4, 'Guided Archaeological Tour', 'Explore Machu Picchu with an expert in Incan history', '3 hours', '$65', 'https://images.unsplash.com/photo-1587595551272-fce011e5b748?auto=format&fit=crop&w=800'),
(4, 'Huayna Picchu Climb', 'Challenging climb to the peak overlooking Machu Picchu', '2 hours', '$75', 'https://images.unsplash.com/photo-1525987112488-57879f6e0e65?auto=format&fit=crop&w=800'),
(5, 'Scuba Diving Package', 'Two tank dive in the world''s most biodiverse reefs', '5 hours', '$120', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800'),
(5, 'Island Hopping Tour', 'Visit multiple islands and beaches by traditional boat', 'Full day', '$85', 'https://images.unsplash.com/photo-1583228858080-f31b5cdd94cc?auto=format&fit=crop&w=800');

-- Insert travel tips
INSERT INTO travel_tips (destination_id, tip) VALUES
(1, 'Carry a sarong or scarf for temple visits as shoulders and knees must be covered'),
(1, 'Try the local coffee "kopi luwak" but be aware of ethical sourcing'),
(1, 'Negotiate prices at markets - start at 50% of the asking price'),
(2, 'Purchase a bus day pass for easy travel between temples'),
(2, 'Most temples close by 5:00 PM, so plan your visits accordingly'),
(2, 'Remove shoes before entering temples and traditional houses'),
(3, 'Book accommodations well in advance, especially during peak season'),
(3, 'Wear comfortable shoes for walking on cobblestone streets'),
(3, 'Try the local specialty "tomato keftedes" (tomato fritters)'),
(4, 'Acclimatize to the altitude in Cusco for at least two days before visiting'),
(4, 'Buy entrance tickets well in advance as daily visitor numbers are limited'),
(4, 'Bring insect repellent, sunscreen, and rain gear regardless of season'),
(5, 'Bring cash as ATMs are scarce and credit cards aren't widely accepted'),
(5, 'Pack biodegradable sunscreen to protect the coral reefs'),
(5, 'Bring motion sickness medication if you're prone to seasickness');

-- Insert destination categories
INSERT INTO destination_categories (destination_id, category) VALUES
(1, 'beach'),
(1, 'cultural'),
(1, 'nature'),
(2, 'cultural'),
(2, 'historical'),
(2, 'city'),
(3, 'beach'),
(3, 'nature'),
(3, 'adventure'),
(4, 'historical'),
(4, 'adventure'),
(4, 'nature'),
(5, 'beach'),
(5, 'nature'),
(5, 'adventure');
