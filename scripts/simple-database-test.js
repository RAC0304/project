// Script sederhana untuk test koneksi database dan basic query reviews
// Jalankan di browser console setelah login sebagai tour guide

async function simpleTest() {
  try {
    console.log('=== SIMPLE DATABASE TEST ===');
    
    // Import supabase client
    const { supabase } = await import('./src/config/supabaseClient.js');
    
    // 1. Test basic connection dengan query sederhana
    console.log('Testing basic connection...');
    const { data: basicTest, error: basicError } = await supabase
      .from('reviews')
      .select('id, user_id, tour_guide_id, rating, title')
      .limit(5);
    
    console.log('Basic query result:', basicTest);
    if (basicError) {
      console.error('Basic query error:', basicError);
      return;
    }
    
    // 2. Check tour guides table
    console.log('\nTesting tour guides table...');
    const { data: tourGuides, error: tgError } = await supabase
      .from('tour_guides')
      .select('id, user_id, guide_name')
      .limit(3);
    
    console.log('Tour guides:', tourGuides);
    if (tgError) console.error('Tour guides error:', tgError);
    
    // 3. Check users table
    console.log('\nTesting users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('role', 'customer')
      .limit(3);
    
    console.log('Users (customers):', users);
    if (usersError) console.error('Users error:', usersError);
    
    // 4. Test simple join
    console.log('\nTesting simple join...');
    const { data: joinTest, error: joinError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        users (
          first_name,
          last_name
        )
      `)
      .limit(3);
    
    console.log('Join test result:', joinTest);
    if (joinError) {
      console.error('Join test error:', joinError);
      
      // Try alternative join syntax
      console.log('\nTrying alternative join syntax...');
      const { data: altJoin, error: altError } = await supabase
        .from('reviews')
        .select('*, users(first_name, last_name)')
        .limit(3);
      
      console.log('Alternative join result:', altJoin);
      if (altError) console.error('Alternative join error:', altError);
    }
    
    console.log('\n=== TEST COMPLETED ===');
    
  } catch (error) {
    console.error('Unexpected error in simple test:', error);
  }
}

// Jalankan test
simpleTest();
