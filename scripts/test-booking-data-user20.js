// test-booking-data-user20.js
// Script untuk testing data booking user_id 20

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gsmcojozukrzfkwtevkl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbWNvam96dWtyemZrd3RldmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAwNTgsImV4cCI6MjA2NTExNjA1OH0.yOb-a-QUeuPGD5jZqg4wc7cOkMlLaHFVQKzjYPokbOg";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUser20Bookings() {
  console.log("=== Testing User 20 Booking Data ===");

  const testUserId = 20;
  const today = new Date().toISOString().split("T")[0];
  console.log("Testing user ID:", testUserId);
  console.log("Today date:", today);

  try {
    // 1. All bookings for user 20
    console.log("\n1. All bookings for user 20...");
    const { data: allBookings, error: allError } = await supabase
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
      .eq("user_id", testUserId);

    if (allError) {
      console.error("Error:", allError);
    } else {
      console.log("All bookings count:", allBookings?.length);
      allBookings?.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`, {
          id: booking.id,
          status: booking.status,
          payment_status: booking.payment_status,
          date: booking.date,
          tour_title: booking.tours?.title,
        });
      });
    }

    // 2. Test upcoming tours (confirmed + paid + future date)
    console.log("\n2. Upcoming tours (confirmed + paid + future)...");
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
      .gte("date", today);

    if (upcomingError) {
      console.error("Error:", upcomingError);
    } else {
      console.log("Upcoming tours count:", upcoming?.length);
      upcoming?.forEach((booking) => {
        console.log("- Upcoming:", {
          id: booking.id,
          date: booking.date,
          title: booking.tours?.title,
          status: booking.status,
          payment: booking.payment_status,
        });
      });
    }

    // 3. Test completed tours (completed + paid)
    console.log("\n3. Completed tours (completed + paid)...");
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
      .eq("payment_status", "paid");

    if (completedError) {
      console.error("Error:", completedError);
    } else {
      console.log("Completed tours (paid) count:", completed?.length);
    }

    // 4. Test completed tours (completed - ANY payment status)
    console.log("\n4. Completed tours (any payment status)...");
    const { data: completedAny, error: completedAnyError } = await supabase
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
      .eq("status", "completed");

    if (completedAnyError) {
      console.error("Error:", completedAnyError);
    } else {
      console.log(
        "Completed tours (any payment) count:",
        completedAnyError?.length
      );
      completedAny?.forEach((booking) => {
        console.log("- Completed:", {
          id: booking.id,
          date: booking.date,
          title: booking.tours?.title,
          status: booking.status,
          payment: booking.payment_status,
        });
      });
    }

    // 5. Test "today" tours
    console.log("\n5. Today tours...");
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
        console.log("- Today:", {
          id: booking.id,
          date: booking.date,
          title: booking.tours?.title,
        });
      });
    }

    // 6. Summary
    console.log("\n=== SUMMARY ===");
    console.log("Total bookings for user 20:", allBookings?.length || 0);
    console.log(
      "- Upcoming tours (confirmed + paid + future):",
      upcoming?.length || 0
    );
    console.log(
      "- Today tours (confirmed + paid + today):",
      todayTours?.length || 0
    );
    console.log(
      "- Completed tours (completed + paid):",
      completed?.length || 0
    );
    console.log(
      "- Completed tours (completed + any payment):",
      completedAny?.length || 0
    );
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testUser20Bookings();
