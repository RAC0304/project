// Test script to debug routing issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRoutingIssues() {
    console.log('=== DEBUGGING ROUTING ISSUES ===\n');
    
    try {
        // 1. Check what itineraries exist in the database
        console.log('1. Checking itineraries in database...');
        const { data: itineraries, error } = await supabase
            .from('itineraries')
            .select('id, slug, title, status')
            .order('id');
        
        if (error) {
            console.error('❌ Error fetching itineraries:', error);
            return;
        }
        
        console.log(`   Found ${itineraries.length} itineraries:`);
        itineraries.forEach(itinerary => {
            console.log(`   - ID: ${itinerary.id}, Slug: "${itinerary.slug}", Title: "${itinerary.title}", Status: ${itinerary.status}`);
        });
        
        // 2. Test the service function
        console.log('\n2. Testing getItineraryBySlug function...');
        
        // Import the service function
        const { getItineraryBySlug } = await import('./src/services/itineraryService.js');
        
        // Test with each slug
        for (const itinerary of itineraries) {
            console.log(`\n   Testing slug: "${itinerary.slug}"`);
            try {
                const result = await getItineraryBySlug(itinerary.slug);
                if (result) {
                    console.log(`   ✅ Found itinerary: ${result.title}`);
                } else {
                    console.log(`   ❌ No itinerary found for slug: "${itinerary.slug}"`);
                }
            } catch (error) {
                console.log(`   ❌ Error fetching slug "${itinerary.slug}":`, error.message);
            }
        }
        
        // 3. Test with the specific slug from the error
        console.log('\n3. Testing problematic slug "3"...');
        try {
            const result = await getItineraryBySlug('3');
            if (result) {
                console.log(`   ✅ Found itinerary: ${result.title}`);
            } else {
                console.log(`   ❌ No itinerary found for slug "3" (this is expected)`);
            }
        } catch (error) {
            console.log(`   ❌ Error fetching slug "3":`, error.message);
        }
        
        // 4. Verify the routing expectations
        console.log('\n4. Expected routing behavior:');
        console.log('   - Route definition: /itineraries/:slug');
        console.log('   - Links should use: /itineraries/${itinerary.slug}');
        console.log('   - Service should receive: slug parameter (string)');
        
        console.log('\n5. Checking if any itinerary has slug "3"...');
        const numericSlug = itineraries.find(i => i.slug === '3');
        if (numericSlug) {
            console.log('   ⚠️  Found itinerary with numeric slug "3"');
        } else {
            console.log('   ✅ No itinerary has slug "3" (this is correct)');
        }
        
        // 6. Check sample data
        console.log('\n6. Checking for sample data...');
        const sampleItinerary = itineraries.find(i => i.slug === 'bali-cultural-experience');
        if (sampleItinerary) {
            console.log('   ✅ Sample itinerary found:', sampleItinerary.title);
            console.log(`   👉 Test URL: /itineraries/${sampleItinerary.slug}`);
        } else {
            console.log('   ❌ Sample itinerary not found. Run sample_itinerary_data.sql');
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

debugRoutingIssues();
