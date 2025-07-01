// Test script for chat service functionality
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://ggbjmtjtqoesrqjotfqf.supabase.co";
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnYmptdGp0cW9lc3Jxam90ZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMzUzNDAsImV4cCI6MjA0OTkxMTM0MH0.wJzRCfW9fNyJ5hfAVONEOuKJiJhcFSbIJ3MvdF5D1Pg";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatService() {
  console.log("🧪 Testing Chat Service Functionality...\n");

  try {
    // Test 1: Check messages table structure
    console.log("1. Testing messages table structure...");
    const { data: tableData, error: tableError } = await supabase
      .from("messages")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Error accessing messages table:", tableError.message);
      return;
    }
    console.log("✅ Messages table accessible");

    // Test 2: Check if we can get users and tour guides for testing
    console.log("\n2. Getting test data...");

    // Get a sample user (customer)
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .limit(2);

    if (userError || !users || users.length < 2) {
      console.error(
        "❌ Need at least 2 users for testing:",
        userError?.message
      );
      return;
    }

    const customer = users[0];
    const tourGuideUser = users[1];
    console.log("✅ Test users found:", {
      customer: `${customer.first_name} ${customer.last_name}`,
      tourGuide: `${tourGuideUser.first_name} ${tourGuideUser.last_name}`,
    });

    // Test 3: Send a test message
    console.log("\n3. Testing message sending...");
    const testMessage = {
      sender_id: customer.id,
      receiver_id: tourGuideUser.id,
      content: "Test message from chat service test",
      is_read: false,
    };

    const { data: sentMessage, error: sendError } = await supabase
      .from("messages")
      .insert(testMessage)
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, email),
        receiver:users!messages_receiver_id_fkey(id, first_name, last_name, email)
      `
      )
      .single();

    if (sendError) {
      console.error("❌ Error sending message:", sendError.message);
      return;
    }
    console.log("✅ Message sent successfully:", sentMessage.id);

    // Test 4: Retrieve conversation
    console.log("\n4. Testing conversation retrieval...");
    const { data: conversation, error: convError } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, email),
        receiver:users!messages_receiver_id_fkey(id, first_name, last_name, email)
      `
      )
      .or(
        `and(sender_id.eq.${customer.id},receiver_id.eq.${tourGuideUser.id}),and(sender_id.eq.${tourGuideUser.id},receiver_id.eq.${customer.id})`
      )
      .order("sent_at", { ascending: true });

    if (convError) {
      console.error("❌ Error retrieving conversation:", convError.message);
      return;
    }
    console.log("✅ Conversation retrieved:", conversation.length, "messages");

    // Test 5: Test booking-tour-guide relationship
    console.log("\n5. Testing booking-tour-guide relationship...");

    // Get a sample booking
    const { data: bookings, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        tour_id,
        tours!inner(
          id,
          tour_guide_id,
          tour_guides!inner(
            id,
            user_id,
            users!inner(id, first_name, last_name)
          )
        )
      `
      )
      .limit(1);

    if (bookingError || !bookings || bookings.length === 0) {
      console.warn("⚠️ No bookings found for relationship test");
    } else {
      const booking = bookings[0];
      console.log("✅ Booking-tour-guide relationship verified:", {
        bookingId: booking.id,
        tourId: booking.tour_id,
        tourGuideId: booking.tours.tour_guide_id,
        tourGuideUserId: booking.tours.tour_guides.user_id,
        tourGuideName: `${booking.tours.tour_guides.users.first_name} ${booking.tours.tour_guides.users.last_name}`,
      });
    }

    // Cleanup: Delete test message
    console.log("\n6. Cleaning up test data...");
    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .eq("id", sentMessage.id);

    if (deleteError) {
      console.warn("⚠️ Could not delete test message:", deleteError.message);
    } else {
      console.log("✅ Test message cleaned up");
    }

    console.log("\n🎉 All chat service tests passed!");
  } catch (error) {
    console.error("❌ Unexpected error during testing:", error);
  }
}

// Run the test
testChatService().catch(console.error);
