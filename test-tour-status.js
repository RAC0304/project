const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vrbpswynrakxkzpzoyty.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnBzd3lucmFreGt6cHpveXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMzQ1MjMsImV4cCI6MjA0NzcxMDUyM30.8DhMBJmyJLIGPQkEGVKZjGPBnYNzJfVCRVqoOlMEPnw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTourStatus() {
  try {
    console.log('🔍 Testing Tour Status Logic...\n');

    // Test 1: Check active tours
    console.log('1. Checking active tours in database:');
    const { data: tours, error: toursError } = await supabase
      .from('tours')
      .select('id, title, location, is_active, tour_guide_id')
      .eq('is_active', true)
      .limit(5);

    if (toursError) {
      console.error('❌ Error fetching tours:', toursError);
      return;
    }

    if (tours && tours.length > 0) {
      console.log('✅ Active tours found:');
      tours.forEach(tour => {
        console.log(`   - ID: ${tour.id}, Title: ${tour.title}, Active: ${tour.is_active}, Guide: ${tour.tour_guide_id}`);
      });
    } else {
      console.log('❌ No active tours found');
    }

    // Test 2: Check bookings for active tours
    console.log('\n2. Checking bookings for active tours:');
    const tourIds = tours.map(tour => tour.id);
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        date,
        participants,
        status,
        tour_id,
        payment_status,
        created_at,
        tours!inner (
          id,
          title,
          location,
          tour_guide_id,
          is_active
        )
      `)
      .in('tour_id', tourIds)
      .in('status', ['confirmed', 'pending'])
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError);
      return;
    }

    if (bookings && bookings.length > 0) {
      console.log('✅ Upcoming bookings found:');
      bookings.forEach(booking => {
        console.log(`   - Booking ID: ${booking.id}`);
        console.log(`     Tour: ${booking.tours?.title} (ID: ${booking.tours?.id})`);
        console.log(`     Date: ${booking.date}`);
        console.log(`     Status: ${booking.status}`);
        console.log(`     Tour Active: ${booking.tours?.is_active}`);
        console.log(`     Participants: ${booking.participants}`);
        console.log(`     ---`);
      });
    } else {
      console.log('❌ No upcoming bookings found');
    }

    // Test 3: Simulate the service logic
    console.log('\n3. Simulating service logic:');
    
    if (bookings && bookings.length > 0) {
      const tourBookingMap = new Map();
      
      bookings.forEach(booking => {
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

      console.log('📊 Processed upcoming tours:');
      Array.from(tourBookingMap.values()).forEach(tourData => {
        const bookingStatuses = tourData.allBookings.map(b => b.status);
        const isActiveTour = tourData.tours?.is_active;
        let overallStatus = "pending";
        
        if (isActiveTour && bookingStatuses.includes("confirmed")) {
          overallStatus = "confirmed";
        } else if (isActiveTour && bookingStatuses.includes("pending")) {
          overallStatus = "pending";
        } else if (isActiveTour && bookingStatuses.every(status => status === "cancelled")) {
          overallStatus = "cancelled";
        } else if (isActiveTour) {
          overallStatus = "confirmed";
        }

        console.log(`   - Tour: ${tourData.tours?.title}`);
        console.log(`     Location: ${tourData.tours?.location}`);
        console.log(`     Date: ${tourData.date}`);
        console.log(`     Total Clients: ${tourData.totalClients}`);
        console.log(`     Tour Active: ${isActiveTour}`);
        console.log(`     Booking Statuses: [${bookingStatuses.join(', ')}]`);
        console.log(`     Final Status: ${overallStatus}`);
        console.log(`     ---`);
      });
    }

    console.log('\n✅ Tour Status Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTourStatus();
