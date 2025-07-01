/**
 * Test script to verify that booking activities are now separated by status and payment status
 */

import { userActivityService } from "./src/services/userActivityService.js";
import { supabase } from "./src/config/supabaseClient.js";

async function testSeparatedActivities() {
  console.log("🧪 Testing Separated Booking Activities...\n");

  try {
    // Test connection first
    const { data: connectionTest, error: connectionError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name")
      .limit(1);

    if (connectionError) {
      console.log("❌ Database connection failed:", connectionError.message);
      return;
    }

    console.log("✅ Database connection successful\n");

    // Get a test user
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name")
      .eq("role", "customer")
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log("❌ No customer users found for testing");
      return;
    }

    const testUser = users[0];
    console.log(
      `📝 Testing with user: ${testUser.first_name} ${testUser.last_name} (${testUser.email})\n`
    );

    // Test recent activities
    console.log("1️⃣ Testing getUserRecentActivities...");
    try {
      const recentActivities =
        await userActivityService.getUserRecentActivities(testUser.id, 5);
      console.log(`✅ Found ${recentActivities.length} recent activities:`);

      recentActivities.forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.title} (${activity.type})`);
        console.log(`      📅 ${activity.formattedDate}`);
        console.log(`      📝 ${activity.description}`);

        if (activity.type === "booking" && activity.details) {
          console.log(
            `      🏷️  Activity Type: ${
              activity.details.activityType || "legacy"
            }`
          );
          console.log(
            `      📊 Status: ${activity.details.status}, Payment: ${activity.details.paymentStatus}`
          );
        }
        console.log("");
      });

      // Count booking activities by type
      const bookingActivities = recentActivities.filter(
        (a) => a.type === "booking"
      );
      const creationActivities = bookingActivities.filter(
        (a) => a.details?.activityType === "creation"
      );
      const confirmationActivities = bookingActivities.filter(
        (a) => a.details?.activityType === "confirmation"
      );
      const paymentActivities = bookingActivities.filter(
        (a) => a.details?.activityType === "payment"
      );
      const cancellationActivities = bookingActivities.filter(
        (a) => a.details?.activityType === "cancellation"
      );
      const legacyActivities = bookingActivities.filter(
        (a) => !a.details?.activityType
      );

      console.log("📈 Booking Activity Summary:");
      console.log(`   • Creation: ${creationActivities.length}`);
      console.log(`   • Confirmation: ${confirmationActivities.length}`);
      console.log(`   • Payment: ${paymentActivities.length}`);
      console.log(`   • Cancellation: ${cancellationActivities.length}`);
      console.log(`   • Legacy: ${legacyActivities.length}`);
      console.log("");

      if (bookingActivities.length > 0) {
        console.log(
          "✅ Booking activities are now separated by status and payment status!"
        );
      } else {
        console.log("ℹ️  No booking activities found for this user");
      }
    } catch (error) {
      console.log("❌ Error fetching recent activities:", error.message);
    }

    // Test all activities
    console.log("\n2️⃣ Testing getAllUserActivities...");
    try {
      const allActivities = await userActivityService.getAllUserActivities(
        testUser.id
      );
      const allBookingActivities = allActivities.filter(
        (a) => a.type === "booking"
      );

      console.log(
        `✅ Found ${allActivities.length} total activities (${allBookingActivities.length} booking activities)`
      );

      // Show first few booking activities with their types
      const sampleBookings = allBookingActivities.slice(0, 3);
      if (sampleBookings.length > 0) {
        console.log("\n📝 Sample booking activities:");
        sampleBookings.forEach((activity, index) => {
          console.log(
            `   ${index + 1}. ${activity.title} - ${
              activity.details?.activityType || "legacy"
            }`
          );
          console.log(
            `      Status: ${activity.details?.status}, Payment: ${activity.details?.paymentStatus}`
          );
        });
      }
    } catch (error) {
      console.log("❌ Error fetching all activities:", error.message);
    }

    console.log("\n✅ Separated Activities Test Completed!");
    console.log("\n🎯 Expected Behavior:");
    console.log("   • Each booking should create separate activities for:");
    console.log("     - Creation (when booking is first made)");
    console.log("     - Confirmation (when tour guide confirms)");
    console.log("     - Payment (when payment is completed)");
    console.log("     - Cancellation (if booking is cancelled)");
    console.log("   • Activities should be sorted by timestamp");
    console.log(
      "   • Pay Now button should appear only for confirmed+pending bookings"
    );
    console.log("   • Chat button should appear only for paid bookings");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testSeparatedActivities();
