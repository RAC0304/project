import { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabaseClient";
import {
  BookingStatusService,
  BookingStatus,
} from "../services/bookingStatusService";

export function useBookingStatus(userId: number) {
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>({
    upcomingTours: [],
    todayTours: [],
    completedTours: [],
    eligibleForReview: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const status = await BookingStatusService.getCustomerBookingStatus(
        userId
      );
      setBookingStatus(status);
    } catch (err) {
      console.error("Error fetching booking status:", err);
      setError("Failed to load booking status");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchBookingStatus();

      // Subscribe to booking changes
      const subscription = supabase
        .channel("booking_status_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchBookingStatus();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "reviews",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchBookingStatus();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId, fetchBookingStatus]);

  return {
    ...bookingStatus,
    loading,
    error,
    refetch: fetchBookingStatus,
  };
}
