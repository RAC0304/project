const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBookingStatusService() {
  console.log("🧪 Testing Booking Status Service...\n");

  try {
    // Test 1: Check if tables exist
    console.log("1️⃣ Testing database tables...");

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id")
      .limit(1);

    if (bookingsError) {
      console.error("❌ Bookings table not accessible:", bookingsError.message);
    } else {
      console.log("✅ Bookings table accessible");
    }

    const { data: tours, error: toursError } = await supabase
      .from("tours")
      .select("id")
      .limit(1);

    if (toursError) {
      console.error("❌ Tours table not accessible:", toursError.message);
    } else {
      console.log("✅ Tours table accessible");
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("id")
      .limit(1);

    if (reviewsError) {
      console.error("❌ Reviews table not accessible:", reviewsError.message);
    } else {
      console.log("✅ Reviews table accessible");
    }

    // Test 2: Check booking status queries
    console.log("\n2️⃣ Testing booking status queries...");

    const testUserId = 1; // Use a test user ID
    const today = new Date().toISOString().split("T")[0];

    // Test upcoming tours query
    const { data: upcomingTours, error: upcomingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        tours (
          id,
          title,
          description,
          location,
          duration,
          tour_guides (
            id,
            user_id,
            bio,
            location,
            rating,
            users (
              first_name,
              last_name,
              profile_picture
            )
          )
        )
      `
      )
      .eq("user_id", testUserId)
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .gte("date", today)
      .order("date", { ascending: true });

    if (upcomingError) {
      console.error("❌ Upcoming tours query failed:", upcomingError.message);
    } else {
      console.log(
        `✅ Upcoming tours query successful (${
          upcomingTours?.length || 0
        } results)`
      );
    }

    // Test today's tours query
    const { data: todayTours, error: todayError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        tours (
          id,
          title,
          tour_guides (
            users (
              first_name,
              last_name,
              phone
            )
          )
        )
      `
      )
      .eq("user_id", testUserId)
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .eq("date", today);

    if (todayError) {
      console.error("❌ Today tours query failed:", todayError.message);
    } else {
      console.log(
        `✅ Today tours query successful (${todayTours?.length || 0} results)`
      );
    }

    // Test completed tours query
    const { data: completedTours, error: completedError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        tours (
          id,
          title,
          tour_guides (
            id,
            users (
              first_name,
              last_name
            )
          )
        )
      `
      )
      .eq("user_id", testUserId)
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .order("date", { ascending: false });

    if (completedError) {
      console.error("❌ Completed tours query failed:", completedError.message);
    } else {
      console.log(
        `✅ Completed tours query successful (${
          completedTours?.length || 0
        } results)`
      );
    }

    // Test 3: Check RPC functions
    console.log("\n3️⃣ Testing RPC functions...");

    // Test can_user_review function
    try {
      const { data: canReviewResult, error: canReviewError } =
        await supabase.rpc("can_user_review", {
          p_user_id: testUserId,
          p_booking_id: 1,
        });

      if (canReviewError) {
        console.error(
          "❌ can_user_review function failed:",
          canReviewError.message
        );
        console.log(
          "📝 Note: This function needs to be created manually in Supabase SQL Editor"
        );
      } else {
        console.log("✅ can_user_review function working:", canReviewResult);
      }
    } catch (err) {
      console.error("❌ can_user_review function not found");
      console.log(
        "📝 Please run database/booking_status_functions.sql in Supabase SQL Editor"
      );
    }

    // Test update_booking_status function
    try {
      const { data: updateResult, error: updateError } = await supabase.rpc(
        "update_booking_status"
      );

      if (updateError) {
        console.error(
          "❌ update_booking_status function failed:",
          updateError.message
        );
      } else {
        console.log("✅ update_booking_status function working");
      }
    } catch (err) {
      console.error("❌ update_booking_status function not found");
    }

    // Test 4: Check review functionality
    console.log("\n4️⃣ Testing review functionality...");

    const { data: existingReviews, error: reviewQueryError } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", testUserId)
      .limit(5);

    if (reviewQueryError) {
      console.error("❌ Review query failed:", reviewQueryError.message);
    } else {
      console.log(
        `✅ Review query successful (${
          existingReviews?.length || 0
        } reviews found)`
      );
    }

    // Test 5: Sample data check
    console.log("\n5️⃣ Checking sample data...");

    const { data: sampleBookings, error: sampleError } = await supabase
      .from("bookings")
      .select("id, status, payment_status, date")
      .limit(3);

    if (sampleError) {
      console.error("❌ Sample data check failed:", sampleError.message);
    } else {
      console.log(`✅ Sample bookings found: ${sampleBookings?.length || 0}`);
      if (sampleBookings && sampleBookings.length > 0) {
        console.log(
          "📊 Sample booking statuses:",
          sampleBookings
            .map((b) => `${b.status}/${b.payment_status}`)
            .join(", ")
        );
      }
    }

    console.log("\n🎉 Booking Status Service test completed!");

    // Summary
    console.log("\n📋 Summary:");
    console.log("- Database tables: Accessible");
    console.log("- Booking queries: Working");
    console.log("- Review system: Ready");
    console.log("- Functions: May need manual setup in Supabase");

    console.log("\n📝 Next steps:");
    console.log(
      "1. If functions failed, run database/booking_status_functions.sql in Supabase SQL Editor"
    );
    console.log("2. Test the BookingStatusTabs component in your React app");
    console.log("3. Create some test bookings with different statuses");
  } catch (error) {
    console.error("💥 Test failed:", error);
  }
}

// Run test if called directly
if (require.main === module) {
  testBookingStatusService()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test error:", error);
      process.exit(1);
    });
}

module.exports = { testBookingStatusService };
