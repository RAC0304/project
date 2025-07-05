// src/services/userActivityService.ts
import { supabase } from "../utils/supabaseClient";
import { formatIndonesianDate } from "../utils/dateUtils";

export interface ActivityItem {
  id: string;
  type: "booking" | "message" | "profile_update" | "tour_request";
  title: string;
  description: string;
  timestamp: string;
  formattedDate: string;
  icon: string;
  details?: {
    bookingId?: number;
    status?: string;
    paymentStatus?: string;
    amount?: number;
    participants?: number;
    tourTitle?: string;
    tourLocation?: string;
    activityType?: "creation" | "confirmation" | "payment" | "cancellation";
    messageId?: number;
    receiverName?: string;
    content?: string;
    requestId?: number;
    groupSize?: string;
    startDate?: string;
    endDate?: string;
    tourGuideName?: string;
    [key: string]: unknown;
  };
}

class UserActivityService {
  /**
   * Get recent activities for a user
   * This method efficiently fetches activities from multiple sources and returns
   * the most recent ones sorted by timestamp
   *
   * Includes:
   * - Bookings: Tour bookings made by the user
   * - Messages: Messages sent by the user
   * - Tour Requests: Itinerary requests submitted by the user
   *
   * @param userId - User ID (string or number)
   * @param limit - Maximum number of activities to return (default: 3)
   * @returns Promise<ActivityItem[]> - Array of recent activities sorted by most recent first
   */
  async getUserRecentActivities(
    userId: string | number,
    limit: number = 3
  ): Promise<ActivityItem[]> {
    try {
      const userIdNumber =
        typeof userId === "string" ? parseInt(userId) : userId;
      if (isNaN(userIdNumber)) {
        console.error("Invalid user ID:", userId);
        return [];
      }

      const activities: ActivityItem[] = [];

      // Fetch more items from each category to ensure we have enough recent activities
      // We'll fetch more than needed and then sort by timestamp to get the truly most recent ones
      const fetchLimit = Math.max(limit, 3); // Ensure we fetch at least 3 from each category

      // Fetch recent bookings
      const bookings = await this.getRecentBookings(userIdNumber, fetchLimit);
      activities.push(...bookings);

      // Fetch recent messages (sent)
      const messages = await this.getRecentMessages(userIdNumber, fetchLimit);
      activities.push(...messages);

      // Fetch recent itinerary requests
      const requests = await this.getRecentItineraryRequests(
        userIdNumber,
        fetchLimit
      );
      activities.push(...requests);

      // Sort by timestamp (most recent first) and limit to exactly the requested number
      const sortedActivities = activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);

      return sortedActivities;
    } catch (error) {
      console.error("Error fetching user activities:", error);
      return [];
    }
  }

  /**
   * Get all activities for a user (no limit)
   * This method fetches all activities from multiple sources and returns
   * them sorted by timestamp for the "View all activities" functionality
   *
   * @param userId - User ID (string or number)
   * @returns Promise<ActivityItem[]> - Array of all activities sorted by most recent first
   */
  async getAllUserActivities(userId: string | number): Promise<ActivityItem[]> {
    try {
      const userIdNumber =
        typeof userId === "string" ? parseInt(userId) : userId;
      if (isNaN(userIdNumber)) {
        console.error("Invalid user ID:", userId);
        return [];
      }

      const activities: ActivityItem[] = [];

      // Fetch all items from each category (no limit)
      const [bookings, messages, requests] = await Promise.all([
        this.getAllBookings(userIdNumber),
        this.getAllMessages(userIdNumber),
        this.getAllItineraryRequests(userIdNumber),
      ]);

      activities.push(...bookings, ...messages, ...requests);

      // Sort by timestamp (most recent first)
      return activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("Error fetching all user activities:", error);
      return [];
    }
  }

  /**
   * Get recent bookings for a user
   */
  private async getRecentBookings(
    userId: number,
    limit: number
  ): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          created_at,
          updated_at,
          status,
          payment_status,
          participants,
          total_amount,
          tours (
            title,
            location
          )
        `
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(limit); // Changed: Removed multiplier since we're only creating 1 activity per booking

      if (error) throw error;

      const activities: ActivityItem[] = [];

      (data || []).forEach((booking) => {
        const tour = Array.isArray(booking.tours)
          ? booking.tours[0]
          : booking.tours;

        // Create only ONE activity per booking based on current status
        // Priority: paid > confirmed > cancelled > pending

        if (booking.payment_status === "paid") {
          // Highest priority: Payment completed
          activities.push({
            id: `booking-paid-${booking.id}`,
            type: "booking" as const,
            title: "Payment Completed - Tour Confirmed",
            description: `Payment successful for "${
              tour?.title || "Unknown Tour"
            }" - you can now chat with your tour guide!`,
            timestamp: booking.updated_at || booking.created_at,
            formattedDate: formatIndonesianDate(
              booking.updated_at || booking.created_at
            ),
            icon: "💳",
            details: {
              bookingId: booking.id,
              status: booking.status,
              paymentStatus: booking.payment_status,
              amount: booking.total_amount,
              participants: booking.participants,
              tourTitle: tour?.title,
              tourLocation: tour?.location,
              activityType: "payment",
            },
          });
        } else if (
          booking.status === "confirmed" &&
          booking.payment_status === "pending"
        ) {
          // Second priority: Confirmed but not paid yet
          activities.push({
            id: `booking-confirmed-${booking.id}`,
            type: "booking" as const,
            title: "Booking Confirmed - Payment Required",
            description: `Tour guide confirmed your booking for "${
              tour?.title || "Unknown Tour"
            }" - please complete payment`,
            timestamp: booking.updated_at || booking.created_at,
            formattedDate: formatIndonesianDate(
              booking.updated_at || booking.created_at
            ),
            icon: "✅",
            details: {
              bookingId: booking.id,
              status: booking.status,
              paymentStatus: booking.payment_status,
              amount: booking.total_amount,
              participants: booking.participants,
              tourTitle: tour?.title,
              tourLocation: tour?.location,
              activityType: "confirmation",
            },
          });
        } else if (booking.status === "cancelled") {
          // Third priority: Cancelled bookings
          activities.push({
            id: `booking-cancelled-${booking.id}`,
            type: "booking" as const,
            title: "Booking Cancelled",
            description: `Booking for "${
              tour?.title || "Unknown Tour"
            }" has been cancelled`,
            timestamp: booking.updated_at || booking.created_at,
            formattedDate: formatIndonesianDate(
              booking.updated_at || booking.created_at
            ),
            icon: "❌",
            details: {
              bookingId: booking.id,
              status: booking.status,
              paymentStatus: booking.payment_status,
              amount: booking.total_amount,
              participants: booking.participants,
              tourTitle: tour?.title,
              tourLocation: tour?.location,
              activityType: "cancellation",
            },
          });
        } else if (booking.status === "pending") {
          // Lowest priority: Just created, waiting for confirmation
          activities.push({
            id: `booking-pending-${booking.id}`,
            type: "booking" as const,
            title: "Booking Created",
            description: `Booked "${tour?.title || "Unknown Tour"}" in ${
              tour?.location || "Unknown Location"
            } for ${
              booking.participants
            } participants - waiting for confirmation`,
            timestamp: booking.created_at,
            formattedDate: formatIndonesianDate(booking.created_at),
            icon: "⏳",
            details: {
              bookingId: booking.id,
              status: booking.status,
              paymentStatus: booking.payment_status,
              amount: booking.total_amount,
              participants: booking.participants,
              tourTitle: tour?.title,
              tourLocation: tour?.location,
              activityType: "creation",
            },
          });
        }
      });

      // Sort by timestamp and limit to requested amount
      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      return [];
    }
  }

  /**
   * Get all bookings for a user (no limit)
   */
  private async getAllBookings(userId: number): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          created_at,
          updated_at,
          status,
          payment_status,
          participants,
          total_amount,
          tours (
            title,
            location
          )
        `
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const activities: ActivityItem[] = [];

      (data || []).forEach((booking) => {
        const tour = Array.isArray(booking.tours)
          ? booking.tours[0]
          : booking.tours;

        // Create only ONE activity per booking based on current status
        // Priority: paid > confirmed > cancelled > pending

        if (booking.payment_status === "paid") {
          // Highest priority: Payment completed
          activities.push({
            id: `booking-paid-${booking.id}`,
            type: "booking" as const,
            title: "Payment Completed - Tour Confirmed",
            description: `Payment successful for "${
              tour?.title || "Unknown Tour"
            }" - you can now chat with your tour guide!`,
            timestamp: booking.updated_at || booking.created_at,
            formattedDate: formatIndonesianDate(
              booking.updated_at || booking.created_at
            ),
            icon: "💳",
            details: {
              bookingId: booking.id,
              status: booking.status,
              paymentStatus: booking.payment_status,
              amount: booking.total_amount,
              participants: booking.participants,
              tourTitle: tour?.title,
              tourLocation: tour?.location,
              activityType: "payment",
            },
          });
        } else if (
          booking.status === "confirmed" &&
          booking.payment_status === "pending"
        ) {
          // Second priority: Confirmed but not paid yet
          activities.push({
            id: `booking-confirmed-${booking.id}`,
            type: "booking" as const,
            title: "Booking Confirmed - Payment Required",
            description: `Tour guide confirmed your booking for "${
              tour?.title || "Unknown Tour"
            }" - please complete payment`,
            timestamp: booking.updated_at || booking.created_at,
            formattedDate: formatIndonesianDate(
              booking.updated_at || booking.created_at
            ),
            icon: "✅",
            details: {
              bookingId: booking.id,
              status: booking.status,
              paymentStatus: booking.payment_status,
              amount: booking.total_amount,
              participants: booking.participants,
              tourTitle: tour?.title,
              tourLocation: tour?.location,
              activityType: "confirmation",
            },
          });
        } else if (booking.status === "cancelled") {
          // Third priority: Cancelled bookings
          activities.push({
            id: `booking-cancelled-${booking.id}`,
            type: "booking" as const,
            title: "Booking Cancelled",
            description: `Booking for "${
              tour?.title || "Unknown Tour"
            }" has been cancelled`,
            timestamp: booking.updated_at || booking.created_at,
            formattedDate: formatIndonesianDate(
              booking.updated_at || booking.created_at
            ),
            icon: "❌",
            details: {
              bookingId: booking.id,
              status: booking.status,
              paymentStatus: booking.payment_status,
              amount: booking.total_amount,
              participants: booking.participants,
              tourTitle: tour?.title,
              tourLocation: tour?.location,
              activityType: "cancellation",
            },
          });
        } else if (booking.status === "pending") {
          // Lowest priority: Just created, waiting for confirmation
          activities.push({
            id: `booking-pending-${booking.id}`,
            type: "booking" as const,
            title: "Booking Created",
            description: `Booked "${tour?.title || "Unknown Tour"}" in ${
              tour?.location || "Unknown Location"
            } for ${
              booking.participants
            } participants - waiting for confirmation`,
            timestamp: booking.created_at,
            formattedDate: formatIndonesianDate(booking.created_at),
            icon: "⏳",
            details: {
              bookingId: booking.id,
              status: booking.status,
              paymentStatus: booking.payment_status,
              amount: booking.total_amount,
              participants: booking.participants,
              tourTitle: tour?.title,
              tourLocation: tour?.location,
              activityType: "creation",
            },
          });
        }
      });

      // Sort by timestamp
      return activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      return [];
    }
  }

  /**
   * Get recent messages sent by user
   */
  private async getRecentMessages(
    userId: number,
    limit: number
  ): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          id,
          sent_at,
          content,
          receiver:users!messages_receiver_id_fkey (
            first_name,
            last_name
          ),
          tour_guides (
            users (
              first_name,
              last_name
            )
          )
        `
        )
        .eq("sender_id", userId)
        .order("sent_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((message) => {
        const receiver = Array.isArray(message.receiver)
          ? message.receiver[0]
          : message.receiver;
        const receiverName = receiver
          ? `${receiver.first_name} ${receiver.last_name}`
          : "Unknown";

        const shortContent =
          message.content.length > 50
            ? message.content.substring(0, 50) + "..."
            : message.content;

        return {
          id: `message-${message.id}`,
          type: "message" as const,
          title: "Message Sent",
          description: `Sent message to ${receiverName}: "${shortContent}"`,
          timestamp: message.sent_at,
          formattedDate: formatIndonesianDate(message.sent_at),
          icon: "💬",
          details: {
            messageId: message.id,
            receiverName: receiverName,
            content: message.content,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      return [];
    }
  }

  /**
   * Get all messages sent by user (no limit)
   */
  private async getAllMessages(userId: number): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          id,
          sent_at,
          content,
          receiver:users!messages_receiver_id_fkey (
            first_name,
            last_name
          ),
          tour_guides (
            users (
              first_name,
              last_name
            )
          )
        `
        )
        .eq("sender_id", userId)
        .order("sent_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((message) => {
        const receiver = Array.isArray(message.receiver)
          ? message.receiver[0]
          : message.receiver;
        const receiverName = receiver
          ? `${receiver.first_name} ${receiver.last_name}`
          : "Unknown";

        const shortContent =
          message.content.length > 50
            ? message.content.substring(0, 50) + "..."
            : message.content;

        return {
          id: `message-${message.id}`,
          type: "message" as const,
          title: "Message Sent",
          description: `Sent message to ${receiverName}: "${shortContent}"`,
          timestamp: message.sent_at,
          formattedDate: formatIndonesianDate(message.sent_at),
          icon: "💬",
          details: {
            messageId: message.id,
            receiverName: receiverName,
            content: message.content,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching all messages:", error);
      return [];
    }
  }

  /**
   * Get recent itinerary requests
   */
  private async getRecentItineraryRequests(
    userId: number,
    limit: number
  ): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from("itinerary_requests")
        .select(
          `
          id,
          created_at,
          status,
          start_date,
          end_date,
          group_size,
          itineraries (
            title
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((request) => {
        const itinerary = Array.isArray(request.itineraries)
          ? request.itineraries[0]
          : request.itineraries;
        return {
          id: `request-${request.id}`,
          type: "tour_request" as const,
          title: "Tour Request Submitted",
          description: `Requested "${
            itinerary?.title || "Unknown Itinerary"
          }" for ${request.group_size} people from ${formatIndonesianDate(
            request.start_date
          )} to ${formatIndonesianDate(request.end_date)}`,
          timestamp: request.created_at,
          formattedDate: formatIndonesianDate(request.created_at),
          icon: "🗺️",
          details: {
            requestId: request.id,
            status: request.status,
            groupSize: request.group_size,
            startDate: request.start_date,
            endDate: request.end_date,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching recent itinerary requests:", error);
      return [];
    }
  }

  /**
   * Get all itinerary requests (no limit)
   */
  private async getAllItineraryRequests(
    userId: number
  ): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from("itinerary_requests")
        .select(
          `
          id,
          created_at,
          status,
          start_date,
          end_date,
          group_size,
          itineraries (
            title
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((request) => {
        const itinerary = Array.isArray(request.itineraries)
          ? request.itineraries[0]
          : request.itineraries;
        return {
          id: `request-${request.id}`,
          type: "tour_request" as const,
          title: "Tour Request Submitted",
          description: `Requested "${
            itinerary?.title || "Unknown Itinerary"
          }" for ${request.group_size} people from ${formatIndonesianDate(
            request.start_date
          )} to ${formatIndonesianDate(request.end_date)}`,
          timestamp: request.created_at,
          formattedDate: formatIndonesianDate(request.created_at),
          icon: "🗺️",
          details: {
            requestId: request.id,
            status: request.status,
            groupSize: request.group_size,
            startDate: request.start_date,
            endDate: request.end_date,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching all itinerary requests:", error);
      return [];
    }
  }

  /**
   * Log a custom activity (for future use)
   */
  async logActivity(
    userId: string | number,
    type: string,
    title: string,
    description: string,
    details?: ActivityItem["details"]
  ): Promise<boolean> {
    try {
      const userIdNumber =
        typeof userId === "string" ? parseInt(userId) : userId;
      if (isNaN(userIdNumber)) {
        console.error("Invalid user ID:", userId);
        return false;
      }

      // Check if activity_logs table exists
      const { data: tableExists } = await supabase
        .from("activity_logs")
        .select("id")
        .limit(1);

      if (tableExists !== null) {
        const { error } = await supabase.from("activity_logs").insert([
          {
            user_id: userIdNumber,
            type,
            title,
            description,
            details: details || {},
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.error("Failed to log activity:", error);
          return false;
        }

        console.log("Activity logged successfully");
        return true;
      } else {
        console.warn("Activity logs table does not exist");
        return false;
      }
    } catch (error) {
      console.error("Error logging activity:", error);
      return false;
    }
  }

  /**
   * Get activity summary statistics
   */
  async getActivitySummary(userId: string | number): Promise<{
    totalBookings: number;
    totalMessages: number;
    totalRequests: number;
  }> {
    try {
      const userIdNumber =
        typeof userId === "string" ? parseInt(userId) : userId;
      if (isNaN(userIdNumber)) {
        console.error("Invalid user ID:", userId);
        return {
          totalBookings: 0,
          totalMessages: 0,
          totalRequests: 0,
        };
      }

      const [bookingsResult, messagesResult, requestsResult] =
        await Promise.all([
          supabase
            .from("bookings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userIdNumber),
          supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("sender_id", userIdNumber),
          supabase
            .from("itinerary_requests")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userIdNumber),
        ]);

      return {
        totalBookings: bookingsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalRequests: requestsResult.count || 0,
      };
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      return {
        totalBookings: 0,
        totalMessages: 0,
        totalRequests: 0,
      };
    }
  }
}

// Export singleton instance
export const userActivityService = new UserActivityService();
export default userActivityService;
