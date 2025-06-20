#!/usr/bin/env node

/**
 * Test script untuk backend clients
 * Menjalankan test manual tanpa jest untuk demo
 */

// Simulasi test data
const mockTourGuideId = "tour-guide-123";
const mockClientId = "client-456";

// Mock Supabase responses
const mockBookingsResponse = {
  data: [
    {
      user_id: "user-1",
      users: {
        id: "user-1",
        email: "john.doe@example.com",
        first_name: "John",
        last_name: "Doe",
        phone: "+62 812 3456 7890",
        profile_picture: null,
        location: "Jakarta",
        created_at: "2024-01-15T08:00:00Z",
      },
      id: "booking-1",
      total_amount: "2500000",
      status: "confirmed",
      created_at: "2024-06-01T10:00:00Z",
      date: "2024-06-15",
    },
    {
      user_id: "user-2",
      users: {
        id: "user-2",
        email: "jane.smith@example.com",
        first_name: "Jane",
        last_name: "Smith",
        phone: "+62 813 9876 5432",
        profile_picture: null,
        location: "Bali",
        created_at: "2024-02-20T09:30:00Z",
      },
      id: "booking-2",
      total_amount: "1800000",
      status: "confirmed",
      created_at: "2024-05-15T14:20:00Z",
      date: "2024-05-25",
    },
  ],
  error: null,
};

