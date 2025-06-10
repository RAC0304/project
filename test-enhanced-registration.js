import { enhancedAuthService } from '../src/services/enhancedAuthService.js';

// Test data
const testUser = {
  email: 'test@wanderwise.com',
  password: 'SecurePass123!',
  username: 'testwanderer',
  firstName: 'Test',
  lastName: 'User',
  role: 'Traveler',
  phone: '+62 812 3456 7890'
};

const testTourGuide = {
  email: 'guide@wanderwise.com',
  password: 'GuidePass123!',
  username: 'testguide',
  firstName: 'Tour',
  lastName: 'Guide',
  role: 'Tour Guide',
  phone: '+62 813 7654 3210'
};

async function testRegistration() {
  console.log('🧪 Testing Enhanced Registration System\n');

  // Test 1: Check availability
  console.log('1. Testing availability check...');
  try {
    const availability = await enhancedAuthService.checkAvailability(
      testUser.email,
      testUser.username
    );
    console.log('✅ Availability check:', availability);
  } catch (error) {
    console.error('❌ Availability check failed:', error);
  }

  // Test 2: Register a regular user
  console.log('\n2. Testing user registration...');
  try {
    const userResult = await enhancedAuthService.register(
      testUser.email,
      testUser.password,
      testUser.username,
      testUser.firstName,
      testUser.lastName,
      testUser.role,
      testUser.phone
    );
    
    if (userResult.success) {
      console.log('✅ User registration successful:', userResult.user);
    } else {
      console.log('❌ User registration failed:', userResult.error);
      if (userResult.errors) {
        console.log('Validation errors:', userResult.errors);
      }
    }
  } catch (error) {
    console.error('❌ User registration error:', error);
  }

  // Test 3: Register a tour guide
  console.log('\n3. Testing tour guide registration...');
  try {
    const guideResult = await enhancedAuthService.register(
      testTourGuide.email,
      testTourGuide.password,
      testTourGuide.username,
      testTourGuide.firstName,
      testTourGuide.lastName,
      testTourGuide.role,
      testTourGuide.phone
    );
    
    if (guideResult.success) {
      console.log('✅ Tour guide registration successful:', guideResult.user);
    } else {
      console.log('❌ Tour guide registration failed:', guideResult.error);
      if (guideResult.errors) {
        console.log('Validation errors:', guideResult.errors);
      }
    }
  } catch (error) {
    console.error('❌ Tour guide registration error:', error);
  }

  // Test 4: Try to register duplicate user
  console.log('\n4. Testing duplicate user prevention...');
  try {
    const duplicateResult = await enhancedAuthService.register(
      testUser.email, // Same email as before
      'DifferentPass123!',
      'differentusername',
      'Different',
      'User',
      'Traveler'
    );
    
    if (!duplicateResult.success) {
      console.log('✅ Duplicate prevention working:', duplicateResult.error);
    } else {
      console.log('❌ Duplicate prevention failed - user was created');
    }
  } catch (error) {
    console.error('❌ Duplicate test error:', error);
  }

  // Test 5: Test validation errors
  console.log('\n5. Testing validation errors...');
  try {
    const invalidResult = await enhancedAuthService.register(
      'invalid-email', // Invalid email
      '123', // Weak password
      'ab', // Short username
      '', // Empty first name
      '', // Empty last name
      'Traveler'
    );
    
    if (!invalidResult.success && invalidResult.errors) {
      console.log('✅ Validation working, errors caught:', invalidResult.errors);
    } else {
      console.log('❌ Validation failed - invalid data was accepted');
    }
  } catch (error) {
    console.error('❌ Validation test error:', error);
  }

  console.log('\n🏁 Registration tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRegistration().catch(console.error);
}

export { testRegistration };
