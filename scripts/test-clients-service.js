/**
 * Test script for clients service
 * Tests fetching clients for a tour guide by user ID
 */

import { clientsService } from '../src/services/clientsService.js';

async function testClientsService() {
  try {
    console.log('=== Testing Clients Service ===');

    // Test with a sample user ID (you can replace this with an actual tour guide user ID)
    const testUserId = '1'; // This should be a valid user ID with role 'tour_guide'
    
    console.log(`\nTesting getClientsByTourGuideUserId with user ID: ${testUserId}`);
    
    const result = await clientsService.getClientsByTourGuideUserId(testUserId, {
      page: 1,
      limit: 10
    });
    
    console.log('\nResults:');
    console.log(`- Total clients: ${result.total}`);
    console.log(`- Current page: ${result.page}`);
    console.log(`- Total pages: ${result.totalPages}`);
    console.log(`- Clients returned: ${result.clients?.length || 0}`);
    
    if (result.clients && result.clients.length > 0) {
      console.log('\nSample clients:');
      result.clients.slice(0, 3).forEach((client, index) => {
        console.log(`${index + 1}. ${client.name} (${client.email}) - ${client.totalBookings} bookings, ${client.status}`);
      });
    }
    
    // Test stats
    console.log(`\nTesting getClientStatsByUserId with user ID: ${testUserId}`);
    const stats = await clientsService.getClientStatsByUserId(testUserId);
    
    console.log('\nStats:');
    console.log(`- Total clients: ${stats.totalClients}`);
    console.log(`- Active clients: ${stats.activeClients}`);
    console.log(`- Total bookings: ${stats.totalBookings}`);
    console.log(`- Average rating: ${stats.averageRating}`);

  } catch (error) {
    console.error('Error testing clients service:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testClientsService();
