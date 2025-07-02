-- Script untuk memastikan trigger update_tour_guide_rating aktif
-- Jalankan di Supabase SQL Editor

-- 1. Drop trigger lama jika ada
DROP TRIGGER IF EXISTS trigger_update_tour_guide_rating ON reviews;

-- 2. Buat ulang function update_tour_guide_rating 
CREATE OR REPLACE FUNCTION update_tour_guide_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  guide_id bigint;
  avg_rating numeric;
  total_reviews integer;
BEGIN
  -- Log untuk debugging
  RAISE NOTICE 'Trigger update_tour_guide_rating called for review ID %', NEW.id;
  
  -- Get tour guide id from booking
  SELECT tg.id INTO guide_id
  FROM tour_guides tg
  JOIN tours t ON t.tour_guide_id = tg.id
  JOIN bookings b ON b.tour_id = t.id
  WHERE b.id = NEW.booking_id;
  
  -- Jika tidak ada booking_id, ambil langsung dari tour_guide_id
  IF guide_id IS NULL AND NEW.tour_guide_id IS NOT NULL THEN
    guide_id := NEW.tour_guide_id;
  END IF;
  
  -- Log guide_id yang ditemukan
  RAISE NOTICE 'Found tour guide ID: %', guide_id;
  
  -- Jika tetap tidak ada guide_id, skip update
  IF guide_id IS NULL THEN
    RAISE NOTICE 'No tour guide ID found, skipping rating update';
    RETURN NEW;
  END IF;
  
  -- Calculate new rating and review count untuk guide ini
  SELECT AVG(r.rating), COUNT(r.id)
  INTO avg_rating, total_reviews
  FROM reviews r
  WHERE r.tour_guide_id = guide_id;
  
  -- Log hasil perhitungan
  RAISE NOTICE 'Calculated - Avg rating: %, Total reviews: %', avg_rating, total_reviews;
  
  -- Update tour guide rating
  UPDATE tour_guides
  SET rating = COALESCE(avg_rating, 0),
      review_count = total_reviews,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = guide_id;
  
  -- Log hasil update
  RAISE NOTICE 'Updated tour guide % with rating % and review count %', guide_id, COALESCE(avg_rating, 0), total_reviews;
  
  RETURN NEW;
END;
$$;

-- 3. Buat trigger baru
CREATE TRIGGER trigger_update_tour_guide_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tour_guide_rating();

-- 4. Test trigger dengan sample data
DO $$
DECLARE
  test_guide_id bigint;
  current_rating numeric;
  current_count integer;
  sample_review_id bigint;
BEGIN
  -- Ambil tour guide pertama
  SELECT id INTO test_guide_id FROM tour_guides LIMIT 1;
  
  IF test_guide_id IS NOT NULL THEN
    -- Ambil rating saat ini
    SELECT rating, review_count INTO current_rating, current_count 
    FROM tour_guides WHERE id = test_guide_id;
    
    RAISE NOTICE 'Testing with tour guide %, current rating: %, count: %', 
      test_guide_id, current_rating, current_count;
    
    -- Insert test review
    INSERT INTO reviews (user_id, tour_guide_id, rating, title, content, is_verified)
    VALUES (1, test_guide_id, 5, 'Test Review', 'Test trigger', true)
    RETURNING id INTO sample_review_id;
    
    RAISE NOTICE 'Created test review with ID: %', sample_review_id;
    
    -- Check rating setelah insert
    SELECT rating, review_count INTO current_rating, current_count 
    FROM tour_guides WHERE id = test_guide_id;
    
    RAISE NOTICE 'After test review - rating: %, count: %', current_rating, current_count;
    
    -- Hapus test review
    DELETE FROM reviews WHERE id = sample_review_id;
    RAISE NOTICE 'Test review deleted';
    
  ELSE
    RAISE NOTICE 'No tour guides found for testing';
  END IF;
END;
$$;

-- 5. Verifikasi trigger ada
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_tour_guide_rating';

-- 6. Manual rating update untuk memperbaiki data yang ada
UPDATE tour_guides 
SET 
  rating = COALESCE((
    SELECT AVG(r.rating) 
    FROM reviews r 
    WHERE r.tour_guide_id = tour_guides.id
  ), 0),
  review_count = COALESCE((
    SELECT COUNT(r.id) 
    FROM reviews r 
    WHERE r.tour_guide_id = tour_guides.id
  ), 0),
  updated_at = CURRENT_TIMESTAMP;

SELECT 'Trigger setup completed!' as status;
