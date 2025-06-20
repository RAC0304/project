// src/services/clientsService.ts
import { supabase } from "../config/supabaseClient";

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  lastBooking: string | null;
  status: "active" | "inactive";
  joinDate: string;
  location?: string | null;
  avatar?: string | null;
  preferredLanguage?: string;
  specialInterests?: string[];
  notes?: string;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalBookings: number;
  averageRating: number;
}

export interface ClientFilters {
  searchTerm?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  limit?: number;
}

class ClientsService {
  /**
   * Get all clients for a specific tour guide
   */
  async getClientsByTourGuide(
    tourGuideId: string,
    filters: ClientFilters = {}
  ) {
    try {
      const { searchTerm, status, page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;

      // Query to get clients who have booked tours with this tour guide
      let query = supabase
        .from("bookings")
        .select(
          `
          user_id,
          users!inner (
            id,
            email,
            first_name,
            last_name,
            phone,
            profile_picture,
            location,
            created_at
          ),
          tours!inner (
            tour_guide_id
          ),
          id,
          total_amount,
          status,
          created_at,
          date
        `
        )
        .eq("tours.tour_guide_id", tourGuideId);

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `users.first_name.ilike.%${searchTerm}%,users.last_name.ilike.%${searchTerm}%,users.email.ilike.%${searchTerm}%`
        );
      }

      const { data: bookingsData, error: bookingsError } = await query;

      if (bookingsError) {
        throw new Error(`Error fetching bookings: ${bookingsError.message}`);
      }

      if (!bookingsData) {
        return { clients: [], total: 0 };
      } // Process the data to create client summaries
      interface BookingData {
        id: string;
        user_id: string;
        total_amount: string;
        status: string;
        created_at: string;
        date: string;
        users: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          profile_picture: string | null;
          location: string | null;
          created_at: string;
        };
      }

      interface ClientMapValue {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        location: string | null;
        avatar: string | null;
        joinDate: string;
        bookings: BookingData[];
        totalBookings: number;
        totalSpent: number;
        averageRating: number;
        lastBooking: string | null;
        status: "active" | "inactive";
      }

      const clientMap = new Map<string, ClientMapValue>();
      bookingsData.forEach((booking) => {
        const userId = booking.user_id;
        const user = Array.isArray(booking.users)
          ? booking.users[0]
          : booking.users;

        if (!user) return;

        if (!clientMap.has(userId)) {
          clientMap.set(userId, {
            id: userId,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            phone: user.phone,
            location: user.location,
            avatar: user.profile_picture,
            joinDate: user.created_at,
            bookings: [],
            totalBookings: 0,
            totalSpent: 0,
            averageRating: 0,
            lastBooking: null,
            status: "inactive" as const,
          });
        }
        const client = clientMap.get(userId)!;
        client.totalBookings += 1;
        client.totalSpent += parseFloat(booking.total_amount || "0");

        // Update last booking date
        if (
          !client.lastBooking ||
          new Date(booking.date) > new Date(client.lastBooking)
        ) {
          client.lastBooking = booking.date;
        }
      }); // Get reviews for rating calculation
      for (const [, client] of clientMap) {
        // Skip review query for now due to complex relationship
        // In a real implementation, this would need proper join queries
        client.averageRating = 0;

        // Determine client status (active if booked in last 6 months)
        if (client.lastBooking) {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          client.status =
            new Date(client.lastBooking) >= sixMonthsAgo
              ? "active"
              : "inactive";
        }
      }

      let clients = Array.from(clientMap.values());

      // Apply status filter
      if (status && status !== "all") {
        clients = clients.filter((client) => client.status === status);
      }

      // Sort by last booking date (most recent first)
      clients.sort(
        (a, b) =>
          new Date(b.lastBooking || 0).getTime() -
          new Date(a.lastBooking || 0).getTime()
      );

