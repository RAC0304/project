-- Update Request Status Workflow Migration
-- This migration adds new status values and workflow management for itinerary requests

-- First, let's update the request_status enum to include more status options
DO $$ BEGIN
    -- Check if the enum exists and add new values
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        -- Add new status values if they don't exist
        BEGIN
            ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'processing';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'confirmed';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'cancelled';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'completed';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    ELSE
        -- Create the enum if it doesn't exist
        CREATE TYPE request_status AS ENUM (
            'pending', 
            'processing', 
            'confirmed', 
            'approved', 
            'rejected', 
            'cancelled',
            'completed'
        );
    END IF;
END $$;

-- Add new columns to itinerary_requests table for workflow management
ALTER TABLE public.itinerary_requests 
ADD COLUMN IF NOT EXISTS confirmed_at timestamp without time zone,
ADD COLUMN IF NOT EXISTS confirmed_by bigint,
ADD COLUMN IF NOT EXISTS total_price numeric(10,2),
ADD COLUMN IF NOT EXISTS currency character varying(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS payment_status character varying(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_due_date date,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp without time zone,
ADD COLUMN IF NOT EXISTS cancelled_by bigint;

-- Add foreign key constraint for confirmed_by (admin who confirmed)
ALTER TABLE public.itinerary_requests 
ADD CONSTRAINT itinerary_requests_confirmed_by_fkey 
FOREIGN KEY (confirmed_by) REFERENCES public.users(id);

-- Add foreign key constraint for cancelled_by
ALTER TABLE public.itinerary_requests 
ADD CONSTRAINT itinerary_requests_cancelled_by_fkey 
FOREIGN KEY (cancelled_by) REFERENCES public.users(id);

-- Create status history table to track all status changes
CREATE TABLE IF NOT EXISTS public.itinerary_request_status_history (
    id bigserial PRIMARY KEY,
    request_id bigint NOT NULL,
    from_status character varying(20),
    to_status character varying(20) NOT NULL,
    changed_by bigint,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    CONSTRAINT request_status_history_request_id_fkey 
        FOREIGN KEY (request_id) REFERENCES public.itinerary_requests(id) ON DELETE CASCADE,
    CONSTRAINT request_status_history_changed_by_fkey 
        FOREIGN KEY (changed_by) REFERENCES public.users(id)
);

-- Create notifications table for customer communication
CREATE TABLE IF NOT EXISTS public.itinerary_notifications (
    id bigserial PRIMARY KEY,
    request_id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read boolean DEFAULT false,
    sent_via_email boolean DEFAULT false,
    email_sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_request_id_fkey 
        FOREIGN KEY (request_id) REFERENCES public.itinerary_requests(id) ON DELETE CASCADE,
    CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create function to automatically log status changes
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.itinerary_request_status_history (
            request_id,
            from_status,
            to_status,
            changed_by,
            notes
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.confirmed_by, -- This should be set by the application
            CASE 
                WHEN NEW.status = 'processing' THEN 'Request is being reviewed by our team'
                WHEN NEW.status = 'confirmed' THEN 'Request has been confirmed and approved'
                WHEN NEW.status = 'rejected' THEN 'Request has been rejected'
                WHEN NEW.status = 'cancelled' THEN 'Request has been cancelled'
                WHEN NEW.status = 'completed' THEN 'Trip has been completed'
                ELSE 'Status updated'
            END
        );
        
        -- Create notification for customer
        INSERT INTO public.itinerary_notifications (
            request_id,
            user_id,
            title,
            message,
            type
        ) VALUES (
            NEW.id,
            NEW.user_id,
            CASE 
                WHEN NEW.status = 'processing' THEN 'Your Trip Request is Being Reviewed'
                WHEN NEW.status = 'confirmed' THEN 'Great News! Your Trip is Confirmed'
                WHEN NEW.status = 'rejected' THEN 'Trip Request Update'
                WHEN NEW.status = 'cancelled' THEN 'Trip Request Cancelled'
                WHEN NEW.status = 'completed' THEN 'Thank You for Traveling With Us!'
                ELSE 'Trip Request Update'
            END,
            CASE 
                WHEN NEW.status = 'processing' THEN 'We have received your trip request and our team is currently reviewing the details. We will get back to you within 24-48 hours with confirmation and pricing details.'
                WHEN NEW.status = 'confirmed' THEN 'Congratulations! Your trip request has been confirmed. Please check your email for detailed itinerary and payment instructions. We look forward to providing you with an amazing travel experience.'
                WHEN NEW.status = 'rejected' THEN 'Unfortunately, we are unable to accommodate your trip request at this time. This could be due to availability, seasonal restrictions, or other factors. Please contact us to discuss alternative options.'
                WHEN NEW.status = 'cancelled' THEN 'Your trip request has been cancelled as requested. If you have any questions or would like to make a new booking, please don''t hesitate to contact us.'
                WHEN NEW.status = 'completed' THEN 'We hope you had an amazing trip! We would love to hear about your experience. Please consider leaving a review to help other travelers.'
                ELSE 'Your trip request status has been updated. Please check your dashboard for more details.'
            END,
            CASE 
                WHEN NEW.status = 'confirmed' THEN 'success'
                WHEN NEW.status = 'rejected' THEN 'warning'
                WHEN NEW.status = 'cancelled' THEN 'error'
                WHEN NEW.status = 'completed' THEN 'success'
                ELSE 'info'
            END
        );
        
        -- Set confirmed_at timestamp when status becomes confirmed
        IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
            NEW.confirmed_at = CURRENT_TIMESTAMP;
        END IF;
        
        -- Set cancelled_at timestamp when status becomes cancelled
        IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
            NEW.cancelled_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log status changes
DROP TRIGGER IF EXISTS trigger_log_status_change ON public.itinerary_requests;
CREATE TRIGGER trigger_log_status_change
    BEFORE UPDATE ON public.itinerary_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.log_status_change();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_itinerary_requests_status ON public.itinerary_requests(status);
CREATE INDEX IF NOT EXISTS idx_itinerary_requests_payment_status ON public.itinerary_requests(payment_status);
CREATE INDEX IF NOT EXISTS idx_request_status_history_request_id ON public.itinerary_request_status_history(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.itinerary_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.itinerary_notifications(is_read);

-- Create view for customer dashboard with all relevant information
CREATE OR REPLACE VIEW public.customer_booking_dashboard AS
SELECT 
    ir.id,
    ir.name,
    ir.email,
    ir.phone,
    ir.start_date,
    ir.end_date,
    ir.group_size,
    ir.status,
    ir.payment_status,
    ir.total_price,
    ir.currency,
    ir.created_at,
    ir.confirmed_at,
    ir.payment_due_date,
    i.title as itinerary_title,
    i.duration,
    i.image_url as itinerary_image,
    tg.user_id as guide_user_id,
    u_guide.first_name as guide_first_name,
    u_guide.last_name as guide_last_name,
    -- Count unread notifications
    (SELECT COUNT(*) FROM public.itinerary_notifications 
     WHERE request_id = ir.id AND is_read = false) as unread_notifications
FROM public.itinerary_requests ir
LEFT JOIN public.itineraries i ON ir.itinerary_id = i.id
LEFT JOIN public.tour_guides tg ON ir.tour_guide_id = tg.id
LEFT JOIN public.users u_guide ON tg.user_id = u_guide.id;

-- Grant necessary permissions
GRANT SELECT ON public.customer_booking_dashboard TO authenticated, anon;
GRANT SELECT, INSERT ON public.itinerary_request_status_history TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.itinerary_notifications TO authenticated, anon;

-- Add comments for documentation
COMMENT ON TABLE public.itinerary_request_status_history IS 'Tracks all status changes for itinerary requests with timestamps and responsible users';
COMMENT ON TABLE public.itinerary_notifications IS 'Stores notifications sent to customers about their trip requests';
COMMENT ON COLUMN public.itinerary_requests.confirmed_at IS 'Timestamp when the request was confirmed by admin';
COMMENT ON COLUMN public.itinerary_requests.total_price IS 'Final confirmed price for the trip';
COMMENT ON COLUMN public.itinerary_requests.payment_status IS 'Payment status: pending, paid, partial, overdue, refunded';

SELECT 'Workflow migration completed successfully' AS status;
