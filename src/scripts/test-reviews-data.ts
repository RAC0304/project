// Script untuk test data reviews
import { supabase } from "../config/supabaseClient";

export const testReviewsData = async () => {
  console.log("=== Testing Reviews Data ===");

  try {
    // 1. Check if there are any reviews in the database
    const { data: allReviews, error: allError } = await supabase
      .from("reviews")
      .select("*")
      .limit(5);

    console.log("All reviews in database:", allReviews);
    console.log("Total reviews found:", allReviews?.length || 0);

    if (allError) {
      console.error("Error fetching all reviews:", allError);
      return;
    }

    // 2. Check tour_guide_id values
    const { data: tourGuideIds, error: idsError } = await supabase
      .from("reviews")
      .select("tour_guide_id")
      .not("tour_guide_id", "is", null);

    console.log("Tour guide IDs in reviews:", [
      ...new Set(tourGuideIds?.map((r) => r.tour_guide_id)),
    ]);

    // 3. Check for specific tour guide ID (19 from the error)
    const { data: specificReviews, error: specificError } = await supabase
      .from("reviews")
      .select("*")
      .eq("tour_guide_id", 19);

    console.log("Reviews for tour guide ID 19:", specificReviews);

    if (specificError) {
      console.error("Error fetching specific reviews:", specificError);
    }

    // 4. If no data, create test data
    if (!allReviews || allReviews.length === 0) {
      console.log("No reviews found, creating test data...");
      await createTestReviews();
    }
  } catch (error) {
    console.error("Error in testReviewsData:", error);
  }
};

export const createTestReviews = async () => {
  try {
    console.log("Creating test reviews...");

    // Check if there are users and tour guides first
    const { data: users } = await supabase.from("users").select("id").limit(5);
    const { data: tourGuides } = await supabase
      .from("tour_guides")
      .select("id, user_id")
      .limit(5);

    console.log("Available users:", users);
    console.log("Available tour guides:", tourGuides);

    if (!users || users.length === 0) {
      console.log("No users found, cannot create test reviews");
      return;
    }

    if (!tourGuides || tourGuides.length === 0) {
      console.log("No tour guides found, cannot create test reviews");
      return;
    }

    // Create test reviews
    const testReviews = [
      {
        user_id: users[0].id,
        tour_guide_id: tourGuides[0].id,
        rating: 5,
        title: "Amazing tour experience!",
        content:
          "The tour guide was very knowledgeable and friendly. Had a great time exploring the destination.",
        is_verified: true,
        helpful_count: 3,
      },
      {
        user_id: users[1]?.id || users[0].id,
        tour_guide_id: tourGuides[0].id,
        rating: 4,
        title: "Great local insights",
        content:
          "Really enjoyed the local insights and recommendations. Would definitely book again.",
        is_verified: true,
        helpful_count: 1,
      },
      {
        user_id: users[2]?.id || users[0].id,
        tour_guide_id: tourGuides[1]?.id || tourGuides[0].id,
        rating: 5,
        title: "Excellent service",
        content:
          "Professional service and very accommodating to our needs. Highly recommended!",
        is_verified: true,
        helpful_count: 2,
      },
    ];

    const { data: insertedReviews, error: insertError } = await supabase
      .from("reviews")
      .insert(testReviews)
      .select();

    if (insertError) {
      console.error("Error creating test reviews:", insertError);
    } else {
      console.log("Test reviews created successfully:", insertedReviews);
    }
  } catch (error) {
    console.error("Error in createTestReviews:", error);
  }
};

// Export for use in browser console
if (typeof window !== "undefined") {
  (window as any).testReviewsData = testReviewsData;
  (window as any).createTestReviews = createTestReviews;
}
