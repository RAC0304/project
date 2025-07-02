// Test trigger untuk update rating tour guide
import { createClient } from "@supabase/supabase-js";

// Setup Supabase client
const supabaseUrl = "https://jzegkzyhegbgexnfwjhw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZWdrenloZWdiZ2V4bmZ3amh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MTU5MzQsImV4cCI6MjA1MTI5MTkzNH0.z8s2M8tOpE-6wPpX1HKiLxLc0wqXI7vdNmLdWh4dLwQ";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTriggerRating() {
  console.log("🔍 Checking trigger update_tour_guide_rating...\n");

  try {
    // Test 1: Check if function exists by trying to call it
    console.log("1️⃣ Testing trigger function...");

    // Try to test the trigger function exists (it should fail because it's a trigger, not a callable function)
    const { data: functionTest, error: functionError } = await supabase.rpc(
      "test_booking_status_functions"
    );

    if (functionError) {
      console.log("⚠️  Test function not available");
    } else {
      console.log("✅ Test function working");
    }

    // Test 2: Check tour guides and their current ratings
    console.log("\n2️⃣ Checking current tour guide ratings...");

    const { data: tourGuides, error: guideError } = await supabase
      .from("tour_guides")
      .select("id, rating, review_count")
      .limit(5);

    if (guideError) {
      console.log("❌ Cannot query tour_guides table:", guideError.message);
      return;
    }

    if (tourGuides.length === 0) {
      console.log("⚠️  No tour guides found");
      return;
    }

    console.log("Tour guides found:", tourGuides.length);

    for (const guide of tourGuides) {
      console.log(`\nTour Guide ID ${guide.id}:`);
      console.log(`Current rating: ${guide.rating || 0}`);
      console.log(`Current review count: ${guide.review_count || 0}`);

      // Get actual reviews for this guide
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

        const ratingDiff = Math.abs(actualRating - (guide.rating || 0));
        const countDiff = Math.abs(
          actualReviewCount - (guide.review_count || 0)
        );

        if (ratingDiff > 0.1 || countDiff > 0) {
          console.log("❌ Rating mismatch detected!");
          console.log(`Rating difference: ${ratingDiff.toFixed(2)}`);
          console.log(`Count difference: ${countDiff}`);
          console.log("🔧 Need to check if trigger is working");
        } else {
          console.log("✅ Rating matches calculated value");
        }
      } else {
        console.log("⚠️  Could not get reviews for this guide");
      }
    }

    // Test 3: Test with a simple review creation and deletion
    console.log("\n3️⃣ Testing trigger with sample data...");

    // Get an eligible booking for testing
    const { data: testBookings, error: bookingError } = await supabase
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
      .limit(3);

    if (bookingError || !testBookings || testBookings.length === 0) {
      console.log("⚠️  No eligible bookings found for testing");
      console.log("Creating a basic test review instead...");

      // Create a simple test with first tour guide
      if (tourGuides.length > 0) {
        await testTriggerWithGuide(tourGuides[0].id);
      }
      return;
    }

    // Find a booking that hasn't been reviewed yet
    let testBooking = null;
    for (const booking of testBookings) {
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("booking_id", booking.id)
        .eq("user_id", booking.user_id);

      if (!existingReview || existingReview.length === 0) {
        testBooking = booking;
        break;
      }
    }

    if (!testBooking) {
      console.log("⚠️  All test bookings already have reviews");
      if (tourGuides.length > 0) {
        await testTriggerWithGuide(tourGuides[0].id);
      }
      return;
    }

    await testTriggerWithBooking(testBooking);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

async function testTriggerWithBooking(testBooking) {
  const tourGuideId = testBooking.tours?.tour_guide_id;

  if (!tourGuideId) {
    console.log("⚠️  Test booking has no tour guide");
    return;
  }

  console.log(
    `Testing with booking ID ${testBooking.id}, tour guide ${tourGuideId}`
  );

  // Get current rating before test
  const { data: guideBefore, error: guideBeforeError } = await supabase
    .from("tour_guides")
    .select("rating, review_count")
    .eq("id", tourGuideId)
    .single();

  if (guideBeforeError) {
    console.log(
      "❌ Error getting tour guide before test:",
      guideBeforeError.message
    );
    return;
  }

  console.log(
    `Before test - Rating: ${guideBefore.rating || 0}, Count: ${
      guideBefore.review_count || 0
    }`
  );

  // Create test review
  const testReview = {
    user_id: testBooking.user_id,
    booking_id: testBooking.id,
    tour_guide_id: tourGuideId,
    rating: 4,
    title: "Test Review (Trigger Test)",
    content:
      "This is a test review to check if the trigger works. Will be deleted automatically.",
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

  // Wait for trigger to execute
  console.log("⏳ Waiting for trigger to execute...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Get rating after test
  const { data: guideAfter, error: guideAfterError } = await supabase
    .from("tour_guides")
    .select("rating, review_count")
    .eq("id", tourGuideId)
    .single();

  if (guideAfterError) {
    console.log(
      "❌ Error getting tour guide after test:",
      guideAfterError.message
    );
  } else {
    console.log(
      `After test - Rating: ${guideAfter.rating || 0}, Count: ${
        guideAfter.review_count || 0
      }`
    );

    // Check if rating was updated
    const ratingChanged =
      Math.abs((guideAfter.rating || 0) - (guideBefore.rating || 0)) > 0.001;
    const countChanged =
      (guideAfter.review_count || 0) > (guideBefore.review_count || 0);

    if (ratingChanged || countChanged) {
      console.log(
        "🎉 SUCCESS! Trigger is working - rating was updated automatically"
      );
    } else {
      console.log(
        "❌ FAILED! Rating was not updated - trigger may not be active"
      );
      console.log(
        "📝 You may need to run the SQL script manually in Supabase SQL Editor:"
      );
      console.log("   database/booking_status_functions.sql");
    }
  }

  // Clean up test review
  console.log("🧹 Cleaning up test review...");
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
}

async function testTriggerWithGuide(tourGuideId) {
  console.log(
    `Testing trigger with tour guide ${tourGuideId} (simplified test)`
  );

  // Get current rating
  const { data: guideBefore } = await supabase
    .from("tour_guides")
    .select("rating, review_count")
    .eq("id", tourGuideId)
    .single();

  console.log(
    `Current rating: ${guideBefore?.rating || 0}, Count: ${
      guideBefore?.review_count || 0
    }`
  );

  // Create a simple review without booking
  const testReview = {
    tour_guide_id: tourGuideId,
    rating: 5,
    title: "Test Review",
    content: "Test review for trigger",
    is_verified: true,
  };

  const { data: newReview, error: reviewError } = await supabase
    .from("reviews")
    .insert(testReview)
    .select()
    .single();

  if (reviewError) {
    console.log("❌ Error creating test review:", reviewError.message);
    return;
  }

  console.log("✅ Test review created");

  // Wait and check
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { data: guideAfter } = await supabase
    .from("tour_guides")
    .select("rating, review_count")
    .eq("id", tourGuideId)
    .single();

  console.log(
    `After review - Rating: ${guideAfter?.rating || 0}, Count: ${
      guideAfter?.review_count || 0
    }`
  );

  const ratingChanged =
    Math.abs((guideAfter?.rating || 0) - (guideBefore?.rating || 0)) > 0.001;
  const countChanged =
    (guideAfter?.review_count || 0) > (guideBefore?.review_count || 0);

  if (ratingChanged || countChanged) {
    console.log("🎉 Trigger is working!");
  } else {
    console.log("❌ Trigger may not be working");
  }

  // Clean up
  await supabase.from("reviews").delete().eq("id", newReview.id);
  console.log("✅ Test cleaned up");
}

// Run the test
checkTriggerRating()
  .then(() => {
    console.log("\n✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
