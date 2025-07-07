// Test file for itinerary services
// This file demonstrates how to use the itinerary services and provides test scenarios

import {
    getAllItineraries,
    getItineraryBySlug,
    searchItineraries
} from '../services/itineraryService';

import {
    createItineraryBooking,
    createItineraryRequest,
    getUserItineraryBookings
} from '../services/itineraryBookingService';

import {
    createItineraryReview,
    getItineraryReviews,
    getItineraryReviewStats
} from '../services/itineraryReviewService';

import {
    getItineraryStats,
    getPopularItineraries
} from '../services/itineraryStatsService';

// Test scenarios for development and debugging

export const testItineraryServices = async () => {
    console.log('=== Testing Itinerary Services ===');

    try {
        // Test 1: Get all itineraries
        console.log('\n1. Testing getAllItineraries...');
        const allItineraries = await getAllItineraries();
        console.log(`Found ${allItineraries.length} itineraries`);
        if (allItineraries.length > 0) {
            console.log('First itinerary:', {
                id: allItineraries[0].id,
                title: allItineraries[0].title,
                slug: allItineraries[0].slug
            });
        }

        // Test 2: Get itinerary by slug
        if (allItineraries.length > 0) {
            console.log('\n2. Testing getItineraryBySlug...');
            const firstSlug = allItineraries[0].slug;
            if (firstSlug) {
                const itinerary = await getItineraryBySlug(firstSlug);
                if (itinerary) {
                    console.log(`Successfully retrieved itinerary: ${itinerary.title}`);
                    console.log(`Days in itinerary: ${itinerary.days.length}`);
                    console.log(`Destinations: ${itinerary.destinations.length}`);
                } else {
                    console.log('Itinerary not found');
                }
            }
        }

        // Test 3: Search itineraries
        console.log('\n3. Testing searchItineraries...');
        const searchResults = await searchItineraries('bali', {
            category: 'cultural',
            difficulty: 'easy'
        });
        console.log(`Search results: ${searchResults.length} itineraries found`);

        // Test 4: Get statistics
        console.log('\n4. Testing getItineraryStats...');
        const stats = await getItineraryStats();
        console.log('Statistics:', {
            total: stats.total_itineraries,
            published: stats.published_itineraries,
            bookings: stats.total_bookings,
            avgRating: stats.average_rating
        });

        // Test 5: Get popular itineraries
        console.log('\n5. Testing getPopularItineraries...');
        const popular = await getPopularItineraries(5);
        console.log(`Found ${popular.length} popular itineraries`);

        console.log('\n=== All tests completed successfully ===');

    } catch (error) {
        console.error('Test failed:', error);
    }
};

// Test booking functionality
export const testBookingServices = async (userId: string, itineraryId: string) => {
    console.log('=== Testing Booking Services ===');

    try {
        // Test 1: Create booking
        console.log('\n1. Testing createItineraryBooking...');
        const bookingData = {
            itinerary_id: itineraryId,
            user_id: userId,
            participants: 2,
            start_date: '2024-08-15',
            end_date: '2024-08-20',
            contact_email: 'test@example.com',
            contact_phone: '+1234567890',
            special_requests: 'Vegetarian meals preferred'
        };

        const booking = await createItineraryBooking(bookingData);
        console.log('Booking created with ID:', booking.id);

        // Test 2: Create request
        console.log('\n2. Testing createItineraryRequest...');
        const requestData = {
            user_id: userId,
            itinerary_id: itineraryId,
            name: 'Test User',
            email: 'test@example.com',
            start_date: '2024-09-01',
            end_date: '2024-09-07',
            group_size: '2-4 people',
            additional_requests: 'Looking for budget-friendly options'
        };

        const request = await createItineraryRequest(requestData);
        console.log('Request created with ID:', request.id);

        // Test 3: Get user bookings
        console.log('\n3. Testing getUserItineraryBookings...');
        const userBookings = await getUserItineraryBookings(userId);
        console.log(`User has ${userBookings.length} bookings`);

        console.log('\n=== Booking tests completed ===');

    } catch (error) {
        console.error('Booking test failed:', error);
    }
};

