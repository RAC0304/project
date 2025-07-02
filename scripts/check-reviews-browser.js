// Script untuk cek data reviews dan tour guides di database
// Jalankan script ini di browser console setelah login sebagai tour guide

console.log("=== CHECKING REVIEWS DATA ===");

// Function untuk cek data menggunakan API yang sudah ada
async function checkReviewsData() {
  try {
    // 1. Cek user yang sedang login
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Current user:", user);

    if (!user.id) {
      console.error("No user logged in");
      return;
    }

    // 2. Import services (copy paste services yang dibutuhkan)
    const { debugTourGuideReviews } = await import(
      "./src/services/reviewService"
    );
    const { getTourGuideIdByUserId } = await import(
      "./src/services/tourGuideService"
    );

    // 3. Get tour guide ID untuk user ini
    const tourGuideId = await getTourGuideIdByUserId(user.id);
    console.log("Tour Guide ID for user", user.id, ":", tourGuideId);

    if (!tourGuideId) {
      console.error("No tour guide record found for user ID:", user.id);
      return;
    }

    // 4. Debug reviews untuk tour guide ini
    const debugResult = await debugTourGuideReviews(tourGuideId);
    console.log("Debug reviews result:", debugResult);

    // 5. Cek apakah reviews data ada
    if (debugResult && debugResult.reviewsForTourGuide > 0) {
      console.log(
        "✅ Found",
        debugResult.reviewsForTourGuide,
        "reviews for tour guide ID",
        tourGuideId
      );
    } else {
      console.log("❌ No reviews found for tour guide ID", tourGuideId);
      console.log("Available reviews:", debugResult?.data);
    }
  } catch (error) {
    console.error("Error checking reviews data:", error);
  }
}

// Jalankan function
checkReviewsData();
