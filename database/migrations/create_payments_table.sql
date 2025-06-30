-- Migration to create payments table
-- Run this in Supabase SQL Editor

-- Create payment_method enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer', 'e_wallet');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id bigserial PRIMARY KEY,
  booking_id bigint NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_method payment_method NOT NULL,
  transaction_id varchar NOT NULL UNIQUE,
  status payment_status_enum NOT NULL DEFAULT 'pending',
  gateway_response jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own payment records
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()::bigint
    )
  );

-- Users can insert payment records for their own bookings
CREATE POLICY "Users can create payments for own bookings" ON public.payments
  FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()::bigint
    )
  );

-- Comment
COMMENT ON TABLE public.payments IS 'Payment records for tour bookings';
COMMENT ON COLUMN public.payments.booking_id IS 'Reference to the booking being paid for';
COMMENT ON COLUMN public.payments.amount IS 'Payment amount in IDR';
COMMENT ON COLUMN public.payments.payment_method IS 'Method used for payment';
COMMENT ON COLUMN public.payments.transaction_id IS 'Unique transaction identifier from payment gateway';
COMMENT ON COLUMN public.payments.status IS 'Current status of the payment';
COMMENT ON COLUMN public.payments.gateway_response IS 'JSON response from payment gateway';
