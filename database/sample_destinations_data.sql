-- Sample destinations data for testing
-- This script populates the destinations tables with sample data

-- Insert sample destinations
INSERT INTO destinations (slug, name, location, description, short_description, image_url, best_time_to_visit, google_maps_url) VALUES
(
  'bali',
  'Bali',
  'Bali, Indonesia',
  'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple. To the south, the beachside city of Kuta has lively bars, while Seminyak, Sanur and Nusa Dua are popular resort towns. The island is also known for its yoga and meditation retreats.',
  'Island of the Gods with pristine beaches, ancient temples, and lush rice terraces',
  'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
  'April hingga Oktober',
  'https://maps.google.com/?q=Bali,Indonesia'
),
(
  'yogyakarta',
  'Yogyakarta',
  'Yogyakarta, Indonesia',
  'Yogyakarta is a city on the Indonesian island of Java known for its traditional arts and cultural heritage. Its Yogyakarta Sultanate palace is a complex of royal buildings. The 8th-century Buddhist temple Borobudur and the 9th-century Hindu temple Prambanan are nearby.',
  'Cultural heart of Java with ancient temples and royal heritage',
  'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg',
  'Mei hingga September',
  'https://maps.google.com/?q=Yogyakarta,Indonesia'
),
(
  'raja-ampat',
  'Raja Ampat',
  'Papua Barat, Indonesia',
  'Raja Ampat is an archipelago comprising hundreds of small islands off the northwest tip of Indonesia''s West Papua province. It''s known for its marine biodiversity, with many dive sites. Coral reefs support a variety of marine life, including reef sharks, manta rays and turtles.',
  'Paradise for divers with the world''s richest marine biodiversity',
  'https://images.pexels.com/photos/4275885/pexels-photo-4275885.jpeg',
  'Oktober hingga April',
  'https://maps.google.com/?q=Raja+Ampat,Papua+Barat,Indonesia'
),
(
  'lombok',
  'Lombok',
  'Nusa Tenggara Barat, Indonesia',
  'Lombok is an Indonesian island east of Bali and west of Sumbawa, part of the Lesser Sunda chain. It''s known for beaches and surfing spots, particularly at Kuta and Banko Banko. The mountain Gunung Rinjani is an active volcano with a crater lake.',
  'Pristine beaches and majestic Mount Rinjani volcano',
  'https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg',
  'April hingga Oktober',
  'https://maps.google.com/?q=Lombok,Indonesia'
),
(
  'bandung',
  'Bandung',
  'Jawa Barat, Indonesia',
  'Bandung is the capital of West Java province in Indonesia. It''s known for its colonial and art deco architecture. The city is also famous for its highland plateau setting and cooler climate, making it a popular weekend getaway.',
  'Cool highland city famous for fashion, food, and colonial architecture',
  'https://images.pexels.com/photos/2170473/pexels-photo-2170473.jpeg',
  'Sepanjang tahun',
  'https://maps.google.com/?q=Bandung,Indonesia'
),
(
  'komodo',
  'Pulau Komodo',
  'Nusa Tenggara Timur, Indonesia',
  'Komodo National Park comprises three large islands (Komodo, Rinca and Padar) and 26 smaller ones. It''s home to the world''s largest lizard, the Komodo dragon. The park''s terrain is diverse, with rounded hills, savanna, and pristine beaches.',
  'Home to the legendary Komodo dragons and pink beaches',
  'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
  'April hingga Desember',
  'https://maps.google.com/?q=Komodo+National+Park,Indonesia'
);

-- Insert destination categories
INSERT INTO destination_categories (destination_id, category) VALUES
-- Bali categories
((SELECT id FROM destinations WHERE slug = 'bali'), 'beach'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'cultural'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'nature'),

-- Yogyakarta categories
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'cultural'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'historical'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'city'),

-- Raja Ampat categories
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'beach'),
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'nature'),
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'adventure'),

-- Lombok categories
((SELECT id FROM destinations WHERE slug = 'lombok'), 'beach'),
((SELECT id FROM destinations WHERE slug = 'lombok'), 'mountain'),
((SELECT id FROM destinations WHERE slug = 'lombok'), 'adventure'),

