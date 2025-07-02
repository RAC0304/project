// test-booking-data.js
// Script untuk testing data booking di Supabase

import { createClient } from "@supabase/supabase-js";

// Supabase config menggunakan env variables yang sama dengan aplikasi
const supabaseUrl = "https://gsmcojozukrzfkwtevkl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbWNvam96dWtyemZrd3RldmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAwNTgsImV4cCI6MjA2NTExNjA1OH0.yOb-a-QUeuPGD5jZqg4wc7cOkMlLaHFVQKzjYPokbOg";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBookingData() {
  console.log("=== Testing Booking Data ===");

  try {
    // 1. Test basic booking query
    console.log("\n1. Testing basic bookings query...");
    const { data: allBookings, error: allBookingsError } = await supabase
      .from("bookings")
      .select("*")
      .limit(5);

    if (allBookingsError) {
      console.error("Error fetching all bookings:", allBookingsError);
    } else {
      console.log("All bookings:", allBookings);
      console.log("Total bookings found:", allBookings?.length || 0);
    }

    // 2. Test users table to get valid user_id
    console.log("\n2. Testing users table...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, first_name, last_name, username")
      .limit(5);

    if (usersError) {
      console.error("Error fetching users:", usersError);
    } else {
      console.log("Users:", users);
    }

    if (!users || users.length === 0) {
      console.log("No users found! Stopping test.");
      return;
    }

    const testUserId = users[0].id;
    console.log(
      `Using test user ID: ${testUserId} (${users[0].first_name} ${users[0].last_name})`
    );

    // 3. Test booking with specific user_id
    console.log(`\n3. Testing bookings for user ${testUserId}...`);
    const { data: userBookings, error: userBookingsError } = await supabase
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

    if (userBookingsError) {
      console.error("Error fetching user bookings:", userBookingsError);
    } else {
      console.log("User bookings:", userBookings);
      console.log("User bookings count:", userBookings?.length || 0);
    }

    // 4. Test upcoming tours query
    console.log(`\n4. Testing upcoming tours for user ${testUserId}...`);
    const today = new Date().toISOString().split("T")[0];
    console.log("Today date:", today);

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
      console.error("Error fetching upcoming tours:", upcomingError);
    } else {
      console.log("Upcoming tours:", upcomingTours);
      console.log("Upcoming tours count:", upcomingTours?.length || 0);
    }

    // 5. Test today's tours
    console.log(`\n5. Testing today's tours for user ${testUserId}...`);
    const { data: todayTours, error: todayError } = await supabase
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
            users (
              first_name,
              last_name,
              phone,
              profile_picture
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
      console.error("Error fetching today tours:", todayError);
    } else {
      console.log("Today tours:", todayTours);
      console.log("Today tours count:", todayTours?.length || 0);
    }

    // 6. Test completed tours
    console.log(`\n6. Testing completed tours for user ${testUserId}...`);
    const { data: completedTours, error: completedError } = await supabase
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
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .order("date", { ascending: false });

    if (completedError) {
      console.error("Error fetching completed tours:", completedError);
    } else {
      console.log("Completed tours:", completedTours);
      console.log("Completed tours count:", completedTours?.length || 0);
    }

    // 7. Check table schemas
    console.log("\n7. Checking table schemas...");

    console.log("\nBookings table structure:");
    const { data: bookingsSchema, error: bookingsSchemaError } = await supabase
      .from("bookings")
      .select("*")
      .limit(1);

    if (bookingsSchema && bookingsSchema.length > 0) {
      console.log("Bookings columns:", Object.keys(bookingsSchema[0]));
    }

    console.log("\nTours table structure:");
    const { data: toursSchema, error: toursSchemaError } = await supabase
      .from("tours")
      .select("*")
      .limit(1);

    if (toursSchema && toursSchema.length > 0) {
      console.log("Tours columns:", Object.keys(toursSchema[0]));
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Jalankan test
testBookingData();
