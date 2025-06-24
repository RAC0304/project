# Booking System Implementation - Complete Guide

## 📋 Overview

Sistem booking telah diintegrasikan dengan Supabase untuk menangani reservasi tour dengan tour guide. Sistem ini mencakup:

- **BookingModal**: Interface untuk membuat booking baru
- **BookingService**: Service layer untuk komunikasi dengan Supabase
- **Database Migration**: Schema dan policies untuk table bookings

## 🗄️ Database Schema

### Table: `bookings`

```sql
CREATE TABLE public.bookings (
  id bigint PRIMARY KEY,
  tour_id bigint NOT NULL REFERENCES tours(id),
  user_id bigint NOT NULL REFERENCES users(id),
  date date NOT NULL,
  participants integer NOT NULL,
  status booking_status DEFAULT 'pending',
  special_requests text,
  total_amount numeric NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  customer_name character varying,
  customer_email character varying,
  customer_phone character varying,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

### Enums

```sql
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
```

## 🔧 Installation & Setup

### 1. Run Database Migration

```bash
# Run the booking migration
node scripts/setup-booking-migration.js

# Or manually run the SQL in Supabase SQL Editor
# File: database/booking_migration.sql
```

### 2. Test the System

```bash
# Test booking service functionality
node scripts/test-booking-service.js
```

## 🎯 Usage

### BookingModal Component

Komponen modal sudah terintegrasi di `TourGuideProfile.tsx`:

```tsx
import BookingModal from "../components/tour-guides/BookingModal";

// Usage in component
{
  isBookingModalOpen && (
    <BookingModal
      guide={mappedGuide}
      onClose={() => setIsBookingModalOpen(false)}
    />
  );
}
```

### BookingService Functions

```typescript
import {
  createBooking,
  getBookingsByUserId,
  getCurrentUser,
} from "./services/bookingService";

// Create new booking
const bookingData = {
  tourId: 1,
  date: "2025-07-01",
  participants: 2,
  specialRequests: "Vegetarian meals please",
  totalAmount: 150.0,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+1234567890",
};

const booking = await createBooking(bookingData);

// Get user's bookings
const userBookings = await getBookingsByUserId(userId);

// Get current user
const currentUser = await getCurrentUser();
```

## ✨ Features

### 1. **Auto-populate User Data**

- Mengisi otomatis nama, email, dan phone dari profile user yang login
- Data disimpan kembali ke profile user saat booking

### 2. **Real-time Price Calculation**

- Menampilkan total harga berdasarkan jumlah peserta
- Format mata uang yang sesuai

### 3. **Validation & Error Handling**

- Validasi form lengkap (required fields, date, participants)
- Error handling untuk gagal booking
- Success confirmation dengan auto-close

### 4. **Security**

- Row Level Security (RLS) policies
- User hanya bisa melihat booking mereka sendiri
- Tour guide bisa melihat booking untuk tour mereka

### 5. **Tour Guide Dashboard**

- Function `get_tour_guide_bookings()` untuk dashboard tour guide
- Informasi lengkap customer dan status booking

## 🔒 Security Policies

### User Policies

```sql
-- Users can read their own bookings
"Users can read own bookings" ON bookings FOR SELECT
USING (auth.uid()::text = user_id::text)

-- Users can create their own bookings
"Users can create own bookings" ON bookings FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text)
```

### Tour Guide Policies

```sql
-- Tour guides can read bookings for their tours
"Tour guides can read their bookings" ON bookings FOR SELECT
USING (EXISTS (SELECT 1 FROM tours t JOIN tour_guides tg ON t.tour_guide_id = tg.id
               WHERE t.id = bookings.tour_id AND tg.user_id::text = auth.uid()::text))
```

## 📱 API Endpoints

### Create Booking

```typescript
POST /api/bookings
{
  "tourId": 1,
  "date": "2025-07-01",
  "participants": 2,
  "specialRequests": "...",
  "totalAmount": 150.00,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890"
}
```

### Get User Bookings

```typescript
GET /api/bookings/user/:userId
```

### Update Booking Status (Tour Guide)

```typescript
PATCH /api/bookings/:id/status
{
  "status": "confirmed"
}
```

## 🧪 Testing

### Manual Testing Steps

1. **Login as a user**
2. **Navigate to tour guide profile**
3. **Click "Book Now" button**
4. **Fill booking form and submit**
5. **Verify booking created in database**
6. **Test error scenarios (invalid data, network errors)**

### Automated Testing

```bash
# Run all booking tests
node scripts/test-booking-service.js

# Test specific functionality
npm test -- booking
```

## 🐛 Troubleshooting

### Common Issues

1. **"User not authenticated"**

   - Solution: Pastikan user sudah login sebelum booking

2. **"Tour not found"**

   - Solution: Pastikan tour ID valid dan tour aktif

3. **"Database connection failed"**

   - Solution: Check Supabase credentials di .env

4. **"Permission denied"**
   - Solution: Run migration untuk setup RLS policies

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem("debug", "booking:*");
```

## 🚀 Next Steps

1. **Payment Integration**

   - Integrate with Stripe/PayPal
   - Handle payment status updates

2. **Email Notifications**

   - Booking confirmation emails
   - Reminder emails before tour date

3. **Calendar Integration**

   - Tour guide availability calendar
   - Customer booking calendar

4. **Admin Dashboard**
   - Admin can view all bookings
   - Manage booking statuses
   - Generate reports

## 📄 Files Modified/Created

### New Files

- `src/services/bookingService.ts` - Service layer
- `database/booking_migration.sql` - Database migration
- `scripts/setup-booking-migration.js` - Migration runner
- `scripts/test-booking-service.js` - Test suite

### Modified Files

- `src/components/tour-guides/BookingModal.tsx` - Added Supabase integration
- `src/pages/TourGuideProfile.tsx` - Authentication check

## 🎉 Success!

Sistem booking sudah siap digunakan! User dapat membuat booking tour dengan tour guide melalui interface yang user-friendly dan data tersimpan dengan aman di Supabase.
