// test-query-fix.js
// Test query setelah diperbaiki
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gsmcojozukrzfkwtevkl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbWNvam96dWtyemZrd3RldmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAwNTgsImV4cCI6MjA2NTExNjA1OH0.yOb-a-QUeuPGD5jZqg4wc7cOkMlLaHFVQKzjYPokbOg";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixedQueries() {
  console.log("=== Testing Fixed Queries ===");

  const testUserId = 20;
  const today = new Date().toISOString().split("T")[0];
  console.log("User ID:", testUserId);
  console.log("Today date:", today);

  try {
    // 1. Test UPCOMING tours (gt = greater than today, not >=)
    console.log("\n1. UPCOMING tours (date > today)...");
    const { data: upcoming, error: upcomingError } = await supabase
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
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .gt("date", today); // Changed from gte to gt

    if (upcomingError) {
      console.error("Error:", upcomingError);
    } else {
      console.log("Upcoming tours count:", upcoming?.length);
      upcoming?.forEach((booking) => {
        console.log(
          `- ID ${booking.id}: ${booking.date} | ${booking.tours?.title}`
        );
      });
    }

    // 2. Test TODAY tours (eq = equal to today)
    console.log("\n2. TODAY tours (date = today)...");
    const { data: todayTours, error: todayError } = await supabase
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
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .eq("date", today);

    if (todayError) {
      console.error("Error:", todayError);
    } else {
      console.log("Today tours count:", todayTours?.length);
      todayTours?.forEach((booking) => {
        console.log(
          `- ID ${booking.id}: ${booking.date} | ${booking.tours?.title}`
        );
      });
    }

    // 3. Test COMPLETED tours
    console.log("\n3. COMPLETED tours...");
    const { data: completed, error: completedError } = await supabase
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
      console.error("Error:", completedError);
    } else {
      console.log("Completed tours count:", completed?.length);
      completed?.forEach((booking) => {
        console.log(
          `- ID ${booking.id}: ${booking.date} | ${booking.tours?.title}`
        );
      });
    }

    console.log("\n=== SUMMARY ===");
    console.log(`UPCOMING: ${upcoming?.length || 0} tours`);
    console.log(`TODAY: ${todayTours?.length || 0} tours`);
    console.log(`COMPLETED: ${completed?.length || 0} tours`);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testFixedQueries();
