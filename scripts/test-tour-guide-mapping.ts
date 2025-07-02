const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lbhqpjgzqmkqmrwyblxd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiaHFwamd6cW1rcW1yd3libHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNDAwMzgsImV4cCI6MjA0ODYxNjAzOH0.m2c_JOaNDbBpfklLI6VjqsZl_4Qsv2JsW1R8cXY2-XE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTourGuideMapping() {
  console.log('=== Testing Tour Guide ID Mapping ===');
  
  // 1. Ambil semua users dengan role tour_guide
  const { data: tourGuideUsers, error: usersError } = await supabase
    .from('users')
    .select('id, first_name, last_name, email')
    .eq('role', 'tour_guide');

  if (usersError) {
    console.error('Error fetching tour guide users:', usersError);
    return;
  }

  console.log('Tour Guide Users:', tourGuideUsers);

  // 2. Untuk setiap user, cek apakah ada record di tabel tour_guides
  for (const user of tourGuideUsers || []) {
    console.log(`\n--- Checking user ${user.id} (${user.first_name} ${user.last_name}) ---`);
    
    const { data: tourGuideRecords, error: tourGuideError } = await supabase
      .from('tour_guides')
      .select('id, user_id, guide_name, description')
      .eq('user_id', user.id);

    if (tourGuideError) {
      console.error(`Error fetching tour_guides for user ${user.id}:`, tourGuideError);
      continue;
    }

    if (!tourGuideRecords || tourGuideRecords.length === 0) {
      console.log(`❌ No tour_guides record found for user ${user.id}`);
    } else {
      console.log(`✅ Tour guides records:`, tourGuideRecords);
      
      // 3. Cek apakah ada reviews untuk tour guide ini
      for (const tg of tourGuideRecords) {
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, tour_guide_id, customer_id, booking_id, rating, comment')
          .eq('tour_guide_id', tg.id);

        if (reviewsError) {
          console.error(`Error fetching reviews for tour_guide ${tg.id}:`, reviewsError);
        } else {
          console.log(`  📝 Reviews for tour_guide ${tg.id}:`, reviews?.length || 0, 'reviews');
          if (reviews && reviews.length > 0) {
            console.log('    Sample reviews:', reviews.slice(0, 2));
          }
        }
      }
    }
  }
}

// Jalankan test
testTourGuideMapping().catch(console.error);
