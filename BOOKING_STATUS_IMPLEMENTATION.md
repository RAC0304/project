# Booking Status System Implementation

## Overview

Sistem booking status yang telah diimplementasikan untuk mengelola tahap 3-6 dari proses customer booking:

1. **Tahap 3**: Menunggu Tour (Upcoming Tours)
2. **Tahap 4**: Tour Berlangsung (Today's Tours)
3. **Tahap 5**: Tour Selesai (Completed Tours)
4. **Tahap 6**: Eligible untuk Review

## Files Created/Modified

### 1. Services

- `src/services/bookingStatusService.ts` - Main service untuk booking status management
- `src/services/reviewService.ts` - Extended dengan booking review functionality

### 2. Components

- `src/components/customer/BookingStatusTabs.tsx` - Tab interface untuk customer
- `src/components/customer/ReviewModal.tsx` - Modal untuk menulis review

### 3. Hooks

- `src/hooks/useBookingStatus.ts` - React hook untuk real-time booking status

### 4. Database

- `database/booking_status_functions.sql` - SQL functions dan triggers
- `scripts/setup-booking-status-functions.js` - Setup script untuk database
- `scripts/test-booking-status-service.js` - Test script

### 5. Pages

- `src/pages/UserProfilePage.tsx` - Added BookingStatusTabs untuk customers

## Database Functions

### 1. `update_booking_status()`

```sql
-- Otomatis update booking status ke 'completed' untuk tanggal yang sudah lewat
```

### 2. `can_user_review(p_user_id, p_booking_id)`

```sql
-- Validasi apakah user bisa memberikan review untuk booking tertentu
-- Returns: boolean
```

### 3. `update_tour_guide_rating()`

```sql
-- Trigger function untuk update rating tour guide setelah review baru
```

### 4. `get_customer_booking_stats(p_user_id)`

```sql
-- Get statistik booking untuk customer (upcoming, today, completed, review needed)
```

## API Functions

### BookingStatusService

#### `getUpcomingTours(userId)`

- Ambil tour yang akan datang (confirmed & paid, date >= today)

#### `getTodayTours(userId)`

- Ambil tour hari ini (confirmed & paid, date = today)

#### `getCompletedTours(userId)`

- Ambil tour yang sudah selesai (completed & paid)

#### `getEligibleForReview(userId)`

- Ambil booking yang bisa di-review (completed & paid & belum ada review)

#### `canReview(userId, bookingId)`

- Cek apakah user bisa review booking tertentu

#### `getCustomerBookingStatus(userId)`

- Ambil semua status booking dalam satu call

### ReviewService

#### `createBookingReview(reviewData)`

- Buat review baru dari booking yang completed
- Validasi eligibility otomatis
- Support tags dan images

#### `getUserBookingReviews(userId)`

- Ambil semua review yang dibuat user dari bookings

## UI Components

### BookingStatusTabs

```tsx
<BookingStatusTabs userId={userId} />
```

**Features:**

- 4 tabs: Upcoming, Today, Completed, Review Needed
- Real-time updates via Supabase subscriptions
- Contact info untuk today's tours
- Write review button untuk eligible bookings

### ReviewModal

```tsx
<ReviewModal
  booking={booking}
  onClose={handleClose}
  onReviewSubmitted={handleSubmit}
/>
```

**Features:**

- 5-star rating system
- Title dan content fields
- Tags (predefined + custom)
- Form validation
- Loading states

## Setup Instructions

### 1. Database Setup

```bash
# Jalankan setup script
node scripts/setup-booking-status-functions.js

# Atau manual di Supabase SQL Editor:
# Copy-paste isi dari database/booking_status_functions.sql
```

### 2. Test Implementation

```bash
# Test semua functionality
node scripts/test-booking-status-service.js
```

### 3. Cron Job (Optional)

```sql
-- Setup auto-update booking status setiap hari jam 00:01
SELECT cron.schedule(
  'update-booking-status',
  '1 0 * * *',
  'SELECT update_booking_status();'
);
```

## Usage in React App

### 1. Customer Profile Page

```tsx
// Otomatis muncul di UserProfilePage untuk role = 'customer'
{
  user.role === "customer" && <BookingStatusTabs userId={parseInt(user.id)} />;
}
```

### 2. Real-time Updates

```tsx
// Hook dengan subscription otomatis
const { upcomingTours, todayTours, completedTours, eligibleForReview } =
  useBookingStatus(userId);
```

### 3. Review System

```tsx
// Review hanya bisa dibuat dari booking yang eligible
const canWrite = await BookingStatusService.canReview(userId, bookingId);
if (canWrite) {
  // Show review modal
}
```

## Validation Rules

### Booking Status Update

- Status `confirmed` + `paid` + `date < today` → `completed`

### Review Eligibility

- Booking status = `completed`
- Payment status = `paid`
- User belum pernah review booking tersebut
- User adalah owner dari booking

### Auto Rating Update

- Setiap review baru → trigger update rating tour guide
- Rating = average dari semua reviews
- Review count = total reviews

## Error Handling

### Service Level

- Try-catch untuk semua database calls
- Fallback values untuk empty results
- Error logging untuk debugging

### UI Level

- Loading states untuk async operations
- Error messages untuk failed operations
- Retry buttons untuk network issues

### Database Level

- Transaction safety untuk complex operations
- Proper indexing untuk performance
- Constraint validation

## Performance Optimizations

### Database Indexes

```sql
-- Booking queries
CREATE INDEX idx_bookings_user_status_date
ON bookings(user_id, status, payment_status, date);

-- Review eligibility
CREATE INDEX idx_reviews_user_booking
ON reviews(user_id, booking_id);
```

### React Optimizations

- useCallback untuk stable function references
- Real-time subscriptions hanya untuk current user
- Lazy loading untuk heavy components

## Testing

### 1. Database Functions

```bash
node scripts/test-booking-status-service.js
```

### 2. Component Testing

- Test dengan different booking statuses
- Test review flow end-to-end
- Test real-time updates

### 3. Edge Cases

- Bookings without tour guides
- Reviews without ratings
- Network connectivity issues

## Troubleshooting

### Common Issues

1. **Functions not found**

   - Run database/booking_status_functions.sql manually
   - Check Supabase permissions

2. **Real-time not working**

   - Check Supabase subscriptions
   - Verify RLS policies

3. **Reviews not saving**
   - Check eligibility validation
   - Verify tour_guide_id exists

### Debug Commands

```sql
-- Test booking status update
SELECT update_booking_status();

-- Check review eligibility
SELECT can_user_review(1, 1);

-- Get booking stats
SELECT * FROM get_customer_booking_stats(1);
```

## Next Steps

1. **Cron Job Setup**: Configure automatic booking status updates
2. **Notifications**: Add email/push notifications for booking status changes
3. **Analytics**: Track booking completion rates and review rates
4. **Mobile App**: Extend to mobile with React Native
5. **Admin Dashboard**: Add booking management for tour guides/admins

## Security Considerations

- RLS policies untuk data access
- Validation pada client dan server side
- Sanitasi input untuk reviews
- Rate limiting untuk review submissions
