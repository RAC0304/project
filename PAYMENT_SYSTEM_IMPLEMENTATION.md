# Payment System Implementation

## Overview
This document describes the payment functionality that has been implemented to allow customers to pay for confirmed bookings.

## Implementation Details

### 1. Payment Service (`src/services/paymentService.ts`)
- **Purpose**: Handle payment processing for confirmed bookings
- **Key Features**:
  - Process payments for confirmed bookings
  - Support multiple payment methods (Credit Card, Bank Transfer, E-Wallet)
  - Update booking payment status in database
  - Create payment records
  - Get payment history for users

### 2. Payment Modal Component (`src/components/PaymentModal.tsx`)
- **Purpose**: UI component for payment processing
- **Features**:
  - Booking summary display
  - Payment method selection
  - Payment processing with loading states
  - Success/error feedback
  - Currency formatting (IDR)

### 3. Updated User Activity Service (`src/services/userActivityService.ts`)
- **Changes**:
  - Added `paymentStatus` field to booking activity details
  - Enhanced booking details with tour title and location
  - Support for payment status tracking in activity feed

### 4. Updated User Profile Page (`src/pages/UserProfilePage.tsx`)
- **New Features**:
  - "Pay Now" button for confirmed bookings with pending payment
  - Payment modal integration
  - Payment success handling with activity refresh
  - Payment functionality in both recent activities and all activities modal

### 5. Updated All Activities Modal (`src/components/AllActivitiesModal.tsx`)
- **Enhancement**:
  - Added "Pay Now" button support
  - Payment status display
  - Consistent payment functionality across all activities

### 6. Database Migration (`database/migrations/create_payments_table.sql`)
- **New Table**: `payments`
- **Features**:
  - Payment records with transaction tracking
  - Multiple payment methods support
  - Payment status tracking
  - Row Level Security (RLS) policies
  - Foreign key relationship with bookings table

## Payment Flow

### 1. Booking Confirmation
1. Tour guide confirms a booking → status changes to "confirmed"
2. Booking appears in customer's activity feed with "confirmed" status
3. If payment status is "pending", "Pay Now" button appears

### 2. Payment Process
1. Customer clicks "Pay Now" button
2. Payment modal opens with:
   - Booking summary (tour name, participants, amount)
   - Payment method selection
   - Customer details (auto-filled from profile)
3. Customer selects payment method and clicks "Pay"
4. Payment is processed (simulated for now)
5. Payment status updates to "paid"
6. Activity feed refreshes to show updated status

### 3. Payment Methods Supported
- **Credit Card**: Visa, Mastercard, American Express
- **Bank Transfer**: Direct bank account transfer
- **E-Wallet**: GoPay, OVO, Dana, LinkAja

## Database Schema

### Payments Table
```sql
CREATE TABLE public.payments (
  id bigserial PRIMARY KEY,
  booking_id bigint NOT NULL REFERENCES public.bookings(id),
  amount numeric NOT NULL,
  payment_method payment_method NOT NULL,
  transaction_id varchar NOT NULL UNIQUE,
  status payment_status_enum NOT NULL DEFAULT 'pending',
  gateway_response jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
```

### Required Enums
- `payment_method`: 'credit_card', 'bank_transfer', 'e_wallet'
- `payment_status_enum`: 'pending', 'processing', 'completed', 'failed', 'refunded'

## Setup Instructions

### 1. Database Setup
Run the migration SQL file in Supabase SQL Editor:
```bash
database/migrations/create_payments_table.sql
```

### 2. Environment Requirements
- Supabase project with proper RLS policies
- Booking system already implemented
- User authentication system in place

### 3. Testing the Payment Flow
1. Create a booking as a customer
2. Log in as tour guide and confirm the booking
3. Log back in as customer
4. Go to Profile page → Recent Activity
5. Look for confirmed booking with "Pay Now" button
6. Click "Pay Now" and complete payment flow
7. Verify payment status updates in activity feed

## Key Features

### Security
- Row Level Security (RLS) policies ensure users can only access their own payment records
- Payment data validation and error handling
- Secure transaction ID generation

### User Experience
- Responsive payment modal design
- Real-time loading states and feedback
- Automatic activity refresh after successful payment
- Consistent currency formatting (IDR)
- Clear payment status indicators

### Integration
- Seamless integration with existing booking system
- Automatic payment status updates
- Activity feed integration
- User profile integration

## Future Enhancements
- Real payment gateway integration (Midtrans, Xendit, etc.)
- Payment receipts generation
- Refund processing
- Payment reminders/notifications
- Multi-currency support
- Payment method preferences

## Error Handling
- Network error handling
- Payment failure scenarios
- Invalid booking validation
- User feedback for all error states
- Graceful fallback to default states
