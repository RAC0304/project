// Test script untuk memverifikasi fix upcoming tours
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gsmcojozukrzfkwtevkl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbWNvam96dWtyemZrd3RldmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAwNTgsImV4cCI6MjA2NTExNjA1OH0.yOb-a-QUeuPGD5jZqg4wc7cOkMlLaHFVQKzjYPokbOg";

const supabase = createClient(supabaseUrl, supabaseKey);

// Test dengan tour guide ID yang ada
const testTourGuideId = 1; // Ganti dengan ID tour guide yang valid

async function testUpcomingToursFix() {
  console.log("=== TESTING UPCOMING TOURS FIX ===");
  console.log("Testing with tour_guide_id:", testTourGuideId);

  try {
    // 1. Cek tours yang dimiliki tour guide
    console.log("\n1. Checking tours for tour guide...");
    const { data: tours, error: toursError } = await supabase
      .from("tours")
      .select("id, title, location, is_active")
      .eq("tour_guide_id", testTourGuideId)
      .eq("is_active", true);

    if (toursError) {
      console.error("Error fetching tours:", toursError);
      return;
    }

    console.log("Tours found:", tours?.length || 0);
    tours?.forEach((tour, index) => {
      console.log(`  ${index + 1}. ${tour.title} (ID: ${tour.id}) - ${tour.location}`);
    });

    if (!tours || tours.length === 0) {
      console.log("No tours found for this guide. Creating test data...");
      
      // Create a test tour
      const { data: newTour, error: createError } = await supabase
        .from("tours")
        .insert([
          {
            tour_guide_id: testTourGuideId,
            title: "Test Tour for Dashboard",
            description: "Test tour for dashboard testing",
            location: "Bali, Indonesia",
            duration: "4 hours",
            price: 500000,
            max_group_size: 8,
            is_active: true,
            destination_id: 1
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating test tour:", createError);
        return;
      }

      console.log("Test tour created:", newTour.title);
      tours.push(newTour);
    }

    const tourIds = tours.map(tour => tour.id);
    console.log("Tour IDs to check:", tourIds);

    // 2. Cek bookings untuk tours tersebut
    console.log("\n2. Checking bookings for these tours...");
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        date,
        participants,
        status,
        tour_id,
        payment_status,
        tours!inner (
          id,
          title,
          location,
          tour_guide_id
        )
      `)
      .in("tour_id", tourIds);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return;
    }

    console.log("Total bookings found:", bookings?.length || 0);
    bookings?.forEach((booking, index) => {
      console.log(`  ${index + 1}. ${booking.tours?.title} - ${booking.date} - ${booking.participants} clients - ${booking.status}`);
    });

    // 3. Cek upcoming bookings (filter by date)
    console.log("\n3. Checking upcoming bookings...");
    const today = new Date().toISOString().split("T")[0];
    console.log("Today's date:", today);

    const upcomingBookings = bookings?.filter(booking => {
      const bookingDate = booking.date;
      const isUpcoming = bookingDate >= today;
      const isValidStatus = ["confirmed", "pending"].includes(booking.status);
      
      console.log(`  Booking ${booking.id}: ${bookingDate} >= ${today} = ${isUpcoming}, Status: ${booking.status}, Valid: ${isValidStatus}`);
      
      return isUpcoming && isValidStatus;
    });

    console.log("Upcoming bookings count:", upcomingBookings?.length || 0);

    // 4. Test aggregation (group by tour_id)
    console.log("\n4. Testing aggregation...");
    if (upcomingBookings && upcomingBookings.length > 0) {
      const tourBookingMap = new Map();
      
      upcomingBookings.forEach(booking => {
        const tourId = booking.tour_id;
        if (!tourBookingMap.has(tourId)) {
          tourBookingMap.set(tourId, {
            ...booking,
            totalClients: 0,
            allBookings: []
          });
        }
        
        const tourData = tourBookingMap.get(tourId);
        tourData.totalClients += booking.participants || 0;
        tourData.allBookings.push(booking);
        
        if (!tourData.date || booking.date < tourData.date) {
          tourData.date = booking.date;
          tourData.id = booking.id;
        }
      });

      console.log("Aggregated upcoming tours:");
      Array.from(tourBookingMap.values()).forEach((tourData, index) => {
        console.log(`  ${index + 1}. ${tourData.tours?.title} - ${tourData.date} - ${tourData.totalClients} total clients`);
      });
    }

    // 5. Create some test bookings if none exist
    if (!upcomingBookings || upcomingBookings.length === 0) {
      console.log("\n5. Creating test bookings...");
      
      // Create future booking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];
      
      const { data: testBooking, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            tour_id: tourIds[0],
            user_id: 1, // Assuming user ID 1 exists
            date: tomorrowStr,
            participants: 3,
            status: "confirmed",
            payment_status: "paid",
            total_amount: 1500000,
            special_requests: "Test booking for dashboard"
          }
        ])
        .select()
        .single();

      if (bookingError) {
        console.error("Error creating test booking:", bookingError);
      } else {
        console.log("Test booking created:", testBooking.id);
      }
    }

    console.log("\n=== TEST COMPLETED ===");
    console.log("Refresh your dashboard to see the changes!");

  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testUpcomingToursFix();
