import { supabase } from "../src/config/supabaseClient.ts";

async function checkTriggerRating() {
  console.log("🔍 Checking trigger update_tour_guide_rating...\n");

  try {
    // Test 1: Check if trigger exists
    console.log("1️⃣ Testing trigger exists...");

    // Try to find trigger in database
    const { data: triggers, error: triggerError } = await supabase
      .from("information_schema.triggers")
      .select("trigger_name")
      .eq("trigger_name", "trigger_update_tour_guide_rating");

    if (triggerError) {
      console.log("❌ Cannot query triggers table");
    } else {
      console.log(`✅ Trigger query successful`);
    }

    // Test 2: Check if function exists
    console.log("\n2️⃣ Testing function exists...");

    const { data: functions, error: functionError } = await supabase.rpc(
      "update_tour_guide_rating"
    );

    if (functionError) {
      console.log(
        "❌ Function update_tour_guide_rating not found or not working"
      );
      console.log("Error:", functionError.message);
    } else {
      console.log("✅ Function update_tour_guide_rating exists");
    }

    // Test 3: Test manual rating calculation
    console.log("\n3️⃣ Testing manual rating calculation...");

    // Get a tour guide who has reviews
    const { data: tourGuides, error: guideError } = await supabase
      .from("tour_guides")
      .select("id, rating, review_count")
      .limit(5);

    if (guideError) {
      console.log("❌ Cannot query tour_guides table");
      return;
    }

    if (tourGuides.length === 0) {
      console.log("⚠️  No tour guides found");
      return;
    }

    for (const guide of tourGuides) {
      console.log(`\nTour Guide ID ${guide.id}:`);
      console.log(`Current rating: ${guide.rating || 0}`);
      console.log(`Current review count: ${guide.review_count || 0}`);

      // Get reviews for this guide
      const { data: reviews, error: reviewError } = await supabase
        .from("reviews")
        .select("rating")
        .eq("tour_guide_id", guide.id);

      if (!reviewError && reviews) {
        const actualReviewCount = reviews.length;
        const actualRating =
          actualReviewCount > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / actualReviewCount
            : 0;

        console.log(`Actual review count: ${actualReviewCount}`);
        console.log(`Actual average rating: ${actualRating.toFixed(2)}`);

        if (
          Math.abs(actualRating - (guide.rating || 0)) > 0.1 ||
          actualReviewCount !== (guide.review_count || 0)
        ) {
          console.log("❌ Rating mismatch! Trigger may not be working");
        } else {
          console.log("✅ Rating matches");
        }
      }
    }

    // Test 4: Test creating a review and see if rating updates
    console.log("\n4️⃣ Testing trigger with new review...");

    // Get a completed booking that hasn't been reviewed yet
    const { data: eligibleBookings, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        id, 
        user_id,
        tours (
          tour_guide_id
        )
      `
      )
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .limit(1);

    if (bookingError || !eligibleBookings || eligibleBookings.length === 0) {
      console.log("⚠️  No eligible bookings found for testing trigger");
      console.log("You can create a test review manually to test the trigger");
      return;
    }

    const testBooking = eligibleBookings[0];
    const tourGuideId = testBooking.tours?.tour_guide_id;

    if (!tourGuideId) {
      console.log("⚠️  Test booking has no tour guide");
      return;
    }

    // Check if this booking already has a review
    const { data: existingReview, error: existingError } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", testBooking.id)
      .eq("user_id", testBooking.user_id);

    if (existingError) {
      console.log("❌ Error checking existing reviews");
      return;
    }

    if (existingReview && existingReview.length > 0) {
      console.log("⚠️  Test booking already has a review");
      return;
    }

    // Get current rating before test
    const { data: guideBefore, error: guideBeforeError } = await supabase
      .from("tour_guides")
      .select("rating, review_count")
      .eq("id", tourGuideId)
      .single();

    if (guideBeforeError) {
      console.log("❌ Error getting tour guide before test");
      return;
    }

    console.log(`Tour guide ${tourGuideId} before test:`);
    console.log(`Rating: ${guideBefore.rating || 0}`);
    console.log(`Review count: ${guideBefore.review_count || 0}`);

    // Create test review
    const testReview = {
      user_id: testBooking.user_id,
      booking_id: testBooking.id,
      tour_guide_id: tourGuideId,
      rating: 5,
      title: "Test Review (Trigger Test)",
      content: "This is a test review to check if the trigger works",
      is_verified: true,
    };

    const { data: newReview, error: reviewInsertError } = await supabase
      .from("reviews")
      .insert(testReview)
      .select()
      .single();

    if (reviewInsertError) {
      console.log("❌ Error creating test review:", reviewInsertError.message);
      return;
    }

    console.log("✅ Test review created with ID:", newReview.id);

    // Wait a moment for trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get current rating after test
    const { data: guideAfter, error: guideAfterError } = await supabase
      .from("tour_guides")
      .select("rating, review_count")
      .eq("id", tourGuideId)
      .single();

    if (guideAfterError) {
      console.log("❌ Error getting tour guide after test");
      return;
    }

    console.log(`Tour guide ${tourGuideId} after test:`);
    console.log(`Rating: ${guideAfter.rating || 0}`);
    console.log(`Review count: ${guideAfter.review_count || 0}`);

    // Check if rating was updated
    const ratingChanged =
      Math.abs((guideAfter.rating || 0) - (guideBefore.rating || 0)) > 0.01;
    const countChanged =
      (guideAfter.review_count || 0) > (guideBefore.review_count || 0);

    if (ratingChanged || countChanged) {
      console.log("🎉 SUCCESS! Trigger is working - rating was updated");
    } else {
      console.log(
        "❌ FAILED! Rating was not updated - trigger may not be active"
      );
    }

    // Clean up test review
    console.log("\n🧹 Cleaning up test review...");
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", newReview.id);

    if (deleteError) {
      console.log("⚠️  Could not delete test review:", deleteError.message);
      console.log("Please delete it manually: review ID", newReview.id);
    } else {
      console.log("✅ Test review cleaned up");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
checkTriggerRating().catch(console.error);
