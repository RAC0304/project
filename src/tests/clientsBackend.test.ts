// Test file for Clients Service
// tests/clientsService.test.ts

import { clientsService } from "../src/services/clientsService";
import { supabase } from "../s../utils/supabaseClient";

// Mock Supabase
jest.mock("../s../utils/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("ClientsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getClientsByTourGuide", () => {
    it("should fetch clients for a tour guide", async () => {
      const mockBookingsData = [
        {
          user_id: "user-1",
          users: {
            id: "user-1",
            email: "client1@example.com",
            first_name: "John",
            last_name: "Doe",
            phone: "+1234567890",
            profile_picture: null,
            location: "Jakarta",
            created_at: "2024-01-01T00:00:00Z",
          },
          id: "booking-1",
          total_amount: "1000000",
          status: "confirmed",
          created_at: "2024-06-01T00:00:00Z",
          date: "2024-06-15",
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: mockBookingsData,
        error: null,
      });

      const result = await clientsService.getClientsByTourGuide("tour-guide-1");

      expect(result.clients).toHaveLength(1);
      expect(result.clients[0].name).toBe("John Doe");
      expect(result.clients[0].email).toBe("client1@example.com");
      expect(result.clients[0].totalBookings).toBe(1);
      expect(result.clients[0].totalSpent).toBe(1000000);
    });

    it("should handle search filter", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: [],
        error: null,
      });

      await clientsService.getClientsByTourGuide("tour-guide-1", {
        searchTerm: "john",
      });

      expect(mockQuery.or).toHaveBeenCalledWith(
        expect.stringContaining("john")
      );
    });

    it("should handle pagination", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await clientsService.getClientsByTourGuide(
        "tour-guide-1",
        {
          page: 2,
          limit: 5,
        }
      );

      expect(result.page).toBe(2);
    });

    it("should handle errors", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(
        clientsService.getClientsByTourGuide("tour-guide-1")
      ).rejects.toThrow("Error fetching bookings: Database error");
    });
  });

  describe("getClientStats", () => {
    it("should calculate client statistics", async () => {
      // Mock the count query
      const mockCountQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockCountQuery as any);
      mockCountQuery.select.mockResolvedValue({
        count: 10,
        error: null,
      });

      // Mock the detailed clients call
      jest.spyOn(clientsService, "getClientsByTourGuide").mockResolvedValue({
        clients: [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            phone: null,
            totalBookings: 3,
            totalSpent: 1500000,
            averageRating: 4.5,
            lastBooking: "2024-06-01",
            status: "active",
            joinDate: "2024-01-01",
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            phone: null,
            totalBookings: 2,
            totalSpent: 1000000,
            averageRating: 4.0,
            lastBooking: "2023-12-01",
            status: "inactive",
            joinDate: "2023-01-01",
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      });

      const stats = await clientsService.getClientStats("tour-guide-1");

      expect(stats.totalClients).toBe(10);
      expect(stats.activeClients).toBe(1);
      expect(stats.totalBookings).toBe(5);
      expect(stats.averageRating).toBe(4.3);
    });
  });

  describe("getClientDetails", () => {
    it("should fetch detailed client information", async () => {
      const mockClientData = {
        id: "user-1",
        email: "client@example.com",
        first_name: "John",
        last_name: "Doe",
        phone: "+1234567890",
        profile_picture: null,
        location: "Jakarta",
        created_at: "2024-01-01T00:00:00Z",
        languages: ["English", "Indonesian"],
      };

      const mockBookingsData = [
        {
          id: "booking-1",
          date: "2024-06-15",
          participants: 2,
          status: "confirmed",
          total_amount: "1000000",
          special_requests: "Vegetarian meals",
          created_at: "2024-06-01T00:00:00Z",
          tours: {
            id: "tour-1",
            title: "Bali Temple Tour",
            description: "Visit ancient temples",
            location: "Bali",
            duration: "8 hours",
          },
        },
      ]; const mockReviewsData = [
        {
          id: "review-1",
          rating: 5,
          content: "Excellent tour!",
          created_at: "2024-06-16T00:00:00Z",
          tours: {
            id: "tour-1",
            title: "Bali Temple Tour",
          },
        },
      ];

      const mockQueries = [
        {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockClientData,
            error: null,
          }),
          order: jest.fn().mockReturnThis(),
        },
        {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockBookingsData,
            error: null,
          }),
        },
        {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockReviewsData,
            error: null,
          }),
        },
      ];

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        return mockQueries[callCount++] as any;
      });

      const result = await clientsService.getClientDetails(
        "user-1",
        "tour-guide-1"
      );

      expect(result.name).toBe("John Doe");
      expect(result.email).toBe("client@example.com");
      expect(result.totalBookings).toBe(1);
      expect(result.totalSpent).toBe(1000000);
      expect(result.averageRating).toBe(5);
      expect(result.bookings).toHaveLength(1);
      expect(result.reviews).toHaveLength(1);
    });
  });

  describe("sendMessageToClient", () => {
    it("should log message sending (placeholder)", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = await clientsService.sendMessageToClient(
        "client-1",
        "tour-guide-1",
        "Hello!"
      );

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Sending message to client:",
        expect.objectContaining({
          clientId: "client-1",
          tourGuideId: "tour-guide-1",
          message: "Hello!",
        })
      );

      consoleSpy.mockRestore();
    });
  });
});

// Hook tests
// tests/useClients.test.ts

import { renderHook, act } from "@testing-library/react";
import { useClients } from "../src/hooks/useClients";
import { clientsService } from "../src/services/clientsService";

jest.mock("../src/services/clientsService");

const mockClientsService = clientsService as jest.Mocked<typeof clientsService>;

describe("useClients", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch clients on mount", async () => {
    const mockClients = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: null,
        totalBookings: 1,
        totalSpent: 1000000,
        averageRating: 4.5,
        lastBooking: "2024-06-01",
        status: "active" as const,
        joinDate: "2024-01-01",
      },
    ];

    mockClientsService.getClientsByTourGuide.mockResolvedValue({
      clients: mockClients,
      total: 1,
      page: 1,
      totalPages: 1,
    });

    mockClientsService.getClientStats.mockResolvedValue({
      totalClients: 1,
      activeClients: 1,
      totalBookings: 1,
      averageRating: 4.5,
    });

    const { result } = renderHook(() => useClients("tour-guide-1"));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.clients).toEqual(mockClients);
    expect(result.current.stats?.totalClients).toBe(1);
  });

  it("should handle errors", async () => {
    mockClientsService.getClientsByTourGuide.mockRejectedValue(
      new Error("Network error")
    );

    const { result } = renderHook(() => useClients("tour-guide-1"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.clients).toEqual([]);
  });

  it("should update filters", async () => {
    mockClientsService.getClientsByTourGuide.mockResolvedValue({
      clients: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useClients("tour-guide-1"));

    await act(async () => {
      result.current.updateFilters({ searchTerm: "john", status: "active" });
    });

    expect(mockClientsService.getClientsByTourGuide).toHaveBeenCalledWith(
      "tour-guide-1",
      expect.objectContaining({
        searchTerm: "john",
        status: "active",
      })
    );
  });

  it("should refresh clients", async () => {
    mockClientsService.getClientsByTourGuide.mockResolvedValue({
      clients: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useClients("tour-guide-1"));

    await act(async () => {
      result.current.refreshClients();
    });

    expect(mockClientsService.getClientsByTourGuide).toHaveBeenCalledTimes(2); // Initial + refresh
  });
});

export default {};
