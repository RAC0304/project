// Script untuk menambahkan data test reviews
// Jalankan di browser console setelah login sebagai tour guide

async function addTestReviews() {
  try {
    console.log("=== ADDING TEST REVIEWS DATA ===");

    // Import supabase client
    const { supabase } = await import("./src/config/supabaseClient");

    // 1. Ambil user yang sedang login
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Current user:", user);

    if (!user.id) {
      console.error("No user logged in");
      return;
    }

    // 2. Cek apakah user ini adalah tour guide
    const { data: tourGuide } = await supabase
      .from("tour_guides")
      .select("id, user_id, guide_name")
      .eq("user_id", user.id)
      .single();

    console.log("Tour guide data:", tourGuide);

    if (!tourGuide) {
      console.error("User is not a tour guide");
      return;
    }

    // 3. Cek apakah sudah ada reviews
    const { data: existingReviews } = await supabase
      .from("reviews")
      .select("id")
      .eq("tour_guide_id", tourGuide.id);

    console.log("Existing reviews count:", existingReviews?.length || 0);

    if (existingReviews && existingReviews.length > 0) {
      console.log("Reviews already exist, skipping...");
      return;
    }

    // 4. Ambil customer dan booking untuk test data
    const { data: customers } = await supabase
      .from("users")
      .select("id, first_name, last_name")
      .eq("role", "customer")
      .limit(3);

    console.log("Available customers:", customers);

    // 5. Ambil tours dari tour guide ini
    const { data: tours } = await supabase
      .from("tours")
      .select("id, title")
      .eq("tour_guide_id", tourGuide.id)
      .limit(2);

    console.log("Available tours:", tours);

    if (!customers || customers.length === 0) {
      console.error("No customers found");
      return;
    }

    if (!tours || tours.length === 0) {
      console.error("No tours found for this tour guide");
      return;
    }

    // 6. Buat test reviews
    const testReviews = [
      {
        user_id: customers[0].id,
        tour_guide_id: tourGuide.id,
        booking_id: null, // Bisa null untuk test
        destination_id: null, // Bisa null untuk test
        rating: 5,
        title: "Amazing Experience!",
        content:
          "Had a wonderful time with this tour guide. Very knowledgeable and friendly.",
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: customers[1] ? customers[1].id : customers[0].id,
        tour_guide_id: tourGuide.id,
        booking_id: null,
        destination_id: null,
        rating: 4,
        title: "Great Tour!",
        content:
          "Really enjoyed the tour. Would definitely recommend to others.",
        is_verified: true,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        user_id: customers[2] ? customers[2].id : customers[0].id,
        tour_guide_id: tourGuide.id,
        booking_id: null,
        destination_id: null,
        rating: 5,
        title: "Excellent Guide!",
        content:
          "Very professional and made the tour very interesting. Highly recommended!",
        is_verified: true,
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    // 7. Insert test reviews
    const { data: insertedReviews, error } = await supabase
      .from("reviews")
      .insert(testReviews)
      .select();

    if (error) {
      console.error("Error inserting test reviews:", error);
      return;
    }

    console.log("✅ Successfully added test reviews:", insertedReviews);
    console.log("Reviews count:", insertedReviews?.length);

    // 8. Verify the data
    const { data: verifyReviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("tour_guide_id", tourGuide.id);

    console.log(
      "Verification - total reviews for tour guide:",
      verifyReviews?.length
    );
    console.log("Reviews data:", verifyReviews);

    alert("Test reviews added successfully! Refresh the page to see them.");
  } catch (error) {
    console.error("Error adding test reviews:", error);
  }
}

// Jalankan function
addTestReviews();
