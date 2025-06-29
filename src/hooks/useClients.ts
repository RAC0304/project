// src/hooks/useClients.ts
import { useState, useEffect, useCallback } from "react";
import {
  clientsService,
  type ClientData,
  type ClientStats,
  type ClientFilters,
} from "../services/clientsService";

interface UseClientsReturn {
  clients: ClientData[];
  stats: ClientStats | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
  refreshClients: () => void;
  updateFilters: (filters: ClientFilters) => void;
  getClientDetails: (clientId: string) => Promise<unknown>;
  sendMessage: (clientId: string, message: string) => Promise<void>;
}

export const useClients = (tourGuideUserId: string): UseClientsReturn => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClientFilters>({
    searchTerm: "",
    status: "all",
    page: 1,
    limit: 10,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const fetchClients = useCallback(async () => {
    if (!tourGuideUserId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await clientsService.getClientsByTourGuideUserId(
        tourGuideUserId,
        filters
      );
      setClients(result.clients || []);
      setCurrentPage(result.page || 1);
      setTotalPages(result.totalPages || 1);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [tourGuideUserId, filters]);

  const fetchStats = useCallback(async () => {
    if (!tourGuideUserId) return;

    try {
      const clientStats = await clientsService.getClientStatsByUserId(tourGuideUserId);
      setStats(clientStats);
    } catch (err) {
      console.error("Failed to fetch client stats:", err);
      // Don't set error state for stats as it's not critical
    }
  }, [tourGuideUserId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshClients = useCallback(() => {
    fetchClients();
    fetchStats();
  }, [fetchClients, fetchStats]);

  const updateFilters = useCallback((newFilters: ClientFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1, // Reset to page 1 when filters change (except when explicitly setting page)
    }));
  }, []); const getClientDetails = useCallback(
    async (clientId: string) => {
      try {
        return await clientsService.getClientDetailsByUserId(clientId, tourGuideUserId);
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to fetch client details"
        );
      }
    },
    [tourGuideUserId]
  );

  const sendMessage = useCallback(
    async (clientId: string, message: string) => {
      try {
        await clientsService.sendMessageToClientByUserId(
          clientId,
          tourGuideUserId,
          message
        );
        // In a real app, you might want to show a success notification here
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to send message"
        );
      }
    },
    [tourGuideUserId]
  );

  return {
    clients,
    stats,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    refreshClients,
    updateFilters,
    getClientDetails,
    sendMessage,
  };
};

export default useClients;