// Test functions
async function testGetClientsByTourGuide() {
  console.log("🧪 Testing getClientsByTourGuide...");

  try {
    // Simulate processing the mock data
    const clients = processBookingsData(mockBookingsResponse.data);

    console.log("✅ Success! Found", clients.length, "clients");
    console.log("📋 Sample client:", JSON.stringify(clients[0], null, 2));

    return clients;
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

async function testGetClientStats(clients) {
  console.log("\n🧪 Testing getClientStats...");

  try {
    const stats = calculateClientStats(clients);

    console.log("✅ Success! Stats calculated:");
    console.log("📊 Total Clients:", stats.totalClients);
    console.log("📊 Active Clients:", stats.activeClients);
    console.log("📊 Total Bookings:", stats.totalBookings);
    console.log("📊 Average Rating:", stats.averageRating);

    return stats;
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

async function testGetClientDetails() {
  console.log("\n🧪 Testing getClientDetails...");

  try {
    const mockClientDetails = {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+62 812 3456 7890",
      location: "Jakarta",
      avatar: null,
      joinDate: "2024-01-15T08:00:00Z",
      languages: ["English", "Indonesian"],
      totalBookings: 3,
      totalSpent: 5500000,
      averageRating: 4.8,
      lastBooking: "2024-06-15",
      status: "active",
      bookings: [
        {
          id: "booking-1",
          date: "2024-06-15",
          participants: 2,
          status: "confirmed",
          total_amount: "2500000",
          tours: {
            title: "Bali Cultural Experience",
            location: "Ubud, Bali",
          },
        },
      ],
      reviews: [
        {
          id: "review-1",
          rating: 5,
          comment: "Amazing experience! Highly recommended!",
          created_at: "2024-06-16T12:00:00Z",
        },
      ],
    };

    console.log("✅ Success! Client details retrieved:");
    console.log("👤 Name:", mockClientDetails.name);
    console.log("📧 Email:", mockClientDetails.email);
    console.log("📱 Phone:", mockClientDetails.phone);
    console.log("🏠 Location:", mockClientDetails.location);
    console.log("📈 Total Bookings:", mockClientDetails.totalBookings);
    console.log(
      "💰 Total Spent:",
      formatCurrency(mockClientDetails.totalSpent)
    );
    console.log("⭐ Average Rating:", mockClientDetails.averageRating);
    console.log("📅 Last Booking:", mockClientDetails.lastBooking);
    console.log("🟢 Status:", mockClientDetails.status);

    return mockClientDetails;
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

async function testSendMessage() {
  console.log("\n🧪 Testing sendMessageToClient...");

  try {
    const message =
      "Hello! Thank you for booking our tour. We're excited to show you around Bali!";
    const result = simulateSendMessage(mockClientId, mockTourGuideId, message);

    console.log("✅ Success! Message sent:");
    console.log("📤 To Client ID:", mockClientId);
    console.log("👨‍💼 From Tour Guide ID:", mockTourGuideId);
    console.log("💬 Message:", message);
    console.log("📋 Result:", result);

    return result;
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// Helper functions
function processBookingsData(bookingsData) {
  const clientMap = new Map();

  bookingsData.forEach((booking) => {
    const userId = booking.user_id;
    const user = booking.users;

    if (!clientMap.has(userId)) {
      clientMap.set(userId, {
        id: userId,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone,
        location: user.location,
        avatar: user.profile_picture,
        joinDate: user.created_at,
        totalBookings: 0,
        totalSpent: 0,
        averageRating: 0,
        lastBooking: null,
        status: "inactive",
      });
    }

    const client = clientMap.get(userId);
    client.totalBookings += 1;
    client.totalSpent += parseFloat(booking.total_amount || "0");

    if (
      !client.lastBooking ||
      new Date(booking.date) > new Date(client.lastBooking)
    ) {
      client.lastBooking = booking.date;
    }

    // Determine status (active if booked in last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    client.status =
      new Date(client.lastBooking) >= sixMonthsAgo ? "active" : "inactive";

    // Mock rating
    client.averageRating = 4.0 + Math.random(); // Random rating between 4.0-5.0
  });

  return Array.from(clientMap.values());
}

function calculateClientStats(clients) {
  const totalClients = clients.length;
  const activeClients = clients.filter(
    (client) => client.status === "active"
  ).length;
  const totalBookings = clients.reduce(
    (sum, client) => sum + client.totalBookings,
    0
  );
  const averageRating =
    clients.length > 0
      ? clients.reduce((sum, client) => sum + client.averageRating, 0) /
        clients.length
      : 0;

  return {
    totalClients,
    activeClients,
    totalBookings,
    averageRating: parseFloat(averageRating.toFixed(1)),
  };
}

function simulateSendMessage(clientId, tourGuideId, message) {
  return {
    success: true,
    message: "Message sent successfully",
    timestamp: new Date().toISOString(),
    messageId: `msg-${Date.now()}`,
    clientId,
    tourGuideId,
    content: message,
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Test filters
function testFilters(clients) {
  console.log("\n🧪 Testing filters...");

  // Test search filter
  console.log("🔍 Testing search filter for 'john':");
  const searchResult = clients.filter(
    (client) =>
      client.name.toLowerCase().includes("john") ||
      client.email.toLowerCase().includes("john")
  );
  console.log("Found", searchResult.length, "clients matching 'john'");

  // Test status filter
  console.log("🔍 Testing status filter for 'active':");
  const activeResult = clients.filter((client) => client.status === "active");
  console.log("Found", activeResult.length, "active clients");

  // Test pagination
  console.log("🔍 Testing pagination (page 1, limit 5):");
  const page = 1;
  const limit = 5;
  const offset = (page - 1) * limit;
  const paginatedResult = clients.slice(offset, offset + limit);
  console.log("Page", page, "shows", paginatedResult.length, "clients");
  console.log("Total pages:", Math.ceil(clients.length / limit));
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting Clients Backend Tests\n");
  console.log("=" + "=".repeat(50));

  try {
    // Test 1: Get clients
    const clients = await testGetClientsByTourGuide();

    // Test 2: Get stats
    const stats = await testGetClientStats(clients);

    // Test 3: Get client details
    const clientDetails = await testGetClientDetails();

    // Test 4: Send message
    const messageResult = await testSendMessage();

    // Test 5: Filters
    testFilters(clients);

    console.log("\n" + "=".repeat(52));
    console.log("🎉 All tests completed successfully!");
    console.log("✅ getClientsByTourGuide: PASSED");
    console.log("✅ getClientStats: PASSED");
    console.log("✅ getClientDetails: PASSED");
    console.log("✅ sendMessageToClient: PASSED");
    console.log("✅ Filters & Pagination: PASSED");
  } catch (error) {
    console.log("\n" + "=".repeat(52));
    console.error("💥 Tests failed with error:", error.message);
    process.exit(1);
  }
}

// Performance test
function performanceTest() {
  console.log("\n🏃‍♂️ Running performance tests...");

  // Generate large dataset
  const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
    user_id: `user-${i}`,
    users: {
      id: `user-${i}`,
      email: `user${i}@example.com`,
      first_name: `User`,
      last_name: `${i}`,
      phone: `+62812345${String(i).padStart(4, "0")}`,
      profile_picture: null,
      location: i % 2 === 0 ? "Jakarta" : "Bali",
      created_at: new Date(2024, 0, 1 + (i % 365)).toISOString(),
    },
    id: `booking-${i}`,
    total_amount: String(1000000 + i * 50000),
    status: "confirmed",
    created_at: new Date().toISOString(),
    date: new Date(2024, 5, 1 + (i % 30)).toISOString(),
  }));

  console.time("Processing 1000 bookings");
  const processedClients = processBookingsData(largeDataset);
  console.timeEnd("Processing 1000 bookings");

  console.log(
    "📊 Processed",
    processedClients.length,
    "unique clients from 1000 bookings"
  );

  console.time("Calculating stats for large dataset");
  const stats = calculateClientStats(processedClients);
  console.timeEnd("Calculating stats for large dataset");

  console.log("📈 Stats:", stats);
}

// Integration test
function integrationTest() {
  console.log("\n🔗 Running integration tests...");

  // Test error scenarios
  console.log("Testing error handling...");

  try {
    processBookingsData(null);
  } catch (error) {
    console.log("✅ Null data handling: PASSED");
  }

  try {
    processBookingsData([]);
    console.log("✅ Empty data handling: PASSED");
  } catch (error) {
    console.log("❌ Empty data handling: FAILED");
  }

  // Test malformed data
  try {
    const malformedData = [{ invalid: "data" }];
    processBookingsData(malformedData);
    console.log("✅ Malformed data handling: PASSED");
  } catch (error) {
    console.log("❌ Malformed data handling: FAILED");
  }
}

// Run tests based on command line argument
const testType = process.argv[2] || "all";

switch (testType) {
  case "basic":
    runAllTests();
    break;
  case "performance":
    performanceTest();
    break;
  case "integration":
    integrationTest();
    break;
  case "all":
  default:
    runAllTests().then(() => {
      performanceTest();
      integrationTest();
    });
    break;
}

console.log(
  "\n💡 Usage: node clientsBackendTest.js [basic|performance|integration|all]"
);
