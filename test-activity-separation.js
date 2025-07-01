/**
 * Test script to verify that booking activities are properly separated
 * by status (pending, confirmed, paid) in the recent activities display.
 */

// Mock booking data to test different scenarios
const mockBookingData = [
  // Booking 1: Pending booking (just created)
  {
    id: 1,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
    status: "pending",
    payment_status: "pending",
    participants: 2,
    total_amount: 150000,
    tours: {
      title: "Bali Cultural Tour",
      location: "Bali",
    },
  },
  // Booking 2: Confirmed but not paid yet
  {
    id: 2,
    created_at: "2025-01-02T10:00:00Z",
    updated_at: "2025-01-02T14:00:00Z",
    status: "confirmed",
    payment_status: "pending",
    participants: 3,
    total_amount: 200000,
    tours: {
      title: "Jakarta City Tour",
      location: "Jakarta",
    },
  },
  // Booking 3: Confirmed and paid
  {
    id: 3,
    created_at: "2025-01-03T10:00:00Z",
    updated_at: "2025-01-03T16:00:00Z",
    status: "confirmed",
    payment_status: "paid",
    participants: 4,
    total_amount: 300000,
    tours: {
      title: "Yogyakarta Heritage Tour",
      location: "Yogyakarta",
    },
  },
];

// Mock date formatting function
function formatIndonesianDate(dateString) {
  return new Date(dateString).toLocaleDateString("id-ID");
}

// Function to simulate the booking activity generation logic
function generateBookingActivities(bookings) {
  const activities = [];

  bookings.forEach((booking) => {
    const tour = booking.tours;

    // 1. Activity for pending bookings (just created, waiting for confirmation)
    if (booking.status === "pending") {
      activities.push({
        id: `booking-pending-${booking.id}`,
        type: "booking",
        title: "Booking Created",
        description: `Booked "${tour?.title || "Unknown Tour"}" in ${
          tour?.location || "Unknown Location"
        } for ${booking.participants} participants - waiting for confirmation`,
        timestamp: booking.created_at,
        formattedDate: formatIndonesianDate(booking.created_at),
        icon: "⏳",
        details: {
          bookingId: booking.id,
          status: booking.status,
          paymentStatus: booking.payment_status,
          amount: booking.total_amount,
          participants: booking.participants,
          tourTitle: tour?.title,
          tourLocation: tour?.location,
          activityType: "creation",
        },
      });
    }

    // 2. Activity for confirmed bookings (confirmed but not paid yet)
    if (
      booking.status === "confirmed" &&
      booking.payment_status === "pending"
    ) {
      activities.push({
        id: `booking-confirmed-${booking.id}`,
        type: "booking",
        title: "Booking Confirmed - Payment Required",
        description: `Tour guide confirmed your booking for "${
          tour?.title || "Unknown Tour"
        }" - please complete payment`,
        timestamp: booking.updated_at || booking.created_at,
        formattedDate: formatIndonesianDate(
          booking.updated_at || booking.created_at
        ),
        icon: "✅",
        details: {
          bookingId: booking.id,
          status: booking.status,
          paymentStatus: booking.payment_status,
          amount: booking.total_amount,
          participants: booking.participants,
          tourTitle: tour?.title,
          tourLocation: tour?.location,
          activityType: "confirmation",
        },
      });
    }

    // 3. Activity for paid bookings (payment completed - can chat with tour guide)
    if (booking.payment_status === "paid") {
      activities.push({
        id: `booking-paid-${booking.id}`,
        type: "booking",
        title: "Payment Completed - Tour Confirmed",
        description: `Payment successful for "${
          tour?.title || "Unknown Tour"
        }" - you can now chat with your tour guide!`,
        timestamp: booking.updated_at || booking.created_at,
        formattedDate: formatIndonesianDate(
          booking.updated_at || booking.created_at
        ),
        icon: "💳",
        details: {
          bookingId: booking.id,
          status: booking.status,
          paymentStatus: booking.payment_status,
          amount: booking.total_amount,
          participants: booking.participants,
          tourTitle: tour?.title,
          tourLocation: tour?.location,
          activityType: "payment",
        },
      });
    }
  });

  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Function to test UI button display logic
function testButtonDisplay(activities) {
  console.log("\n=== Testing Button Display Logic ===\n");

  activities.forEach((activity) => {
    console.log(`Activity: ${activity.title}`);
    console.log(`ID: ${activity.id}`);
    console.log(`Description: ${activity.description}`);
    console.log(`Activity Type: ${activity.details.activityType}`);
    console.log(`Status: ${activity.details.status}`);
    console.log(`Payment Status: ${activity.details.paymentStatus}`);

    // Check which buttons should be displayed
    const shouldShowPayButton =
      activity.details.activityType === "confirmation" &&
      activity.details.paymentStatus === "pending";
    const shouldShowChatButton = activity.details.activityType === "payment";

    console.log(
      `Should show "Pay Now" button: ${
        shouldShowPayButton ? "YES ✅" : "NO ❌"
      }`
    );
    console.log(
      `Should show "Chat Tour Guide" button: ${
        shouldShowChatButton ? "YES ✅" : "NO ❌"
      }`
    );
    console.log("---");
  });
}

// Run the test
console.log("🧪 Testing Activity Separation Logic\n");
console.log("Mock booking data:");
console.log(JSON.stringify(mockBookingData, null, 2));

console.log("\n=== Generated Activities ===\n");
const activities = generateBookingActivities(mockBookingData);

activities.forEach((activity, index) => {
  console.log(`${index + 1}. ${activity.title}`);
  console.log(`   Icon: ${activity.icon}`);
  console.log(`   Description: ${activity.description}`);
  console.log(`   Activity Type: ${activity.details.activityType}`);
  console.log(`   Booking ID: ${activity.details.bookingId}`);
  console.log(
    `   Status: ${activity.details.status} | Payment: ${activity.details.paymentStatus}`
  );
  console.log("");
});

// Test button display logic
testButtonDisplay(activities);

console.log("\n✅ Summary:");
console.log(`- Total activities generated: ${activities.length}`);
console.log(
  `- Activities with "Pay Now" button: ${
    activities.filter(
      (a) =>
        a.details.activityType === "confirmation" &&
        a.details.paymentStatus === "pending"
    ).length
  }`
);
console.log(
  `- Activities with "Chat Tour Guide" button: ${
    activities.filter((a) => a.details.activityType === "payment").length
  }`
);
console.log("\n🎯 Expected behavior:");
console.log("- Pending bookings: Only show status, no buttons");
console.log('- Confirmed but unpaid bookings: Show "Pay Now" button');
console.log('- Paid bookings: Show "Chat Tour Guide" button');
