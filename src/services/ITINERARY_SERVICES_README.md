# Itinerary Services Documentation

This document provides comprehensive documentation for the itinerary services built for Supabase integration.

## Overview

The itinerary system consists of several interconnected services:

1. **ItineraryService** - Main CRUD operations for itineraries
2. **ItineraryBookingService** - Booking and request management
3. **ItineraryReviewService** - Review and rating system
4. **ItineraryAdminService** - Admin operations for itinerary management
5. **ItineraryTagService** - Tag management and categorization
6. **ItineraryStatsService** - Analytics and statistics

## Database Schema

The system uses the following main tables:

- `itineraries` - Main itinerary information
- `itinerary_days` - Day-by-day breakdown
- `itinerary_activities` - Activities within each day
- `itinerary_destinations` - Destinations linked to itineraries
- `itinerary_images` - Additional images for itineraries
- `itinerary_bookings` - Booking information
- `itinerary_requests` - Custom itinerary requests
- `itinerary_reviews` - Reviews and ratings
- `itinerary_tags` - Tag definitions
- `itinerary_tag_relations` - Many-to-many relationship between itineraries and tags

## Service Usage Examples

### 1. ItineraryService

```typescript
import { getAllItineraries, getItineraryById, getItineraryBySlug } from './itineraryService';

// Get all published itineraries
const itineraries = await getAllItineraries();

// Get specific itinerary by ID
const itinerary = await getItineraryById('123');

// Get itinerary by slug (SEO-friendly URLs)
const itinerary = await getItineraryBySlug('bali-cultural-tour');

// Get featured itineraries
const featured = await getFeaturedItineraries(5);

// Search itineraries
const results = await searchItineraries('bali', {
  category: 'cultural',
  difficulty: 'easy'
});
```

### 2. ItineraryBookingService

```typescript
import { 
  createItineraryBooking, 
  createItineraryRequest,
  getUserItineraryBookings 
} from './itineraryBookingService';

// Create new booking
const booking = await createItineraryBooking({
  itinerary_id: '123',
  user_id: '456',
  participants: 2,
  start_date: '2024-07-15',
  end_date: '2024-07-20',
  contact_email: 'user@example.com',
  contact_phone: '+1234567890'
});

// Create custom itinerary request
const request = await createItineraryRequest({
  user_id: '456',
  itinerary_id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  start_date: '2024-07-15',
  end_date: '2024-07-20',
  group_size: '2-4 people',
  additional_requests: 'Vegetarian meals preferred'
});

// Get user's bookings
const userBookings = await getUserItineraryBookings('456');
```

### 3. ItineraryReviewService

```typescript
import { 
  createItineraryReview,
  getItineraryReviews,
  getItineraryReviewStats 
} from './itineraryReviewService';

// Create new review
const review = await createItineraryReview({
  itinerary_id: '123',
  user_id: '456',
  rating: 5,
  comment: 'Amazing experience! Highly recommended.'
});

// Get reviews for an itinerary
const { reviews, total } = await getItineraryReviews('123', 1, 10);

// Get review statistics
const stats = await getItineraryReviewStats('123');
console.log(stats.average_rating); // 4.5
console.log(stats.total_reviews); // 25
```

### 4. ItineraryAdminService

```typescript
import { 
  createItinerary,
  updateItinerary,
  createItineraryDay,
  createItineraryActivity 
} from './itineraryAdminService';

// Create new itinerary
const itineraryId = await createItinerary({
  slug: 'new-bali-tour',
  title: 'New Bali Cultural Tour',
  duration: '5 days',
  description: 'Experience the rich culture of Bali',
  image_url: 'https://example.com/image.jpg',
  difficulty: 'easy',
  best_season: 'April - October',
  estimated_budget: '$500 - $800',
  created_by: 'admin-user-id'
});

// Add day to itinerary
const dayId = await createItineraryDay({
  itinerary_id: itineraryId,
  day_number: 1,
  title: 'Arrival in Ubud',
  description: 'Arrive and explore Ubud town',
  accommodation: 'Ubud Resort',
  meals: 'Dinner included',
  transportation: 'Airport transfer'
});

// Add activity to day
await createItineraryActivity({
  itinerary_day_id: dayId,
  time_start: '09:00',
  title: 'Temple Visit',
  description: 'Visit traditional Balinese temple',
  location: 'Ubud Temple',
  duration_minutes: 120
});
```

### 5. ItineraryTagService

```typescript
import { 
  getAllTags,
  addTagToItinerary,
  getItineraryTags,
  setItineraryTags 
} from './itineraryTagService';

// Get all available tags
const tags = await getAllTags();

// Add tag to itinerary
await addTagToItinerary('123', 'cultural');

// Get tags for specific itinerary
const itineraryTags = await getItineraryTags('123');

// Set all tags for itinerary (replaces existing)
await setItineraryTags('123', ['cultural', 'temple', 'traditional']);
```

### 6. ItineraryStatsService

```typescript
import { 
  getItineraryStats,
  getPopularItineraries,
  getRevenueStats,
  getCategoryStats 
} from './itineraryStatsService';

// Get general statistics
const stats = await getItineraryStats();
console.log(stats.total_itineraries); // 50
console.log(stats.total_bookings); // 150

// Get popular itineraries
const popular = await getPopularItineraries(10);

// Get revenue statistics
const revenue = await getRevenueStats(5);

// Get category distribution
const categories = await getCategoryStats();
```

## Error Handling

All services include comprehensive error handling:

```typescript
try {
  const itinerary = await getItineraryById('123');
  if (!itinerary) {
    console.log('Itinerary not found');
    return;
  }
  // Use itinerary data
} catch (error) {
  console.error('Error fetching itinerary:', error);
  // Handle error appropriately
}
```

## Integration with React Components

Example of using the services in React components:

```typescript
import React, { useState, useEffect } from 'react';
import { getAllItineraries } from '../services/itineraryService';
import { Itinerary } from '../types';

const ItinerariesPage: React.FC = () => {
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
        setError(err instanceof Error ? err.message : 'Failed to load itineraries');
      } finally {
        setLoading(false);
      }
    };

    loadItineraries();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {itineraries.map(itinerary => (
        <div key={itinerary.id}>
          <h2>{itinerary.title}</h2>
          <p>{itinerary.description}</p>
        </div>
      ))}
    </div>
  );
};
```

## Performance Considerations

1. **Pagination**: Use pagination for large datasets
2. **Caching**: Consider implementing caching for frequently accessed data
3. **Lazy Loading**: Load detailed information only when needed
4. **Batch Operations**: Use batch operations when possible

## Security Notes

1. All services check user permissions where applicable
2. Row Level Security (RLS) policies should be implemented in Supabase
3. Input validation is performed on all data
4. Error messages don't expose sensitive information

## Future Enhancements

1. **View Tracking**: Implement view counting for analytics
2. **Caching Layer**: Add Redis or similar for performance
3. **Real-time Updates**: Use Supabase real-time features
4. **Image Optimization**: Implement image processing and optimization
5. **Search Enhancement**: Add full-text search capabilities
