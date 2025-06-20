const express = require("express");
const router = express.Router();
const { supabase } = require("../src/config/supabaseClient");

// Get all reviews (optionally filter by tour_guide_id, destination_id, user_id)
router.get("/", async (req, res) => {
  const { tour_guide_id, destination_id, user_id } = req.query;
  let query = supabase.from("reviews").select("*");
  if (tour_guide_id) query = query.eq("tour_guide_id", tour_guide_id);
  if (destination_id) query = query.eq("destination_id", destination_id);
  if (user_id) query = query.eq("user_id", user_id);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get review detail (with images, responses, tags)
router.get("/:id", async (req, res) => {
  const review_id = req.params.id;
  const { data: review, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", review_id)
    .single();
  if (error) return res.status(404).json({ error: "Review not found" });
  const { data: images } = await supabase
    .from("review_images")
    .select("*")
    .eq("review_id", review_id);
  const { data: responses } = await supabase
    .from("review_responses")
    .select("*")
    .eq("review_id", review_id);
  const { data: tags } = await supabase
    .from("review_tags")
    .select("*")
    .eq("review_id", review_id);
  res.json({ ...review, images, responses, tags });
});

// Add a response to a review
router.post("/:id/responses", async (req, res) => {
  const review_id = req.params.id;
  const { user_id, response } = req.body;
  if (!user_id || !response)
    return res.status(400).json({ error: "user_id and response required" });
  const { data, error } = await supabase
    .from("review_responses")
    .insert([{ review_id, user_id, response }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

module.exports = router;
