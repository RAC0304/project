// Test script to validate the finish tour functionality
const { BookingStatusService } = require("./src/services/bookingStatusService");

// Mock user ID for testing
const TEST_USER_ID = 1;

async function testFinishTourFunctionality() {
  console.log("Testing Finish Tour Functionality...\n");

  try {
    // 1. Test getting finishable tours
    console.log("1. Getting finishable tours...");
    const finishableTours = await BookingStatusService.getFinishableTours(
      TEST_USER_ID
    );
    console.log(`Found ${finishableTours.length} finishable tours`);

    if (finishableTours.length > 0) {
      console.log("Sample finishable tour:", {
        id: finishableTours[0].id,
        title: finishableTours[0].tours?.title,
        date: finishableTours[0].date,
        status: finishableTours[0].status,
      });
    }

    // 2. Test getting completed tours
    console.log("\n2. Getting completed tours...");
    const completedTours = await BookingStatusService.getCompletedTours(
      TEST_USER_ID
    );
    console.log(`Found ${completedTours.length} completed tours`);

    // 3. Test getting eligible for review
    console.log("\n3. Getting tours eligible for review...");
    const eligibleForReview = await BookingStatusService.getEligibleForReview(
      TEST_USER_ID
    );
    console.log(`Found ${eligibleForReview.length} tours eligible for review`);

    // 4. Test getting full customer booking status
    console.log("\n4. Getting full customer booking status...");
    const fullStatus = await BookingStatusService.getCustomerBookingStatus(
      TEST_USER_ID
    );
    console.log("Full status:", {
      upcomingTours: fullStatus.upcomingTours.length,
      todayTours: fullStatus.todayTours.length,
      completedTours: fullStatus.completedTours.length,
      eligibleForReview: fullStatus.eligibleForReview.length,
      finishableTours: fullStatus.finishableTours.length,
    });

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testFinishTourFunctionality();
