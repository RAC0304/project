const { getDestinationReviews, getDestinationRating } = require('../src/services/reviewService');
const { getDestinations } = require('../src/services/destinationService');

async function testReviewService() {
  console.log('Testing Review Service...\n');

  try {
    // First, get a destination to test with
    console.log('Getting a sample destination...');
    const destinations = await getDestinations({ limit: 1 });
    
    if (destinations.destinations.length === 0) {
      console.log('❌ No destinations found. Please run setup-destinations-data.js first');
      return;
    }

    const destination = destinations.destinations[0];
    console.log(`Using destination: ${destination.name} (ID: ${destination.id})\n`);

    // Test 1: Get destination reviews
    console.log('1. Testing getDestinationReviews()...');
    const reviews = await getDestinationReviews(destination.id);
    console.log(`✅ Found ${reviews.length} reviews for ${destination.name}`);
    
    if (reviews.length > 0) {
      const firstReview = reviews[0];
      console.log(`First review by: ${firstReview.userName}`);
      console.log(`Rating: ${firstReview.rating}/5`);
      console.log(`Content: ${firstReview.content.substring(0, 100)}...`);
      console.log(`Helpful count: ${firstReview.helpfulCount}`);
      if (firstReview.tourGuide) {
        console.log(`Tour Guide: ${firstReview.tourGuide.name}`);
      }
    }
    console.log('');

    // Test 2: Get destination rating
    console.log('2. Testing getDestinationRating()...');
    const rating = await getDestinationRating(destination.id);
    console.log(`✅ Average rating: ${rating.averageRating}/5`);
    console.log(`Total reviews: ${rating.totalReviews}`);
    console.log('');

    // Test 3: Test with non-existent destination
    console.log('3. Testing with non-existent destination...');
    const emptyReviews = await getDestinationReviews('999999');
    const emptyRating = await getDestinationRating('999999');
    console.log(`✅ Non-existent destination reviews: ${emptyReviews.length}`);
    console.log(`✅ Non-existent destination rating: ${emptyRating.averageRating}/5 (${emptyRating.totalReviews} reviews)`);
    console.log('');

    // Test 4: Test all destinations for ratings
    console.log('4. Testing ratings for all destinations...');
    const allDestinations = await getDestinations();
    console.log('Destination ratings:');
    
    for (const dest of allDestinations.destinations.slice(0, 5)) { // Test first 5
      const destRating = await getDestinationRating(dest.id);
      console.log(`- ${dest.name}: ${destRating.averageRating}/5 (${destRating.totalReviews} reviews)`);
    }
    console.log('');

    console.log('🎉 All review service tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
testReviewService().catch(console.error);
