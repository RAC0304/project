const { createClient } = require('@supabase/supabase-js');

// Test configuration
const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testItinerariesWithRelations() {
    console.log('🧪 Testing Itineraries with Related Tables...\n');

    try {
        // Test 1: Create a complete itinerary
        console.log('1. Creating itinerary with destinations, days, and activities...');
        
        const testItinerary = {
            slug: 'test-bali-adventure',
            title: 'Test Bali Adventure',
            duration: '7 days',
            description: 'A comprehensive test itinerary for Bali',
            difficulty: 'moderate',
            best_season: 'April to October',
            estimated_budget: '$1000-1500',
            image_url: 'https://example.com/bali.jpg'
        };

        const { data: itinerary, error: itineraryError } = await supabase
            .from('itineraries')
            .insert(testItinerary)
            .select()
            .single();

        if (itineraryError) throw itineraryError;
        console.log('✅ Itinerary created:', itinerary.title);

        // Test 2: Add destinations
        console.log('2. Adding destinations...');
        
        // First, get some destinations
        const { data: destinations } = await supabase
            .from('destinations')
            .select('id, name, slug')
            .limit(2);

        if (destinations && destinations.length > 0) {
            const destinationInserts = destinations.map((dest, index) => ({
                itinerary_id: itinerary.id,
                destination_id: dest.id,
                order_index: index + 1
            }));

            const { error: destError } = await supabase
                .from('itinerary_destinations')
                .insert(destinationInserts);

            if (destError) throw destError;
            console.log('✅ Destinations added:', destinations.map(d => d.name).join(', '));
        }

        // Test 3: Add days and activities
        console.log('3. Adding days and activities...');
        
        for (let dayNum = 1; dayNum <= 3; dayNum++) {
            // Create day
            const { data: day, error: dayError } = await supabase
                .from('itinerary_days')
                .insert({
                    itinerary_id: itinerary.id,
                    day_number: dayNum,
                    title: `Day ${dayNum}: Test Activities`,
                    description: `Test description for day ${dayNum}`,
                    accommodation: 'Test Hotel',
                    meals: 'Breakfast, Lunch, Dinner',
                    transportation: 'Private car'
                })
                .select()
                .single();

            if (dayError) throw dayError;

            // Add activities for this day
            const activities = [
                {
                    itinerary_day_id: day.id,
                    time_start: '09:00',
                    title: `Morning Activity ${dayNum}`,
                    description: `Test morning activity for day ${dayNum}`,
                    location: 'Test Location',
                    order_index: 1
                },
                {
                    itinerary_day_id: day.id,
                    time_start: '14:00',
                    title: `Afternoon Activity ${dayNum}`,
                    description: `Test afternoon activity for day ${dayNum}`,
                    location: 'Test Location 2',
                    order_index: 2
                }
            ];

            const { error: activityError } = await supabase
                .from('itinerary_activities')
                .insert(activities);

            if (activityError) throw activityError;
        }

        console.log('✅ Days and activities added successfully');

        // Test 4: Fetch complete itinerary with relations
        console.log('4. Fetching complete itinerary with relations...');
        
        const { data: completeItinerary, error: fetchError } = await supabase
            .from('itineraries')
            .select(`
                *,
                itinerary_destinations (
                    order_index,
                    destinations (name, slug)
                ),
                itinerary_days (
                    *,
                    itinerary_activities (*)
                )
            `)
            .eq('id', itinerary.id)
            .single();

        if (fetchError) throw fetchError;
        
        console.log('✅ Complete itinerary fetched:');
        console.log('   Title:', completeItinerary.title);
        console.log('   Destinations:', completeItinerary.itinerary_destinations.map(d => d.destinations.name).join(', '));
        console.log('   Days:', completeItinerary.itinerary_days.length);
        console.log('   Total Activities:', completeItinerary.itinerary_days.reduce((sum, day) => sum + day.itinerary_activities.length, 0));

        // Test 5: Update itinerary
        console.log('5. Updating itinerary...');
        
        const { error: updateError } = await supabase
            .from('itineraries')
            .update({
                title: 'Updated Test Bali Adventure',
                description: 'Updated description',
                updated_at: new Date().toISOString()
            })
            .eq('id', itinerary.id);

        if (updateError) throw updateError;
        console.log('✅ Itinerary updated successfully');

        // Test 6: Clean up - Delete the test itinerary
        console.log('6. Cleaning up test data...');
        
        // Delete in correct order
        const { data: dayIds } = await supabase
            .from('itinerary_days')
            .select('id')
            .eq('itinerary_id', itinerary.id);

        if (dayIds && dayIds.length > 0) {
            await supabase
                .from('itinerary_activities')
                .delete()
                .in('itinerary_day_id', dayIds.map(d => d.id));
        }

        await supabase
            .from('itinerary_days')
            .delete()
            .eq('itinerary_id', itinerary.id);

        await supabase
            .from('itinerary_destinations')
            .delete()
            .eq('itinerary_id', itinerary.id);

        await supabase
            .from('itineraries')
            .delete()
            .eq('id', itinerary.id);

        console.log('✅ Test data cleaned up');

        console.log('\n🎉 All tests passed! The itinerary system is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error details:', error);
    }
}

// Run the test
if (require.main === module) {
    console.log('To run this test, please:');
    console.log('1. Update the supabaseUrl and supabaseKey variables');
    console.log('2. Make sure you have some destinations in your database');
    console.log('3. Run: node test-itineraries-supabase.js');
    console.log('\nNote: This test will create and delete test data in your database');
}

module.exports = { testItinerariesWithRelations };
