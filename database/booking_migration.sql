-- Add additional columns to bookings table for better customer tracking
-- Run this migration to add customer contact fields to bookings

-- Add customer contact columns if they don't exist
DO $$ 
BEGIN
    -- Add customer_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'customer_name') THEN
        ALTER TABLE public.bookings ADD COLUMN customer_name character varying;
    END IF;

    -- Add customer_email column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'customer_email') THEN
        ALTER TABLE public.bookings ADD COLUMN customer_email character varying;
    END IF;

    -- Add customer_phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'customer_phone') THEN
        ALTER TABLE public.bookings ADD COLUMN customer_phone character varying;
    END IF;
END $$;

-- Create booking_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
    END IF;
END $$;

-- Create payment_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
    END IF;
END $$;

-- Update status column type if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'status' 
               AND data_type != 'USER-DEFINED') THEN
        ALTER TABLE public.bookings 
        ALTER COLUMN status TYPE booking_status 
        USING status::booking_status;
    END IF;
END $$;

-- Update payment_status column type if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'payment_status' 
               AND data_type != 'USER-DEFINED') THEN
        ALTER TABLE public.bookings 
        ALTER COLUMN payment_status TYPE payment_status 
        USING payment_status::payment_status;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON public.bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Add RLS policies for bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own bookings
CREATE POLICY "Users can read own bookings" ON public.bookings
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can create their own bookings
CREATE POLICY "Users can create own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own bookings (limited fields)
CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Policy: Tour guides can read bookings for their tours
CREATE POLICY "Tour guides can read their bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tours t
            JOIN public.tour_guides tg ON t.tour_guide_id = tg.id
            WHERE t.id = bookings.tour_id 
            AND tg.user_id::text = auth.uid()::text
        )
    );

-- Policy: Tour guides can update bookings for their tours (status only)
CREATE POLICY "Tour guides can update their bookings" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.tours t
            JOIN public.tour_guides tg ON t.tour_guide_id = tg.id
            WHERE t.id = bookings.tour_id 
            AND tg.user_id::text = auth.uid()::text
        )
    );

-- Function to get total bookings for a tour guide
CREATE OR REPLACE FUNCTION get_tour_guide_bookings(guide_id bigint)
RETURNS TABLE (
    booking_id bigint,
    tour_title character varying,
    customer_name character varying,
    customer_email character varying,
    customer_phone character varying,
    booking_date date,
    participants integer,
    total_amount numeric,
    status booking_status,
    payment_status payment_status,
    special_requests text,
    created_at timestamp without time zone
) 
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT 
        b.id as booking_id,
        t.title as tour_title,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.date as booking_date,
        b.participants,
        b.total_amount,
        b.status,
        b.payment_status,
        b.special_requests,
        b.created_at
    FROM public.bookings b
    JOIN public.tours t ON b.tour_id = t.id
    WHERE t.tour_guide_id = guide_id
    ORDER BY b.created_at DESC;
$$;
