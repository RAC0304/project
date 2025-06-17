const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

// Load from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Edit profile endpoint
router.put("/edit-profile", async (req, res) => {
  const {
    id,
    firstName,
    lastName,
    phone,
    location,
    languages,
    experience,
    bio,
    profile_picture,
  } = req.body;
  if (!id) return res.status(400).json({ error: "User id is required" });

  console.log("[EDIT PROFILE] Payload:", req.body); // Log payload

  // Update users table (main user data)
  const { data, error } = await supabase
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone,
      location,
      languages: languages
        ? languages.split(",").map((l) => l.trim())
        : undefined,
      experience,
      bio,
      profile_picture,
    })
    .eq("id", id)
    .single();

  if (error) {
    console.error("[EDIT PROFILE] Supabase error:", error); // Log error
    return res.status(400).json({ error: error.message });
  }
  console.log("[EDIT PROFILE] Update success:", data); // Log success
  res.json({ data });
});

// Tour Guide Profile Edit endpoint
router.put("/edit-tour-guide", async (req, res) => {
  const {
    id,
    user_id,
    firstName,
    lastName,
    phone,
    location,
    languages,
    experience,
    bio,
    specialties,
    short_bio,
    availability,
    profile_picture,
  } = req.body;

  if (!id && !user_id)
    return res
      .status(400)
      .json({ error: "User ID or Tour Guide ID is required" });

  console.log("[EDIT TOURGUIDE PROFILE] Payload:", req.body);

  try {
    // Begin transaction to update both users and tour_guides tables
    // 1. Update the users table
    const userUpdateData = {
      first_name: firstName,
      last_name: lastName,
      phone,
      location,
      languages: languages
        ? languages.split(",").map((l) => l.trim())
        : undefined,
      experience: experience ? parseInt(experience, 10) : undefined,
      bio,
      profile_picture,
    };

    const userUpdatePromise = supabase
      .from("users")
      .update(userUpdateData)
      .eq("id", user_id);

    // 2. Update the tour_guides table
    const tourGuideUpdateData = {
      bio,
      specialties: specialties
        ? typeof specialties === "string"
          ? JSON.parse(specialties)
          : specialties
        : undefined,
      location,
      short_bio,
      experience: experience ? parseInt(experience, 10) : undefined,
      availability,
      updated_at: new Date().toISOString(),
    };

    const tourGuideUpdatePromise = supabase
      .from("tour_guides")
      .update(tourGuideUpdateData)
      .eq(id ? "id" : "user_id", id || user_id);

    // Execute both updates
    const [userResult, tourGuideResult] = await Promise.all([
      userUpdatePromise,
      tourGuideUpdatePromise,
    ]);

    // Check for errors
    if (userResult.error) {
      console.error("[EDIT TOURGUIDE] User update error:", userResult.error);
      return res.status(400).json({ error: userResult.error.message });
    }

    if (tourGuideResult.error) {
      console.error(
        "[EDIT TOURGUIDE] Tour guide update error:",
        tourGuideResult.error
      );
      return res.status(400).json({ error: tourGuideResult.error.message });
    }

    console.log("[EDIT TOURGUIDE] Update success:", {
      user: userResult.data,
      tourGuide: tourGuideResult.data,
    });

    res.json({
      success: true,
      data: {
        user: userResult.data,
        tourGuide: tourGuideResult.data,
      },
    });
  } catch (error) {
    console.error("[EDIT TOURGUIDE] Unexpected error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

module.exports = router;
