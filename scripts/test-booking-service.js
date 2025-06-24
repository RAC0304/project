const {
  createBooking,
  getBookingsByUserId,
  getCurrentUser,
} = require("../src/services/bookingService");

async function testBookingService() {
  console.log("🧪 Testing Booking Service...");

  try {
    // Test 1: Get current user
    console.log("\n1️⃣ Testing getCurrentUser...");
    const user = await getCurrentUser();
    console.log(
      "Current user:",
      user ? `${user.first_name} ${user.last_name}` : "Not logged in"
    );

    if (!user) {
      console.log(
        "❌ User not logged in. Please login first to test booking functionality."
      );
      return;
    }

    // Test 2: Create a test booking
    console.log("\n2️⃣ Testing createBooking...");
    const testBookingData = {
      tourId: 1, // Assuming tour ID 1 exists
      date: "2025-07-01",
      participants: 2,
      specialRequests: "Test booking from automated test",
      totalAmount: 150.0,
      customerName: "Test User",
      customerEmail: "test@example.com",
      customerPhone: "+1234567890",
    };

    try {
      const booking = await createBooking(testBookingData);
      console.log("✅ Booking created successfully:", booking.id);
    } catch (error) {
      console.log("❌ Booking creation failed:", error.message);

      if (error.message.includes("tour_id")) {
        console.log(
          "💡 This might be because tour ID 1 doesn't exist. Check your tours table."
        );
      }
    }

    // Test 3: Get user bookings
    console.log("\n3️⃣ Testing getBookingsByUserId...");
    try {
      const bookings = await getBookingsByUserId(user.id);
      console.log(`✅ Found ${bookings.length} bookings for user`);

      if (bookings.length > 0) {
        console.log("Recent booking:", {
          id: bookings[0].id,
          date: bookings[0].date,
          participants: bookings[0].participants,
          status: bookings[0].status,
        });
      }
    } catch (error) {
      console.log("❌ Get bookings failed:", error.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

async function testDatabaseSchema() {
  console.log("\n🔍 Testing Database Schema...");

  try {
    const { createClient } = require("@supabase/supabase-js");
    require("dotenv").config();

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("❌ Missing Supabase environment variables");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test bookings table structure
    console.log("📋 Checking bookings table...");
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .limit(1);

    if (error) {
      console.log("❌ Bookings table error:", error.message);

      if (error.message.includes('relation "bookings" does not exist')) {
        console.log(
          "💡 Bookings table doesn't exist. Run the migration first."
        );
      }
    } else {
      console.log("✅ Bookings table accessible");
    }

    // Test tours table structure
    console.log("📋 Checking tours table...");
    const { data: toursData, error: toursError } = await supabase
      .from("tours")
      .select("id, title, tour_guide_id")
      .limit(5);

    if (toursError) {
      console.log("❌ Tours table error:", toursError.message);
    } else {
      console.log(
        `✅ Tours table accessible with ${toursData.length} tours found`
      );
      if (toursData.length > 0) {
        console.log(
          "Available tours:",
          toursData.map((t) => ({ id: t.id, title: t.title }))
        );
      }
    }

    // Test tour_guides table
    console.log("📋 Checking tour_guides table...");
    const { data: guidesData, error: guidesError } = await supabase
      .from("tour_guides")
      .select("id, user_id, location")
      .limit(5);

    if (guidesError) {
      console.log("❌ Tour guides table error:", guidesError.message);
    } else {
      console.log(
        `✅ Tour guides table accessible with ${guidesData.length} guides found`
      );
    }
  } catch (error) {
    console.error("❌ Schema test failed:", error.message);
  }
}

// Run tests
if (require.main === module) {
  console.log("🚀 Starting Booking Service Tests...");

  testDatabaseSchema()
    .then(() => testBookingService())
    .then(() => {
      console.log("\n✅ All tests completed!");
      console.log("\n📝 Next steps:");
      console.log(
        "1. Run the booking migration if needed: node scripts/setup-booking-migration.js"
      );
      console.log("2. Make sure you have sample tour data");
      console.log("3. Test the BookingModal in the UI");
    })
    .catch((error) => {
      console.error("❌ Test suite failed:", error.message);
    });
}

module.exports = { testBookingService, testDatabaseSchema };
