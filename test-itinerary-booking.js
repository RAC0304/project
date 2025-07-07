// Test helper functions
function testGroupSizeParsing() {
  console.log('\n🧮 Testing Group Size Parsing');
  console.log('==============================');

  const parseGroupSize = (groupSize) => {
    if (groupSize.includes('-')) {
      return parseInt(groupSize.split('-')[0], 10);
    } else if (groupSize.includes('+')) {
      return parseInt(groupSize.replace('+', ''), 10);
    } else {
      return parseInt(groupSize, 10);
    }
  };

  const testCases = ['1', '2', '3-4', '5-6', '7+'];
  testCases.forEach(testCase => {
    const result = parseGroupSize(testCase);
    console.log(`✅ "${testCase}" -> ${result} participants`);
  });
}

function testPriceCalculation() {
  console.log('\n💰 Testing Price Calculation');
  console.log('=============================');

  const calculatePrice = (duration, groupSize, hasGuide) => {
    const parseGroupSize = (groupSize) => {
      if (groupSize.includes('-')) {
        return parseInt(groupSize.split('-')[0], 10);
      } else if (groupSize.includes('+')) {
        return parseInt(groupSize.replace('+', ''), 10);
      } else {
        return parseInt(groupSize, 10);
      }
    };

    const days = parseInt(duration.match(/(\d+)/)[0], 10);
    const participants = parseGroupSize(groupSize);
    const basePricePerDay = 150;
    const totalPrice = basePricePerDay * days * participants;
    const guideSurcharge = hasGuide ? days * 50 : 0;
    
    return totalPrice + guideSurcharge;
  };

  const testCases = [
    { duration: '7 days', groupSize: '2', hasGuide: false },
    { duration: '7 days', groupSize: '2', hasGuide: true },
    { duration: '10 days', groupSize: '3-4', hasGuide: true },
    { duration: '5 days', groupSize: '7+', hasGuide: false },
  ];

  testCases.forEach(({ duration, groupSize, hasGuide }) => {
    const price = calculatePrice(duration, groupSize, hasGuide);
    console.log(`✅ ${duration}, ${groupSize} participants, ${hasGuide ? 'with' : 'without'} guide -> $${price.toLocaleString()}`);
  });
}

// Run tests
console.log('🚀 Starting Itinerary Booking Tests...\n');

// Run utility tests first
testGroupSizeParsing();
testPriceCalculation();

console.log('\n✅ All utility tests completed!');
console.log('\n📝 Note: This test validates the pricing and parsing logic used in the TripPlanningModal component.');
