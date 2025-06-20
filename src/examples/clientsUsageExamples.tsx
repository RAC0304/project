// Example usage of the Clients backend implementation

import React from "react";
import { ClientsContent } from "./components/tourguide/dashboard/ClientsContent";
import { useClients } from "./hooks/useClients";
import { clientsService } from "./services/clientsService";

// 1. Basic Usage - Using the complete ClientsContent component
export const TourGuideDashboard: React.FC = () => {
  const tourGuideId = "tg-123"; // Get from auth context or props

  return (
    <div className="dashboard">
      <h1>Tour Guide Dashboard</h1>
      <ClientsContent tourGuideId={tourGuideId} />
    </div>
  );
};

// 2. Advanced Usage - Using the hook directly for custom UI
export const CustomClientsView: React.FC = () => {
  const tourGuideId = "tg-123";
  const {
    clients,
    stats,
    loading,
    error,
    refreshClients,
    updateFilters,
    getClientDetails,
  } = useClients(tourGuideId);

  const handleSearch = (searchTerm: string) => {
    updateFilters({ searchTerm, page: 1 });
  };

  const handleStatusFilter = (status: "all" | "active" | "inactive") => {
    updateFilters({ status, page: 1 });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="custom-clients-view">
      {/* Custom search */}
      <input
        type="text"
        placeholder="Search clients..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Custom filter */}
      <select onChange={(e) => handleStatusFilter(e.target.value as any)}>
        <option value="all">All Clients</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Stats */}
      <div className="stats-grid">
        <div>Total: {stats?.totalClients}</div>
        <div>Active: {stats?.activeClients}</div>
        <div>Bookings: {stats?.totalBookings}</div>
        <div>Rating: {stats?.averageRating}</div>
      </div>

      {/* Clients list */}
      <div className="clients-grid">
        {clients.map((client) => (
          <div key={client.id} className="client-card">
            <h3>{client.name}</h3>
            <p>{client.email}</p>
            <p>Bookings: {client.totalBookings}</p>
            <p>Status: {client.status}</p>
            <button onClick={() => getClientDetails(client.id)}>
              View Details
            </button>
          </div>
        ))}
      </div>

      <button onClick={refreshClients}>Refresh</button>
    </div>
  );
};

// 3. Service Usage - Direct service calls
export const ClientsServiceExample = {
  // Get clients with filtering
  async getFilteredClients(tourGuideId: string) {
    try {
      const result = await clientsService.getClientsByTourGuide(tourGuideId, {
        searchTerm: "john",
        status: "active",
        page: 1,
        limit: 10,
      });

      console.log("Clients:", result.clients);
      console.log("Total pages:", result.totalPages);
      return result;
    } catch (error) {
      console.error("Failed to get clients:", error);
    }
  },

  // Get client statistics
  async getStats(tourGuideId: string) {
    try {
      const stats = await clientsService.getClientStats(tourGuideId);
      console.log("Client stats:", stats);
      return stats;
    } catch (error) {
      console.error("Failed to get stats:", error);
    }
  },

  // Get detailed client info
  async getClientInfo(clientId: string, tourGuideId: string) {
    try {
      const details = await clientsService.getClientDetails(
        clientId,
        tourGuideId
      );
      console.log("Client details:", details);
      return details;
    } catch (error) {
      console.error("Failed to get client details:", error);
    }
  },

  // Send message to client
  async sendMessage(clientId: string, tourGuideId: string, message: string) {
    try {
      const result = await clientsService.sendMessageToClient(
        clientId,
        tourGuideId,
        message
      );
      console.log("Message sent:", result);
      return result;
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  },
};

// 4. Integration with Authentication Context
export const AuthenticatedClientsView: React.FC = () => {
  // Assuming you have auth context
  const { user } = useAuth(); // Your auth hook
  const tourGuideId = user?.tourGuideProfile?.id;

  if (!tourGuideId) {
    return <div>Please complete your tour guide profile</div>;
  }

  return <ClientsContent tourGuideId={tourGuideId} />;
};

// 5. Error Handling Example
export const RobustClientsView: React.FC = () => {
  const tourGuideId = "tg-123";
  const { clients, loading, error, refreshClients } = useClients(tourGuideId);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    refreshClients();
  };

  if (loading && clients.length === 0) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading your clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Unable to load clients</h2>
        <p>{error}</p>
        <button onClick={handleRetry}>
          Retry {retryCount > 0 && `(${retryCount})`}
        </button>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <h2>No clients yet</h2>
        <p>Start promoting your tours to get your first clients!</p>
        <button onClick={refreshClients}>Refresh</button>
      </div>
    );
  }

  return (
    <div>
      <ClientsContent tourGuideId={tourGuideId} />
    </div>
  );
};

// 6. Performance Optimized Version
export const OptimizedClientsView: React.FC = () => {
  const tourGuideId = "tg-123";
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Debounce search to reduce API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { clients, loading, updateFilters } = useClients(tourGuideId);

  // Update filters when debounced search term changes
  React.useEffect(() => {
    updateFilters({ searchTerm: debouncedSearchTerm, page: 1 });
  }, [debouncedSearchTerm, updateFilters]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search clients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <div>Searching...</div>}

      <div className="clients-list">
        {clients.map((client) => (
          <div key={client.id}>{client.name}</div>
        ))}
      </div>
    </div>
  );
};

export default {
  TourGuideDashboard,
  CustomClientsView,
  ClientsServiceExample,
  AuthenticatedClientsView,
  RobustClientsView,
  OptimizedClientsView,
};
