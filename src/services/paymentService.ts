import { supabase } from "../utils/supabaseClient";

export interface PaymentData {
    bookingId?: number;
    itineraryBookingId?: number;
    amount: number;
    paymentMethod: 'credit_card' | 'bank_transfer' | 'e_wallet';
    customerDetails: {
        name: string;
        email: string;
        phone: string;
    };
    source?: 'bookings' | 'itinerary_bookings';
}

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    error?: string;
}

class PaymentService {
    /**
     * Process payment for a confirmed booking
     * @param paymentData - Payment details including booking ID and payment method
     * @returns PaymentResult with success status and transaction details
     */
    async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
        try {
            const source = paymentData.source || 'bookings';
            let booking: any = null;
            let bookingError: any = null;
            let updateError: any = null;
            let bookingId: number | undefined = undefined;
            let itineraryBookingId: number | undefined = undefined;

            if (source === 'itinerary_bookings') {
                // Custom itinerary booking
                itineraryBookingId = paymentData.itineraryBookingId;
                const { data, error } = await supabase
                    .from('itinerary_bookings')
                    .select('id, status, payment_status, total_price')
                    .eq('id', itineraryBookingId)
                    .single();
                booking = data;
                bookingError = error;
                if (bookingError || !booking) {
                    return {
                        success: false,
                        error: 'Custom itinerary booking not found'
                    };
                }
                if (booking.status !== 'confirmed') {
                    return {
                        success: false,
                        error: 'Booking must be confirmed before payment'
                    };
                }
                if (booking.payment_status === 'paid') {
                    return {
                        success: false,
                        error: 'Payment already completed for this booking'
                    };
                }
                // Simulate payment processing
                const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                // Update itinerary_booking payment status
                const { error: updateErr } = await supabase
                    .from('itinerary_bookings')
                    .update({
                        payment_status: 'paid',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', String(itineraryBookingId));
                updateError = updateErr;
                if (updateError) {
                    console.error('Error updating payment status:', updateError);
                    return {
                        success: false,
                        error: 'Failed to update payment status'
                    };
                }
                // Create payment record (khusus itinerary_booking, booking_id tidak diisi)
                const { error: paymentRecordError } = await supabase
                    .from('payments')
                    .insert([{
                        itinerary_booking_id: itineraryBookingId,
                        amount: paymentData.amount,
                        payment_method: paymentData.paymentMethod,
                        transaction_id: transactionId,
                        status: 'completed',
                        created_at: new Date().toISOString()
                        // booking_id tidak diisi
                    }]);
                if (paymentRecordError) {
                    console.warn('Warning: Could not create payment record:', paymentRecordError);
                }
                return {
                    success: true,
                    transactionId
                };
            } else {
                // Regular booking
                bookingId = paymentData.bookingId;
                const { data, error } = await supabase
                    .from('bookings')
                    .select('id, status, payment_status, total_amount')
                    .eq('id', bookingId)
                    .single();
                booking = data;
                bookingError = error;
                if (bookingError || !booking) {
                    return {
                        success: false,
                        error: 'Booking not found'
                    };
                }
                if (booking.status !== 'confirmed') {
                    return {
                        success: false,
                        error: 'Booking must be confirmed before payment'
                    };
                }
                if (booking.payment_status === 'paid') {
                    return {
                        success: false,
                        error: 'Payment already completed for this booking'
                    };
                }
                // Simulate payment processing
                const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                // Update booking payment status
                const { error: updateErr } = await supabase
                    .from('bookings')
                    .update({
                        payment_status: 'paid',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', bookingId);
                updateError = updateErr;
                if (updateError) {
                    console.error('Error updating payment status:', updateError);
                    return {
                        success: false,
                        error: 'Failed to update payment status'
                    };
                }
                // Create payment record (regular booking, booking_id diisi)
                const { error: paymentRecordError } = await supabase
                    .from('payments')
                    .insert([{
                        booking_id: bookingId,
                        amount: paymentData.amount,
                        payment_method: paymentData.paymentMethod,
                        transaction_id: transactionId,
                        status: 'completed',
                        created_at: new Date().toISOString()
                    }]);
                if (paymentRecordError) {
                    console.warn('Warning: Could not create payment record:', paymentRecordError);
                }
                return {
                    success: true,
                    transactionId
                };
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: 'Payment processing failed'
            };
        }
    }

    /**
     * Get payment methods available for the user
     */
    getAvailablePaymentMethods() {
        return [
            {
                id: 'credit_card',
                name: 'Credit Card',
                description: 'Visa, Mastercard, American Express',
                icon: '💳'
            },
            {
                id: 'bank_transfer',
                name: 'Bank Transfer',
                description: 'Transfer from your bank account',
                icon: '🏦'
            },
            {
                id: 'e_wallet',
                name: 'E-Wallet',
                description: 'GoPay, OVO, Dana, LinkAja',
                icon: '📱'
            }
        ];
    }

    /**
     * Get payment history for a user
     */
    async getPaymentHistory(userId: number) {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
          *,
          bookings!inner (
            id,
            user_id,
            tours (
              title,
              location
            )
          )
        `)
                .eq('bookings.user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('Error fetching payment history:', error);
            return [];
        }
    }
}

export const paymentService = new PaymentService();