      // Apply pagination
      const total = clients.length;
      const paginatedClients = clients.slice(offset, offset + limit);
      return {
        clients: paginatedClients as ClientData[],
        total,
        page: page || 1,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error in getClientsByTourGuide:", error);
      throw error;
    }
  }

  /**
   * Get client statistics for a tour guide
   */
  async getClientStats(tourGuideId: string): Promise<ClientStats> {
    try {
      // Ambil semua bookings beserta relasi tours
      const { data: bookingsData, error: bookingsError } = await supabase.from(
        "bookings"
      ).select(`
          id,
          user_id,
          tours (
            id,
            tour_guide_id
          )
        `);

      if (bookingsError) {
        throw new Error(
          `Error fetching client stats: ${bookingsError.message}`
        );
      }

      if (!bookingsData) {
        return {
          totalClients: 0,
          activeClients: 0,
          totalBookings: 0,
          averageRating: 0,
        };
      }

      // Filter bookings yang tour_guide_id sesuai
      const filtered = bookingsData.filter(
        (b: any) => b.tours && b.tours.tour_guide_id == tourGuideId
      );
      const uniqueClients = new Set(filtered.map((b: any) => b.user_id));
      const totalClients = uniqueClients.size;

      // Hitung statistik lain dari hasil filter
      // Untuk activeClients, gunakan logic: booking dalam 6 bulan terakhir
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      const activeClients = Array.from(uniqueClients).filter((userId) => {
        return filtered.some(
          (b: any) =>
            b.user_id === userId && new Date(b.created_at) >= sixMonthsAgo
        );
      }).length;
      const totalBookings = filtered.length;
      // Average rating: dummy 0, atau bisa di-improve dengan query reviews
      const averageRating = 0;

      return {
        totalClients,
        activeClients,
        totalBookings,
        averageRating,
      };
    } catch (error) {
      console.error("Error in getClientStats:", error);
      throw error;
    }
  }

  /**
   * Get detailed client information including booking history
   */
  async getClientDetails(clientId: string, tourGuideId: string) {
    try {
      // Get client basic info
      const { data: clientData, error: clientError } = await supabase
        .from("users")
        .select(
          `
          id,
          email,
          first_name,
          last_name,
          phone,
          profile_picture,
          location,
          created_at,
          languages
        `
        )
        .eq("id", clientId)
        .single();

      if (clientError) {
        throw new Error(
          `Error fetching client details: ${clientError.message}`
        );
      }

      // Get booking history for this client with this tour guide
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          date,
          participants,
          status,
          total_amount,
          special_requests,
          created_at,
          tours (
            id,
            title,
            description,
            location,
            duration
          )
        `
        )
        .eq("user_id", clientId)
        .eq("tours.tour_guide_id", tourGuideId)
        .order("date", { ascending: false });

      if (bookingsError) {
        throw new Error(
          `Error fetching booking history: ${bookingsError.message}`
        );
      }

      // Get reviews from this client for this tour guide's tours
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          tours (
            id,
            title
          )
        `
        )
        .eq("user_id", clientId)
        .eq("tours.tour_guide_id", tourGuideId)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        throw new Error(`Error fetching reviews: ${reviewsError.message}`);
      }

      // Calculate statistics
      const totalBookings = bookingsData?.length || 0;
      const totalSpent =
        bookingsData?.reduce(
          (sum, booking) => sum + parseFloat(booking.total_amount || "0"),
          0
        ) || 0;
      const averageRating =
        reviewsData && reviewsData.length > 0
          ? reviewsData.reduce((sum, review) => sum + review.rating, 0) /
            reviewsData.length
          : 0;

      const lastBooking =
        bookingsData && bookingsData.length > 0 ? bookingsData[0].date : null;

      // Determine status
      let status: "active" | "inactive" = "inactive";
      if (lastBooking) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        status = new Date(lastBooking) >= sixMonthsAgo ? "active" : "inactive";
      }

      return {
        id: clientData.id,
        name: `${clientData.first_name} ${clientData.last_name}`,
        email: clientData.email,
        phone: clientData.phone,
        location: clientData.location,
        avatar: clientData.profile_picture,
        joinDate: clientData.created_at,
        languages: clientData.languages,
        totalBookings,
        totalSpent,
        averageRating: parseFloat(averageRating.toFixed(1)),
        lastBooking,
        status,
        bookings: bookingsData || [],
        reviews: reviewsData || [],
      };
    } catch (error) {
      console.error("Error in getClientDetails:", error);
      throw error;
    }
  }

  /**
   * Send message to client (placeholder for future implementation)
   */
  async sendMessageToClient(
    clientId: string,
    tourGuideId: string,
    message: string
  ) {
    try {
      // This would integrate with a messaging system
      // For now, we'll just log the action
      console.log("Sending message to client:", {
        clientId,
        tourGuideId,
        message,
      });

      // Future implementation might involve:
      // - Creating a record in a messages table
      // - Sending email notification
      // - Real-time messaging system integration

      return { success: true, message: "Message sent successfully" };
    } catch (error) {
      console.error("Error sending message to client:", error);
      throw error;
    }
  }

  /**
   * Update client notes (for tour guide's private reference)
   */
  async updateClientNotes(
    clientId: string,
    tourGuideId: string,
    notes: string
  ) {
    try {
      // This would require a separate table for tour guide client notes
      // For now, we'll return a placeholder
      console.log("Updating client notes:", { clientId, tourGuideId, notes });

      return { success: true, message: "Notes updated successfully" };
    } catch (error) {
      console.error("Error updating client notes:", error);
      throw error;
    }
  }
  /**
   * Get client communication history
   */
  async getClientCommunications(_clientId: string, _tourGuideId: string) {
    try {
      // This would fetch communication history from a messages/communications table
      // For now, returning empty array as placeholder
      return [];
    } catch (error) {
      console.error("Error fetching client communications:", error);
      throw error;
    }
  }
}

export const clientsService = new ClientsService();
export default clientsService;
