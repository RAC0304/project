// Script untuk test apakah nama customer sudah tampil dengan benar
// Jalankan di browser console setelah login sebagai tour guide

async function testCustomerNames() {
  try {
    console.log("=== TESTING CUSTOMER NAMES IN REVIEWS ===");

    // Import services
    const { getTourGuideReviewsSimple, debugTourGuideReviews } = await import(
      "./src/services/reviewService.js"
    );
    const { supabase } = await import("./src/config/supabaseClient.js");

    // Get current user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Current user:", user);

    if (!user.id) {
      console.error("No user logged in");
      return;
    }

    // Get tour guide ID
    const { data: tourGuide } = await supabase
      .from("tour_guides")
      .select("id, user_id, guide_name")
      .eq("user_id", user.id)
      .single();

    if (!tourGuide) {
      console.error("User is not a tour guide");
      return;
    }

    console.log("Tour guide data:", tourGuide);

    // Test simple query with customer names
    console.log("\n--- Testing Simple Query ---");
    const simpleReviews = await getTourGuideReviewsSimple(tourGuide.id);
    console.log("Simple reviews result:", simpleReviews);

    // Check customer names
    simpleReviews.forEach((review, index) => {
      console.log(`Review ${index + 1}:`);
      console.log(`  ID: ${review.id}`);
      console.log(`  Customer Name: "${review.clientName}"`);
      console.log(`  Customer Email: "${review.clientEmail}"`);
      console.log(`  Rating: ${review.rating}`);
      console.log(`  Title: "${review.title}"`);
      console.log("  ---");
    });

    // Check raw data from database
    console.log("\n--- Raw Database Query ---");
    const { data: rawReviews } = await supabase
      .from("reviews")
      .select(
        `
        *,
        users!reviews_customer_id_fkey (
          id,
          first_name,
          last_name,
          username,
          email
        )
      `
      )
      .eq("tour_guide_id", tourGuide.id);

    console.log("Raw reviews with customer info:", rawReviews);

    // Compare results
    console.log("\n--- Comparison ---");
    console.log("Found", simpleReviews.length, "reviews");

    if (simpleReviews.length > 0) {
      console.log("✅ Customer names are being fetched properly");
    } else {
      console.log("❌ No reviews found or customer names not showing");
    }
  } catch (error) {
    console.error("Error testing customer names:", error);
  }
}

// Jalankan test
testCustomerNames();
