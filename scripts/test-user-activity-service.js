// scripts/test-user-activity-service.js
const { supabase } = require('../src/config/supabaseServerClient.js');

async function testUserActivityService() {
  console.log('🧪 Testing User Activity Service...\n');

  try {
    // Test 1: Check if required tables exist
    console.log('1. Checking if required tables exist...');
    
    const tables = ['bookings', 'reviews', 'messages', 'security_logs', 'itinerary_requests'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: Table exists`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }

    // Test 2: Check users table and get a sample user
    console.log('\n2. Getting sample user data...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .limit(5);

    if (usersError) {
      console.log(`   ❌ Users table error: ${usersError.message}`);
    } else if (users && users.length > 0) {
      console.log(`   ✅ Found ${users.length} users`);
      console.log('   Sample users:');
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}`);
      });

      // Test 3: Test activity queries for first user
      const testUserId = users[0].id;
      console.log(`\n3. Testing activity queries for user ID: ${testUserId}...`);

      // Test bookings
      try {
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            created_at,
            status,
            participants,
            total_amount,
            tours (
              title,
              location
            )
          `)
          .eq('user_id', testUserId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (bookingsError) {
          console.log(`   ❌ Bookings query error: ${bookingsError.message}`);
        } else {
          console.log(`   ✅ Bookings: Found ${bookings?.length || 0} records`);
        }
      } catch (err) {
        console.log(`   ❌ Bookings query failed: ${err.message}`);
      }

      // Test reviews
      try {
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            created_at,
            rating,
            title,
            destinations (
              name
            ),
            tour_guides (
              users (
                first_name,
                last_name
              )
            )
          `)
          .eq('user_id', testUserId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (reviewsError) {
          console.log(`   ❌ Reviews query error: ${reviewsError.message}`);
        } else {
          console.log(`   ✅ Reviews: Found ${reviews?.length || 0} records`);
        }
      } catch (err) {
        console.log(`   ❌ Reviews query failed: ${err.message}`);
      }

      // Test messages
      try {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            sent_at,
            content,
            receiver:users!messages_receiver_id_fkey (
              first_name,
              last_name
            )
          `)
          .eq('sender_id', testUserId)
          .order('sent_at', { ascending: false })
          .limit(3);

        if (messagesError) {
          console.log(`   ❌ Messages query error: ${messagesError.message}`);
        } else {
          console.log(`   ✅ Messages: Found ${messages?.length || 0} records`);
        }
      } catch (err) {
        console.log(`   ❌ Messages query failed: ${err.message}`);
      }

      // Test security logs
      try {
        const { data: logs, error: logsError } = await supabase
          .from('security_logs')
          .select('id, created_at, action, ip_address, status')
          .eq('user_id', testUserId)
          .eq('action', 'login')
          .eq('status', 'success')
          .order('created_at', { ascending: false })
          .limit(2);

        if (logsError) {
          console.log(`   ❌ Security logs query error: ${logsError.message}`);
        } else {
          console.log(`   ✅ Security logs: Found ${logs?.length || 0} records`);
        }
      } catch (err) {
        console.log(`   ❌ Security logs query failed: ${err.message}`);
      }

      // Test itinerary requests
      try {
        const { data: requests, error: requestsError } = await supabase
          .from('itinerary_requests')
          .select(`
            id,
            created_at,
            status,
            start_date,
            end_date,
            group_size,
            itineraries (
              title
            )
          `)
          .eq('user_id', testUserId)
          .order('created_at', { ascending: false })
          .limit(2);

        if (requestsError) {
          console.log(`   ❌ Itinerary requests query error: ${requestsError.message}`);
        } else {
          console.log(`   ✅ Itinerary requests: Found ${requests?.length || 0} records`);
        }
      } catch (err) {
        console.log(`   ❌ Itinerary requests query failed: ${err.message}`);
      }

    } else {
      console.log('   ❌ No users found in database');
    }

    console.log('\n✅ User Activity Service test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserActivityService();
