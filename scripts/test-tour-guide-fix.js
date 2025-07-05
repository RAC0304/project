import { supabase } from "../src/utils/supabaseClient.js";
import { getTourGuideIdByUserId } from "../src/services/tourGuideService.js";

async function testTourGuideIdFetch() {
  console.log("🧪 Testing Tour Guide ID Fetch...");

  try {
    // Get all tour guide users
    const { data: users, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .eq("role", "tour_guide");

    if (error) {
      console.error("❌ Error fetching users:", error);
      return;
    }

    console.log(`📊 Found ${users.length} tour guide users`);

    // Test each user
    for (const user of users) {
      console.log(
        `\n🔍 Testing user ${user.id} (${user.first_name} ${user.last_name}):`
      );

      const tourGuideId = await getTourGuideIdByUserId(user.id);

      if (tourGuideId) {
        console.log(`✅ Successfully got tour guide ID: ${tourGuideId}`);
      } else {
        console.log(`❌ Failed to get tour guide ID`);
      }
    }

    console.log("\n🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testTourGuideIdFetch().then(() => {
  console.log("Script completed.");
  process.exit(0);
});
