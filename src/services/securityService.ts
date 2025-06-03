// Security Service for API calls

// Security types interfaces
interface SecurityMetrics {
  activeSessions: number;
  failedLogins: number;
  securityEvents: number;
  systemStatus: string;
}

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
  isActive: boolean;
  location?: string;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "warning";
  details: string;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays: number;
  preventReuse: number;
}

interface SecuritySettings {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  requireTwoFactor: boolean;
  passwordPolicy: PasswordPolicy;
  auditLogRetention: number;
}

class SecurityService {
  private baseUrl = "/api/admin/security";

  async getDashboardMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  }

  async getActiveSessions() {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch active sessions");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching active sessions:", error);
      throw error;
    }
  }

  async terminateSession(sessionId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to terminate session");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error terminating session:", error);
      throw error;
    }
  }

  async getAuditLogs(filters?: {
    search?: string;
    status?: string;
    page?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters?.page) params.append("page", filters.page.toString());

      const response = await fetch(
        `${this.baseUrl}/logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  }

  async exportAuditLogs(filters?: { search?: string; status?: string }) {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status && filters.status !== "all")
        params.append("status", filters.status);

      const response = await fetch(
        `${this.baseUrl}/logs/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export audit logs");
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `security_audit_logs_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: "Audit logs exported successfully" };
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      throw error;
    }
  }

  async getSecuritySettings() {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch security settings");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching security settings:", error);
      throw error;
    }
  }

  async updateSecuritySettings(settings: SecuritySettings) {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update security settings");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating security settings:", error);
      throw error;
    }
  }
}

export const securityService = new SecurityService();

// Export types for use in other components
export type {
  SecurityMetrics,
  UserSession,
  SecurityLog,
  PasswordPolicy,
  SecuritySettings,
};
