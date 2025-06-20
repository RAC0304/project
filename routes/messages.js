import express from "express";
import { supabase } from "../src/config/supabaseServerClient";

const router = express.Router();

// Get all messages for a tour guide
router.get("/messages/:tourGuideId", async (req, res) => {
  const { tourGuideId } = req.params;
  const { data, error } = await supabase
    .from("messages")
    .select(
      "*, sender:sender_id (id, first_name, last_name, profile_picture), receiver:receiver_id (id, first_name, last_name, profile_picture)"
    )
    .eq("tour_guide_id", tourGuideId)
    .order("sent_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create/send a new message
router.post("/messages", async (req, res) => {
  const { sender_id, receiver_id, tour_guide_id, content } = req.body;
  if (!sender_id || !receiver_id || !content) {
    return res
      .status(400)
      .json({ error: "sender_id, receiver_id, and content are required" });
  }
  const { data, error } = await supabase
    .from("messages")
    .insert([{ sender_id, receiver_id, tour_guide_id, content }])
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Mark message as read
router.patch("/messages/:id/read", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