// Test review functionality
export const testReviewServices = async (userId: string, itineraryId: string) => {
    console.log('=== Testing Review Services ===');

    try {
        // Test 1: Create review
        console.log('\n1. Testing createItineraryReview...');
        const reviewData = {
            itinerary_id: itineraryId,
            user_id: userId,
            rating: 5,
            comment: 'Amazing experience! Highly recommend this itinerary.'
        };

        const review = await createItineraryReview(reviewData);
        console.log('Review created with ID:', review.id);

        // Test 2: Get reviews for itinerary
        console.log('\n2. Testing getItineraryReviews...');
        const { reviews, total } = await getItineraryReviews(itineraryId, 1, 10);
        console.log(`Found ${total} reviews for this itinerary`);
        console.log(`Retrieved ${reviews.length} reviews on this page`);

        // Test 3: Get review statistics
        console.log('\n3. Testing getItineraryReviewStats...');
        const reviewStats = await getItineraryReviewStats(itineraryId);
        console.log('Review statistics:', {
            averageRating: reviewStats.average_rating,
            totalReviews: reviewStats.total_reviews,
            ratingDistribution: reviewStats.rating_distribution
        });

        console.log('\n=== Review tests completed ===');

    } catch (error) {
        console.error('Review test failed:', error);
    }
};

// Performance test
export const performanceTest = async () => {
    console.log('=== Performance Testing ===');

    try {
        const startTime = Date.now();

        // Concurrent requests
        const promises = [
            getAllItineraries(),
            getItineraryStats(),
            getPopularItineraries(10)
        ];

        await Promise.all(promises);

        const endTime = Date.now();
        console.log(`All concurrent requests completed in ${endTime - startTime}ms`);

    } catch (error) {
        console.error('Performance test failed:', error);
    }
};

// Error handling test
export const errorHandlingTest = async () => {
    console.log('=== Error Handling Testing ===');

    try {
        // Test with invalid slug
        console.log('\n1. Testing with invalid slug...');
        const invalidItinerary = await getItineraryBySlug('non-existent-slug');
        console.log('Invalid slug result:', invalidItinerary); // Should be null

        // Test with invalid search
        console.log('\n2. Testing search with no results...');
        const noResults = await searchItineraries('zzzzzzinvalidzzzzz');
        console.log(`Search with invalid term returned ${noResults.length} results`);

        console.log('\n=== Error handling tests completed ===');

    } catch (error) {
        console.error('Error handling test failed:', error);
    }
};

// Usage example in a React component
export const ExampleUsageInComponent = `
import React, { useState, useEffect } from 'react';
import { getAllItineraries, getItineraryBySlug } from '../services/itineraryService';
import { createItineraryBooking } from '../services/itineraryBookingService';
import { Itinerary } from '../types';

const ExampleComponent: React.FC = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItineraries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllItineraries();
        setItineraries(data);
      } catch (err) {
        console.error('Error loading itineraries:', err);
        setError(err instanceof Error ? err.message : 'Failed to load itineraries');
      } finally {
        setLoading(false);
      }
    };

    loadItineraries();
  }, []);

  const handleBooking = async (itineraryId: string) => {
    try {
      const booking = await createItineraryBooking({
        itinerary_id: itineraryId,
        user_id: 'current-user-id',
        participants: 2,
        start_date: '2024-08-15',
        end_date: '2024-08-20',
        contact_email: 'user@example.com',
        contact_phone: '+1234567890'
      });
      console.log('Booking created:', booking);
      // Handle success (show notification, redirect, etc.)
    } catch (error) {
      console.error('Booking failed:', error);
      // Handle error (show error message)
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {itineraries.map(itinerary => (
        <div key={itinerary.id}>
          <h2>{itinerary.title}</h2>
          <p>{itinerary.description}</p>
          <button onClick={() => handleBooking(itinerary.id)}>
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
};
`;

// Run all tests
export const runAllTests = async () => {
    console.log('🚀 Starting comprehensive itinerary service tests...\n');

    await testItineraryServices();
    await performanceTest();
    await errorHandlingTest();

    console.log('\n✅ All tests completed!');
    console.log('\nTo test booking and review services, call:');
    console.log('testBookingServices(userId, itineraryId)');
    console.log('testReviewServices(userId, itineraryId)');
};

// Export for use in development
export default {
    testItineraryServices,
    testBookingServices,
    testReviewServices,
    performanceTest,
    errorHandlingTest,
    runAllTests
};
