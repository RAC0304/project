const { getDestinations, getDestinationById, getDestinationCategories } = require('../src/services/destinationService');

async function testDestinationService() {
  console.log('Testing Destination Service...\n');

  try {
    // Test 1: Get all destinations
    console.log('1. Testing getDestinations()...');
    const allDestinations = await getDestinations();
    console.log(`✅ Found ${allDestinations.destinations.length} destinations`);
    console.log(`Total: ${allDestinations.total}, Has more: ${allDestinations.hasMore}`);
    
    if (allDestinations.destinations.length > 0) {
      const first = allDestinations.destinations[0];
      console.log(`First destination: ${first.name} (${first.id})`);
    }
    console.log('');

    // Test 2: Get destinations with search
    console.log('2. Testing getDestinations() with search...');
    const searchResults = await getDestinations({ search: 'Bali' });
    console.log(`✅ Search 'Bali' found ${searchResults.destinations.length} destinations`);
    console.log('');

    // Test 3: Get destinations by category
    console.log('3. Testing getDestinations() with categories...');
    const beachDestinations = await getDestinations({ categories: ['beach'] });
    console.log(`✅ Beach category found ${beachDestinations.destinations.length} destinations`);
    console.log('');

    // Test 4: Get single destination
    console.log('4. Testing getDestinationById()...');
    if (allDestinations.destinations.length > 0) {
      const destinationId = allDestinations.destinations[0].id;
      const singleDestination = await getDestinationById(destinationId);
      
      if (singleDestination) {
        console.log(`✅ Retrieved destination: ${singleDestination.name}`);
        console.log(`- Location: ${singleDestination.location}`);
        console.log(`- Categories: ${singleDestination.category.join(', ')}`);
        console.log(`- Attractions: ${singleDestination.attractions.length}`);
        console.log(`- Activities: ${singleDestination.activities.length}`);
        console.log(`- Travel Tips: ${singleDestination.travelTips.length}`);
      } else {
        console.log('❌ Could not retrieve destination');
      }
    }
    console.log('');

    // Test 5: Get categories
    console.log('5. Testing getDestinationCategories()...');
    const categories = await getDestinationCategories();
    console.log(`✅ Found ${categories.length} categories: ${categories.join(', ')}`);
    console.log('');

    // Test 6: Test non-existent destination
    console.log('6. Testing getDestinationById() with non-existent ID...');
    const nonExistent = await getDestinationById('non-existent-id');
    if (nonExistent === null) {
      console.log('✅ Correctly returned null for non-existent destination');
    } else {
      console.log('❌ Should have returned null for non-existent destination');
    }
    console.log('');

    console.log('🎉 All destination service tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testDestinationService().catch(console.error);
