// debug-upcoming-tours.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gsmcojozukrzfkwtevkl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbWNvam96dWtyemZrd3RldmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAwNTgsImV4cCI6MjA2NTExNjA1OH0.yOb-a-QUeuPGD5jZqg4wc7cOkMlLaHFVQKzjYPokbOg";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUpcomingTours() {
  console.log("=== DEBUG UPCOMING TOURS ===");

  const testUserId = 20;
  const today = new Date().toISOString().split("T")[0];
  console.log("User ID:", testUserId);
  console.log("Today date:", today);

  try {
    // 1. Filter step by step
    console.log("\n1. All bookings for user...");
    const { data: step1, error: error1 } = await supabase
      .from("bookings")
      .select("id, status, payment_status, date, tour_id")
      .eq("user_id", testUserId);

    console.log("Step 1 - All bookings:", step1?.length);
    step1?.forEach((b) => {
      console.log(`- ${b.id}: ${b.date} | ${b.status} | ${b.payment_status}`);
    });

    console.log("\n2. Filter by status = confirmed...");
    const { data: step2, error: error2 } = await supabase
      .from("bookings")
      .select("id, status, payment_status, date, tour_id")
      .eq("user_id", testUserId)
      .eq("status", "confirmed");

    console.log("Step 2 - Confirmed only:", step2?.length);
    step2?.forEach((b) => {
      console.log(`- ${b.id}: ${b.date} | ${b.status} | ${b.payment_status}`);
    });

    console.log("\n3. Filter by payment_status = paid...");
    const { data: step3, error: error3 } = await supabase
      .from("bookings")
      .select("id, status, payment_status, date, tour_id")
      .eq("user_id", testUserId)
      .eq("status", "confirmed")
      .eq("payment_status", "paid");

    console.log("Step 3 - Confirmed + Paid:", step3?.length);
    step3?.forEach((b) => {
      console.log(`- ${b.id}: ${b.date} | ${b.status} | ${b.payment_status}`);
    });

    console.log("\n4. Filter by date >= today...");
    const { data: step4, error: error4 } = await supabase
      .from("bookings")
      .select("id, status, payment_status, date, tour_id")
      .eq("user_id", testUserId)
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .gte("date", today);

    console.log("Step 4 - Confirmed + Paid + Future:", step4?.length);
    step4?.forEach((b) => {
      console.log(
        `- ${b.id}: ${b.date} | ${b.status} | ${b.payment_status} | Future: ${
          b.date >= today
        }`
      );
    });

    // 5. Check date comparison manually
    console.log("\n5. Manual date comparison for confirmed+paid bookings...");
    step3?.forEach((b) => {
      const isToday = b.date === today;
      const isFuture = b.date > today;
      const isPast = b.date < today;
      console.log(
        `- ${b.id}: ${b.date} vs ${today} | Today: ${isToday} | Future: ${isFuture} | Past: ${isPast}`
      );
    });

    // 6. Test alternative query without date filter
    console.log("\n6. All confirmed+paid (without date filter)...");
    const { data: noDates, error: noDateError } = await supabase
      .from("bookings")
      .select(
        `
        id, status, payment_status, date,
        tours (
          id,
          title
        )
      `
      )
      .eq("user_id", testUserId)
      .eq("status", "confirmed")
      .eq("payment_status", "paid");

    if (noDateError) {
      console.error("Error:", noDateError);
    } else {
      console.log("All confirmed+paid bookings:", noDates?.length);
      noDates?.forEach((b) => {
        console.log(
          `- ${b.id}: ${b.date} | ${b.tours?.title} | ${b.status}/${b.payment_status}`
        );
      });
    }
  } catch (error) {
    console.error("Debug failed:", error);
  }
}

debugUpcomingTours();