-- Bandung categories
((SELECT id FROM destinations WHERE slug = 'bandung'), 'city'),
((SELECT id FROM destinations WHERE slug = 'bandung'), 'mountain'),
((SELECT id FROM destinations WHERE slug = 'bandung'), 'cultural'),

-- Komodo categories
((SELECT id FROM destinations WHERE slug = 'komodo'), 'nature'),
((SELECT id FROM destinations WHERE slug = 'komodo'), 'adventure'),
((SELECT id FROM destinations WHERE slug = 'komodo'), 'beach');

-- Insert destination images
INSERT INTO destination_images (destination_id, image_url) VALUES
-- Bali images
((SELECT id FROM destinations WHERE slug = 'bali'), 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'https://images.pexels.com/photos/5766288/pexels-photo-5766288.jpeg'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg'),

-- Yogyakarta images
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'https://images.pexels.com/photos/2170473/pexels-photo-2170473.jpeg'),

-- Raja Ampat images
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'https://images.pexels.com/photos/4275885/pexels-photo-4275885.jpeg'),
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg'),

-- Lombok images
((SELECT id FROM destinations WHERE slug = 'lombok'), 'https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg'),
((SELECT id FROM destinations WHERE slug = 'lombok'), 'https://images.pexels.com/photos/5766288/pexels-photo-5766288.jpeg'),

-- Bandung images
((SELECT id FROM destinations WHERE slug = 'bandung'), 'https://images.pexels.com/photos/2170473/pexels-photo-2170473.jpeg'),

-- Komodo images
((SELECT id FROM destinations WHERE slug = 'komodo'), 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg');

-- Insert sample attractions
INSERT INTO attractions (destination_id, name, description, image_url) VALUES
-- Bali attractions
((SELECT id FROM destinations WHERE slug = 'bali'), 'Tanah Lot Temple', 'Iconic sea temple perched on a rock formation', 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'Ubud Monkey Forest', 'Natural sanctuary with over 700 monkeys', 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'Tegallalang Rice Terraces', 'Stunning green stepped rice paddies in central Bali', 'https://images.pexels.com/photos/5766288/pexels-photo-5766288.jpeg'),

-- Yogyakarta attractions
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Borobudur Temple', 'UNESCO World Heritage 8th-century Buddhist temple', 'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Prambanan Temple', 'Magnificent 9th-century Hindu temple complex', 'https://images.pexels.com/photos/2170473/pexels-photo-2170473.jpeg'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Kraton Palace', 'Sultan''s royal palace with traditional Javanese architecture', 'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg'),

-- Raja Ampat attractions
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'Pianemo Island', 'Famous mushroom-shaped islands and hidden lagoons', 'https://images.pexels.com/photos/4275885/pexels-photo-4275885.jpeg'),
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'Arborek Village', 'Traditional village known for handicrafts and marine conservation', 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg');

-- Insert sample activities
INSERT INTO activities (destination_id, name, description, duration, price, image_url) VALUES
-- Bali activities
((SELECT id FROM destinations WHERE slug = 'bali'), 'Temple Tour', 'Visit iconic temples including Tanah Lot and Uluwatu', '8 hours', 'Rp 500.000', 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'Rice Terrace Trek', 'Guided walk through Tegallalang rice terraces', '4 hours', 'Rp 300.000', 'https://images.pexels.com/photos/5766288/pexels-photo-5766288.jpeg'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'Snorkeling Adventure', 'Explore colorful coral reefs and marine life', '6 hours', 'Rp 400.000', 'https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg'),

-- Yogyakarta activities
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Borobudur Sunrise Tour', 'Watch the sunrise from the ancient Buddhist temple', '5 hours', 'Rp 450.000', 'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Batik Workshop', 'Learn traditional Javanese batik making techniques', '3 hours', 'Rp 200.000', 'https://images.pexels.com/photos/2170473/pexels-photo-2170473.jpeg'),

