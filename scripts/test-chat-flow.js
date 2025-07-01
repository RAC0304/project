// Simple test for chat functionality
import { chatService } from "../src/services/chatService.js";

async function testChatFlow() {
  console.log("🧪 Testing Chat Flow...\n");

  // Test data - you'll need to replace these with actual IDs from your database
  const testCustomerId = 1; // Replace with actual customer user ID
  const testTourGuideUserId = 2; // Replace with actual tour guide user ID
  const testTourGuideId = 1; // Replace with actual tour guide ID from tour_guides table
  const testBookingId = 1; // Replace with actual booking ID

  try {
    console.log("1. Testing message sending...");
    const sendResult = await chatService.sendMessage({
      senderId: testCustomerId,
      receiverId: testTourGuideUserId,
      tourGuideId: testTourGuideId,
      bookingId: testBookingId,
      content: "Test message from chat service",
    });

    if (sendResult.success) {
      console.log("✅ Message sent successfully:", sendResult.message?.id);
    } else {
      console.error("❌ Failed to send message:", sendResult.error);
      return;
    }

    console.log("\n2. Testing message retrieval...");
    const messages = await chatService.getMessages({
      userId: testCustomerId,
      tourGuideId: testTourGuideUserId,
      bookingId: testBookingId,
    });

    console.log("✅ Messages retrieved:", messages.length, "messages");
    messages.forEach((msg, index) => {
      console.log(`   ${index + 1}. ${msg.sender_name}: ${msg.content}`);
    });

    console.log("\n🎉 Chat flow test completed successfully!");
  } catch (error) {
    console.error("❌ Chat flow test failed:", error);
  }
}

// Uncomment to run the test
// testChatFlow();

export { testChatFlow };
