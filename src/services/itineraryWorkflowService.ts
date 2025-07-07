import { supabase } from '../config/supabaseClient';

export type RequestStatus = 'pending' | 'processing' | 'confirmed' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'refunded';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface StatusHistoryEntry {
    id: string;
    request_id: string;
    from_status: RequestStatus | null;
    to_status: RequestStatus;
    changed_by: string | null;
    changed_at: string;
    notes: string | null;
}

export interface CustomerNotification {
    id: string;
    request_id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    sent_via_email: boolean;
    email_sent_at: string | null;
    created_at: string;
}

export interface CustomerBookingDashboard {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    start_date: string;
    end_date: string;
    group_size: string;
    status: RequestStatus;
    payment_status: PaymentStatus;
    total_price: number | null;
    currency: string;
    created_at: string;
    confirmed_at: string | null;
    payment_due_date: string | null;
    itinerary_title: string | null;
    duration: string | null;
    itinerary_image: string | null;
    guide_user_id: string | null;
    guide_first_name: string | null;
    guide_last_name: string | null;
    unread_notifications: number;
}

/**
 * Update the status of an itinerary request
 */
export const updateRequestStatus = async (
    requestId: string,
    newStatus: RequestStatus,
    adminUserId: string,
    notes?: string,
    additionalData?: {
        total_price?: number;
        payment_due_date?: string;
        admin_notes?: string;
        cancellation_reason?: string;
    }
): Promise<void> => {
    try {
        const updateData: any = {
            status: newStatus,
            updated_at: new Date().toISOString(),
        };

        // Add admin info for non-pending status
        if (newStatus !== 'pending') {
            updateData.confirmed_by = adminUserId;
        }

        // Add additional data if provided
        if (additionalData) {
            Object.assign(updateData, additionalData);
        }

        // Set specific fields based on status
        if (newStatus === 'cancelled' && additionalData?.cancellation_reason) {
            updateData.cancelled_by = adminUserId;
            updateData.cancelled_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('itinerary_requests')
            .update(updateData)
            .eq('id', requestId);

        if (error) {
            console.error('Error updating request status:', error);
            throw new Error(`Failed to update request status: ${error.message}`);
        }

        console.log(`Request ${requestId} status updated to ${newStatus}`);
    } catch (error) {
        console.error('Error in updateRequestStatus:', error);
        throw error;
    }
};

/**
 * Get status history for a request
 */
export const getRequestStatusHistory = async (requestId: string): Promise<StatusHistoryEntry[]> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_request_status_history')
            .select(`
        *,
        users:changed_by (
          first_name,
          last_name,
          email
        )
      `)
            .eq('request_id', requestId)
            .order('changed_at', { ascending: false });

        if (error) {
            console.error('Error fetching status history:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getRequestStatusHistory:', error);
        throw error;
    }
};

/**
 * Get customer notifications
 */
export const getCustomerNotifications = async (
    userId: string,
    unreadOnly: boolean = false
): Promise<CustomerNotification[]> => {
    try {
        let query = supabase
            .from('itinerary_notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getCustomerNotifications:', error);
        throw error;
    }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in markNotificationAsRead:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in markAllNotificationsAsRead:', error);
        throw error;
    }
};

/**
 * Get customer booking dashboard data
 */
export const getCustomerBookingDashboard = async (userId: string): Promise<CustomerBookingDashboard[]> => {
    try {
        const { data, error } = await supabase
            .from('customer_booking_dashboard')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customer dashboard:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getCustomerBookingDashboard:', error);
        throw error;
    }
};

/**
 * Create a manual notification for a customer
 */
export const createCustomerNotification = async (
    requestId: string,
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'info'
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_notifications')
            .insert([{
                request_id: requestId,
                user_id: userId,
                title,
                message,
                type
            }]);

        if (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in createCustomerNotification:', error);
        throw error;
    }
};

/**
 * Cancel a request by customer
 */
export const cancelRequestByCustomer = async (
    requestId: string,
    userId: string,
    reason: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('itinerary_requests')
            .update({
                status: 'cancelled',
                cancellation_reason: reason,
                cancelled_by: userId,
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .eq('user_id', userId); // Ensure user can only cancel their own requests

        if (error) {
            console.error('Error cancelling request:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in cancelRequestByCustomer:', error);
        throw error;
    }
};

/**
 * Get payment information for a request
 */
export const getPaymentInfo = async (requestId: string): Promise<{
    total_price: number | null;
    currency: string;
    payment_status: PaymentStatus;
    payment_due_date: string | null;
}> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_requests')
            .select('total_price, currency, payment_status, payment_due_date')
            .eq('id', requestId)
            .single();

        if (error) {
            console.error('Error fetching payment info:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in getPaymentInfo:', error);
        throw error;
    }
};

/**
 * Get request counts by status for admin dashboard
 */
export const getRequestStatusCounts = async (): Promise<{
    [key in RequestStatus]: number;
}> => {
    try {
        const { data, error } = await supabase
            .from('itinerary_requests')
            .select('status');

        if (error) {
            console.error('Error fetching status counts:', error);
            throw error;
        }

        const counts: { [key in RequestStatus]: number } = {
            pending: 0,
            processing: 0,
            confirmed: 0,
            approved: 0,
            rejected: 0,
            cancelled: 0,
            completed: 0
        };

        data?.forEach(request => {
            if (request.status in counts) {
                counts[request.status as RequestStatus]++;
            }
        });

        return counts;
    } catch (error) {
        console.error('Error in getRequestStatusCounts:', error);
        throw error;
    }
};

export default {
    updateRequestStatus,
    getRequestStatusHistory,
    getCustomerNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getCustomerBookingDashboard,
    createCustomerNotification,
    cancelRequestByCustomer,
    getPaymentInfo,
    getRequestStatusCounts
};
