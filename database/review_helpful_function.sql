-- Function to increment helpful count for reviews
CREATE OR REPLACE FUNCTION increment_review_helpful_count(review_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE reviews 
  SET helpful_count = helpful_count + 1 
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;
