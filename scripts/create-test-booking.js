// create-test-booking.js
// Script untuk membuat test booking data
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gsmcojozukrzfkwtevkl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbWNvam96dWtyemZrd3RldmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAwNTgsImV4cCI6MjA2NTExNjA1OH0.yOb-a-QUeuPGD5jZqg4wc7cOkMlLaHFVQKzjYPokbOg";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestBookings() {
  console.log("=== Creating Test Booking Data ===");

  const testUserId = 20;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const today = new Date().toISOString().split("T")[0];

  console.log("Today:", today);
  console.log("Tomorrow:", tomorrowStr);
  console.log("Next week:", nextWeekStr);

  try {
    // 1. Get available tour
    console.log("\n1. Getting available tours...");
    const { data: tours, error: tourError } = await supabase
      .from("tours")
      .select("id, title")
      .limit(1);

    if (tourError || !tours || tours.length === 0) {
      console.error("No tours available:", tourError);
      return;
    }

    const tourId = tours[0].id;
    console.log("Using tour:", tours[0].title, "(ID:", tourId, ")");

    // 2. Create upcoming booking (confirmed + paid + future)
    console.log("\n2. Creating upcoming booking...");
    const { data: upcomingBooking, error: upcomingError } = await supabase
      .from("bookings")
      .insert([
        {
          tour_id: tourId,
          user_id: testUserId,
          date: tomorrowStr,
          participants: 1,
          status: "confirmed",
          special_requests: "Test upcoming booking",
          total_amount: 50000,
          payment_status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (upcomingError) {
      console.error("Error creating upcoming booking:", upcomingError);
    } else {
      console.log("Created upcoming booking:", upcomingBooking.id);
    }

    // 3. Create today booking (confirmed + paid + today)
    console.log("\n3. Creating today booking...");
    const { data: todayBooking, error: todayError } = await supabase
      .from("bookings")
      .insert([
        {
          tour_id: tourId,
          user_id: testUserId,
          date: today,
          participants: 2,
          status: "confirmed",
          special_requests: "Test today booking",
          total_amount: 100000,
          payment_status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (todayError) {
      console.error("Error creating today booking:", todayError);
    } else {
      console.log("Created today booking:", todayBooking.id);
    }

    // 4. Create completed booking (completed + paid + past)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    console.log("\n4. Creating completed booking...");
    const { data: completedBooking, error: completedError } = await supabase
      .from("bookings")
      .insert([
        {
          tour_id: tourId,
          user_id: testUserId,
          date: yesterdayStr,
          participants: 1,
          status: "completed",
          special_requests: "Test completed booking",
          total_amount: 75000,
          payment_status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (completedError) {
      console.error("Error creating completed booking:", completedError);
    } else {
      console.log("Created completed booking:", completedBooking.id);
    }

    console.log("\n=== TEST DATA CREATED ===");
    console.log("Now test the UI to see if data appears correctly!");
  } catch (error) {
    console.error("Failed to create test data:", error);
  }
}

createTestBookings();
