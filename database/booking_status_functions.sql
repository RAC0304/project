-- Database functions untuk booking status management

-- 1. Function untuk update status booking otomatis
CREATE OR REPLACE FUNCTION update_booking_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update booking yang sudah lewat tanggalnya menjadi completed
  UPDATE bookings 
  SET status = 'completed',
      updated_at = CURRENT_TIMESTAMP
  WHERE date < CURRENT_DATE 
    AND status = 'confirmed'
    AND payment_status = 'paid';
    
  -- Log hasil update
  RAISE NOTICE 'Updated % bookings to completed status', 
    (SELECT count(*) FROM bookings 
     WHERE date < CURRENT_DATE 
       AND status = 'completed' 
       AND payment_status = 'paid');
END;
$$;

-- 2. Function untuk cek apakah user bisa review booking
CREATE OR REPLACE FUNCTION can_user_review(p_user_id bigint, p_booking_id bigint)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  booking_record RECORD;
  existing_review_count INTEGER;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record
  FROM bookings
  WHERE id = p_booking_id AND user_id = p_user_id;
  
  -- Check if booking exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if tour is completed
  IF booking_record.status != 'completed' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if payment is completed
  IF booking_record.payment_status != 'paid' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already reviewed this booking
  SELECT COUNT(*) INTO existing_review_count
  FROM reviews
  WHERE user_id = p_user_id AND booking_id = p_booking_id;
  
  IF existing_review_count > 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 3. Function untuk update tour guide rating setelah review
CREATE OR REPLACE FUNCTION update_tour_guide_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  guide_id bigint;
  avg_rating numeric;
  total_reviews integer;
BEGIN
  -- Get tour guide id from booking
  SELECT tg.id INTO guide_id
  FROM tour_guides tg
  JOIN tours t ON t.tour_guide_id = tg.id
  JOIN bookings b ON b.tour_id = t.id
  WHERE b.id = NEW.booking_id;
  
  -- Calculate new rating and review count
  SELECT AVG(r.rating), COUNT(r.id)
  INTO avg_rating, total_reviews
  FROM reviews r
  WHERE r.tour_guide_id = guide_id;
  
  -- Update tour guide rating
  UPDATE tour_guides
  SET rating = COALESCE(avg_rating, 0),
      review_count = total_reviews,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = guide_id;
  
  RETURN NEW;
END;
$$;

-- 4. Create trigger untuk update rating otomatis
DROP TRIGGER IF EXISTS trigger_update_tour_guide_rating ON reviews;
CREATE TRIGGER trigger_update_tour_guide_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tour_guide_rating();

-- 5. Function untuk get booking stats (optional)
CREATE OR REPLACE FUNCTION get_customer_booking_stats(p_user_id bigint)
RETURNS TABLE(
  upcoming_count bigint,
  today_count bigint,
  completed_count bigint,
  review_needed_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Upcoming tours
    (SELECT COUNT(*) FROM bookings 
     WHERE user_id = p_user_id 
       AND status = 'confirmed' 
       AND payment_status = 'paid'
       AND date > CURRENT_DATE) as upcoming_count,
    
    -- Today's tours
    (SELECT COUNT(*) FROM bookings 
     WHERE user_id = p_user_id 
       AND status = 'confirmed' 
       AND payment_status = 'paid'
       AND date = CURRENT_DATE) as today_count,
    
    -- Completed tours
    (SELECT COUNT(*) FROM bookings 
     WHERE user_id = p_user_id 
       AND status = 'completed' 
       AND payment_status = 'paid') as completed_count,
    
    -- Tours needing review
    (SELECT COUNT(*) FROM bookings b
     WHERE b.user_id = p_user_id 
       AND b.status = 'completed' 
       AND b.payment_status = 'paid'
       AND NOT EXISTS (
         SELECT 1 FROM reviews r 
         WHERE r.user_id = p_user_id 
           AND r.booking_id = b.id
       )) as review_needed_count;
END;
$$;

-- 6. Schedule cron job untuk update booking status otomatis
-- (Jika extension pg_cron tersedia)
-- SELECT cron.schedule(
--   'update-booking-status',
--   '1 0 * * *', -- Setiap hari jam 00:01
--   'SELECT update_booking_status();'
-- );

-- 7. Manual test function (untuk development)
CREATE OR REPLACE FUNCTION test_booking_status_functions()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  result TEXT := '';
BEGIN
  -- Test update booking status
  PERFORM update_booking_status();
  result := result || 'Booking status updated successfully. ';
  
  -- Test can review function
  IF can_user_review(1, 1) THEN
    result := result || 'Review eligibility check passed. ';
  ELSE
    result := result || 'Review eligibility check failed (expected for test). ';
  END IF;
  
  RETURN result;
END;
$$;

-- 8. Create indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_status_date 
ON bookings(user_id, status, payment_status, date);

CREATE INDEX IF NOT EXISTS idx_reviews_user_booking 
ON reviews(user_id, booking_id);

CREATE INDEX IF NOT EXISTS idx_bookings_date_status 
ON bookings(date, status) WHERE payment_status = 'paid';

-- Comments untuk dokumentasi
COMMENT ON FUNCTION update_booking_status() IS 'Updates booking status to completed for past dates';
COMMENT ON FUNCTION can_user_review(bigint, bigint) IS 'Checks if user can write review for a booking';
COMMENT ON FUNCTION update_tour_guide_rating() IS 'Updates tour guide rating after new review';
COMMENT ON FUNCTION get_customer_booking_stats(bigint) IS 'Returns booking statistics for a customer';
