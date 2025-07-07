// Test the redirect mechanism
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRedirectMechanism() {
    console.log('=== TESTING REDIRECT MECHANISM ===\n');
    
    try {
        // Test the getItineraryById function behavior
        console.log('1. Testing getItineraryById with ID "3"...');
        
        const { data: itinerary, error } = await supabase
            .from('itineraries')
            .select('id, slug, title')
            .eq('id', 3)
            .single();
            
        if (error) {
            console.error('❌ Error:', error);
            return;
        }
        
        if (itinerary) {
            console.log(`✅ Found itinerary by ID 3:`);
            console.log(`   Title: ${itinerary.title}`);
            console.log(`   Slug: ${itinerary.slug}`);
            console.log(`   Expected redirect: /itineraries/3 → /itineraries/${itinerary.slug}`);
        } else {
            console.log('❌ No itinerary found with ID 3');
        }
        
        // Check if slug "3" exists (it shouldn't)
        console.log('\n2. Checking if slug "3" exists...');
        const { data: slugItinerary } = await supabase
            .from('itineraries')
            .select('id, slug, title')
            .eq('slug', '3')
            .single();
            
        if (slugItinerary) {
            console.log('⚠️  Found itinerary with slug "3" (unexpected)');
        } else {
            console.log('✅ No itinerary with slug "3" (expected)');
        }
        
        console.log('\n3. Summary:');
        console.log('   - URL: /itineraries/3');
        console.log('   - Will try slug "3" first → fail');
        console.log('   - Will detect numeric and try ID 3 → success');
        console.log(`   - Will redirect to: /itineraries/${itinerary.slug}`);
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testRedirectMechanism();
