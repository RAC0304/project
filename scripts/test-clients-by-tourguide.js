// Test script to verify client filtering by tour guide
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testClientsByTourGuide() {
  console.log('=== Testing Client Filtering by Tour Guide ===\n');

  try {
    // 1. Get all users with tour_guide role
    console.log('1. Fetching all tour guide users...');
    const { data: tourGuideUsers, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('role', 'tour_guide');

    if (usersError) {
      console.error('Error fetching tour guide users:', usersError);
      return;
    }

    console.log(`Found ${tourGuideUsers?.length || 0} tour guide users\n`);

    for (const user of tourGuideUsers || []) {
      console.log(`--- Testing for Tour Guide: ${user.first_name} ${user.last_name} (ID: ${user.id}) ---`);

      // 2. Get tour guide profile
      const { data: tourGuideProfile, error: profileError } = await supabase
        .from('tour_guides')
        .select('*')
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error fetching tour guide profile:', profileError);
        continue;
      }

      if (!tourGuideProfile || tourGuideProfile.length === 0) {
        console.log('No tour guide profile found for this user\n');
        continue;
      }

      const tourGuideId = tourGuideProfile[0].id;
      console.log(`Tour Guide Profile ID: ${tourGuideId}`);

      // 3. Get tours for this tour guide
      const { data: tours, error: toursError } = await supabase
        .from('tours')
        .select('id, title')
        .eq('tour_guide_id', tourGuideId);

      if (toursError) {
        console.error('Error fetching tours:', toursError);
        continue;
      }

      console.log(`Tours: ${tours?.length || 0}`);
      if (tours?.length) {
        tours.forEach(tour => console.log(`  - ${tour.title} (ID: ${tour.id})`));
      }

      // 4. Get bookings for these tours
      if (tours?.length) {
        const tourIds = tours.map(t => t.id);
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            user_id,
            tour_id,
            total_amount,
            date,
            users (
              first_name,
              last_name,
              email
            )
          `)
          .in('tour_id', tourIds);

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          continue;
        }

        console.log(`Bookings: ${bookings?.length || 0}`);
        
        // Get unique clients
        const uniqueClients = new Map();
        bookings?.forEach(booking => {
          if (!uniqueClients.has(booking.user_id)) {
            uniqueClients.set(booking.user_id, {
              id: booking.user_id,
              name: `${booking.users.first_name} ${booking.users.last_name}`,
              email: booking.users.email,
              bookings: []
            });
          }
          uniqueClients.get(booking.user_id).bookings.push(booking);
        });

        console.log(`Unique Clients: ${uniqueClients.size}`);
        for (const [clientId, client] of uniqueClients) {
          console.log(`  - ${client.name} (${client.email}) - ${client.bookings.length} booking(s)`);
        }
      }

      console.log(''); // Empty line for separation
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testClientsByTourGuide();
