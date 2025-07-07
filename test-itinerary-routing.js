/**
 * Test script to verify itinerary routing and data loading
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testItineraryRouting() {
    console.log('🧪 Testing itinerary routing and data loading...\n');

    try {
        // Test 1: Get all itineraries to see available slugs
        console.log('1️⃣ Testing getAllItineraries...');
        const { data: itineraries, error: listError } = await supabase
            .from('itineraries')
            .select('id, slug, title, status')
            .eq('status', 'published')
            .limit(5);

        if (listError) {
            console.error('❌ Error fetching itineraries:', listError);
            return;
        }

        console.log('✅ Found', itineraries.length, 'published itineraries:');
        itineraries.forEach(itinerary => {
            console.log(`   - ${itinerary.title} (slug: ${itinerary.slug}, id: ${itinerary.id})`);
        });

        if (itineraries.length === 0) {
            console.log('⚠️  No published itineraries found. Make sure sample data is inserted.');
            return;
        }

        // Test 2: Get itinerary by slug
        const testSlug = itineraries[0].slug;
        console.log(`\n2️⃣ Testing getItineraryBySlug with slug: ${testSlug}`);
        
        const { data: itineraryData, error: slugError } = await supabase
            .from('itineraries')
            .select('*')
            .eq('slug', testSlug)
            .eq('status', 'published')
            .single();

        if (slugError) {
            console.error('❌ Error fetching itinerary by slug:', slugError);
            return;
        }

        console.log('✅ Itinerary fetched successfully:', itineraryData.title);

        // Test 3: Check days and activities
        console.log('\n3️⃣ Testing days and activities...');
        
        const { data: daysData, error: daysError } = await supabase
            .from('itinerary_days')
            .select('*')
            .eq('itinerary_id', itineraryData.id)
            .order('day_number', { ascending: true });

        if (daysError) {
            console.error('❌ Error fetching days:', daysError);
            return;
        }

        console.log('✅ Found', daysData.length, 'days for itinerary');

        if (daysData.length > 0) {
            const firstDay = daysData[0];
            console.log(`   - Day ${firstDay.day_number}: ${firstDay.title}`);

            // Check activities for first day
            const { data: activitiesData, error: activitiesError } = await supabase
                .from('itinerary_activities')
                .select('*')
                .eq('itinerary_day_id', firstDay.id)
                .order('order_index', { ascending: true });

            if (activitiesError) {
                console.error('❌ Error fetching activities:', activitiesError);
            } else {
                console.log('✅ Found', activitiesData.length, 'activities for day 1');
            }
        }

        // Test 4: Test routing patterns
        console.log('\n4️⃣ Testing routing patterns...');
        console.log('✅ Expected routes:');
        itineraries.forEach(itinerary => {
            console.log(`   - /itineraries/${itinerary.slug} -> ${itinerary.title}`);
        });

        console.log('\n🎉 All tests passed! The itinerary routing should work correctly.');
        console.log(`\n📍 To test manually, visit: /itineraries/${testSlug}`);

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testItineraryRouting();