-- Raja Ampat activities
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'Diving Expedition', 'World-class diving in pristine coral reefs', '8 hours', 'Rp 800.000', 'https://images.pexels.com/photos/4275885/pexels-photo-4275885.jpeg'),
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'Island Hopping', 'Explore multiple islands and hidden lagoons', '10 hours', 'Rp 1.000.000', 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg');

-- Insert sample travel tips
INSERT INTO travel_tips (destination_id, tip) VALUES
-- Bali travel tips
((SELECT id FROM destinations WHERE slug = 'bali'), 'Waktu terbaik mengunjungi Bali adalah saat musim kemarau (April-Oktober) untuk cuaca cerah'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'Sewa motor untuk mobilitas yang lebih fleksibel, tapi pastikan memiliki SIM internasional'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'Hormati budaya lokal, terutama saat mengunjungi pura-pura suci'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'Coba kuliner lokal seperti nasi gudeg, bebek betutu, dan sate lilit'),
((SELECT id FROM destinations WHERE slug = 'bali'), 'Bawa tabir surya dan topi karena sinar matahari cukup terik'),

-- Yogyakarta travel tips
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Gunakan becak atau andong untuk pengalaman transportasi tradisional'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Kunjungi Malioboro Street untuk berbelanja batik dan oleh-oleh'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Coba wisata kuliner di Jalan Prawirotaman dan sekitar Malioboro'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Booking tiket Borobudur dan Prambanan online untuk menghindari antrian'),
((SELECT id FROM destinations WHERE slug = 'yogyakarta'), 'Bawa pakaian sopan saat mengunjungi Kraton dan tempat bersejarah'),

-- Raja Ampat travel tips
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'Bawa perlengkapan snorkeling/diving sendiri untuk kenyamanan maksimal'),
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'Booking akomodasi jauh-jauh hari karena pilihan terbatas'),
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'Siapkan cash karena fasilitas ATM sangat terbatas'),
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'Bawa obat-obatan pribadi karena fasilitas kesehatan terbatas'),
((SELECT id FROM destinations WHERE slug = 'raja-ampat'), 'Hormati lingkungan laut dengan tidak menyentuh terumbu karang'),

-- Lombok travel tips
((SELECT id FROM destinations WHERE slug = 'lombok'), 'Persiapkan fisik yang baik jika ingin mendaki Gunung Rinjani'),
((SELECT id FROM destinations WHERE slug = 'lombok'), 'Bawa jaket tebal untuk pendakian karena suhu dingin di malam hari'),
((SELECT id FROM destinations WHERE slug = 'lombok'), 'Coba kuliner khas Lombok seperti ayam taliwang dan plecing kangkung'),
((SELECT id FROM destinations WHERE slug = 'lombok'), 'Gunakan jasa pemandu lokal untuk keamanan saat trekking'),

-- Bandung travel tips
((SELECT id FROM destinations WHERE slug = 'bandung'), 'Bawa jaket karena cuaca Bandung relatif dingin'),
((SELECT id FROM destinations WHERE slug = 'bandung'), 'Kunjungi factory outlet untuk berbelanja pakaian dengan harga terjangkau'),
((SELECT id FROM destinations WHERE slug = 'bandung'), 'Coba kuliner khas Bandung seperti batagor, siomay, dan bandrek'),
((SELECT id FROM destinations WHERE slug = 'bandung'), 'Gunakan transportasi online atau sewa mobil untuk berkeliling'),

-- Komodo travel tips
((SELECT id FROM destinations WHERE slug = 'komodo'), 'Gunakan jasa tour guide resmi untuk keamanan saat bertemu komodo'),
((SELECT id FROM destinations WHERE slug = 'komodo'), 'Bawa sepatu trekking yang nyaman untuk hiking di pulau'),
((SELECT id FROM destinations WHERE slug = 'komodo'), 'Siapkan kamera underwater untuk diving di spot-spot terbaik'),
((SELECT id FROM destinations WHERE slug = 'komodo'), 'Booking liveaboard atau day tour dari Labuan Bajo');
