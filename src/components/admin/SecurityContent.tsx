import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Settings,
  UserX,
  Key,
  FileText,
  Bell,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
} from "lucide-react";
import { securityService } from "../../services/securityService";
import { getUserSessions } from "../../services/userSessionsService";
import {
  getSecuritySettings,
  updateSecuritySettings,
  type SecuritySettings,
  type PasswordPolicy,
} from "../../services/securitySettingsService";
import { getSecurityLogsWithUsers } from "../../services/securityLogsWithUserService";

interface SecurityLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "warning";
  details: string;
  email?: string | null;
  role?: string | null;
}

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
  location?: string;
}

// Helper untuk konversi waktu ke WIB (UTC+7)
function toWIBString(date: Date) {
  return date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
}

const SecurityContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sessions" | "logs" | "policies" | "settings"
  >("dashboard");
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 120,
    requireTwoFactor: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expirationDays: 90,
      preventReuse: 5,
    },
    auditLogRetention: 365,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "success" | "failed" | "warning"
  >("all");
  const [isLoading, setIsLoading] = useState(false); // Fetch data from Supabase
  useEffect(() => {
    setIsLoading(true);
    // Fetch security logs with user info
    getSecurityLogsWithUsers()
      .then((logs) => {
        // Adapt Supabase data to SecurityLog interface
        const adaptedLogs = logs.map((log) => ({
          id: log.id,
          timestamp: new Date(log.created_at),
          userId: log.user_id || "",
          userName:
            log.full_name ||
            log.username ||
            log.email ||
            `User ID: ${log.user_id}`,
          action: log.action,
          ipAddress: log.ip_address,
          userAgent: log.user_agent,
          status: log.status,
          details: log.details,
          email: log.email,
          role: log.role,
        }));
        setSecurityLogs(adaptedLogs);
      })
      .catch(console.error);

    // Fetch user sessions
    getUserSessions()
      .then((sessions) => {
        const adaptedSessions = sessions.map((session) => ({
          id: session.id.toString(),
          userId: session.user_id?.toString() || "",
          userName: session.user_id ? `User ${session.user_id}` : "", // Ganti jika ingin ambil nama user
          ipAddress: session.ip_address,
          userAgent: session.user_agent,
          loginTime: new Date(session.login_time),
          lastActivity: new Date(session.last_activity),
          isActive: session.is_active,
          location: session.location || "",
        }));
        setUserSessions(adaptedSessions);
      })
      .catch(console.error);

    // Fetch security settings
    getSecuritySettings()
      .then((settings) => {
        setSecuritySettings(settings);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false)); // Mock data sudah tidak diperlukan karena menggunakan data dari Supabase
  }, []);

  const handleTerminateSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUserSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, isActive: false } : session
        )
      );
    } catch (error) {
      console.error("Failed to terminate session:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateSecuritySettings = async () => {
    setIsLoading(true);
    try {
      // Save to Supabase
      const success = await updateSecuritySettings(securitySettings);

      if (success) {
        // Log the security setting change
        import("../../services/securityLogger").then(({ securityLogger }) => {
          // Assuming we have access to user info and client info in a real app
          // In a real app, you would get these values from auth context
          const userId = "1"; // Example user ID
          const ipAddress = "127.0.0.1"; // Example IP
          const userAgent = navigator.userAgent;

          securityLogger.securitySettingChange(
            userId,
            ipAddress,
            userAgent,
            "Global Security Settings"
          );
        });

        alert("Security settings updated successfully");
      } else {
        throw new Error("Failed to update settings in database");
      }
    } catch (error) {
      console.error("Failed to update security settings:", error);
      alert("Failed to update security settings");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = securityLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    const matchesFilter = filterStatus === "all" || log.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Sessions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {userSessions.filter((s) => s.isActive).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {userSessions.length} total sessions
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Failed Logins (24h)
              </p>
              <p className="text-2xl font-bold text-red-600">
                {
                  securityLogs.filter(
                    (log) =>
                      log.status === "failed" && log.action.includes("Login")
                  ).length
                }
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">+2 from yesterday</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Security Events
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {securityLogs.filter((log) => log.status === "warning").length}
              </p>
            </div>
            <Bell className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-green-600">Secure</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">All systems operational</p>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Security Events
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {securityLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                {getStatusIcon(log.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {log.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {toWIBString(log.timestamp)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {log.userName} • {log.ipAddress}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Active User Sessions
            </h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Login Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userSessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {session.userName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.userAgent}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.location || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {toWIBString(session.loginTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {toWIBString(session.lastActivity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {session.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {session.isActive && (
                      <button
                        onClick={() => handleTerminateSession(session.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Security Audit Logs
            </h3>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as "all" | "success" | "failed" | "warning"
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusIcon(log.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {toWIBString(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.userName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.email && <span className="mr-2">{log.email}</span>}
                      {log.role && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                          {log.role}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Password Policy Configuration
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={securitySettings.passwordPolicy.minLength}
                onChange={(e) =>
                  setSecuritySettings((prev) => ({
                    ...prev,
                    passwordPolicy: {
                      ...prev.passwordPolicy,
                      minLength: parseInt(e.target.value),
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="6"
                max="64"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordPolicy.requireUppercase}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireUppercase: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Require uppercase letters
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordPolicy.requireLowercase}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireLowercase: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Require lowercase letters
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordPolicy.requireNumbers}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireNumbers: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Require numbers</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={
                      securitySettings.passwordPolicy.requireSpecialChars
                    }
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireSpecialChars: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Require special characters
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Expiration (days)
                </label>
                <input
                  type="number"
                  value={securitySettings.passwordPolicy.expirationDays}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        expirationDays: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="365"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prevent Password Reuse (last N passwords)
                </label>
                <input
                  type="number"
                  value={securitySettings.passwordPolicy.preventReuse}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        preventReuse: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Security Settings
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Login Attempts
                </label>
                <input
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      maxLoginAttempts: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      lockoutDuration: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="5"
                  max="1440"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      sessionTimeout: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="15"
                  max="480"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audit Log Retention (days)
                </label>
                <input
                  type="number"
                  value={securitySettings.auditLogRetention}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      auditLogRetention: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="30"
                  max="2555"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={securitySettings.requireTwoFactor}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      requireTwoFactor: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Require Two-Factor Authentication for all users
                </span>
              </label>
            </div>

            <div className="pt-6 border-t">
              <button
                onClick={handleUpdateSecuritySettings}
                disabled={isLoading}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Saving..." : "Save Security Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Security Management
        </h1>
        <p className="text-gray-600">
          Manage application security, monitor user activities, and configure
          security policies.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "dashboard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sessions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Sessions</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "logs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Logs</span>
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "policies"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Policies</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "sessions" && renderSessions()}
      {activeTab === "logs" && renderLogs()}
      {activeTab === "policies" && renderPolicies()}
      {activeTab === "settings" && renderSettings()}
    </div>
  );
};

export default SecurityContent;
