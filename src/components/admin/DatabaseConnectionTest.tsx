import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
} from "lucide-react";

interface DatabaseStats {
  users: number;
  tourGuides: number;
  destinations: number;
  tours: number;
  bookings: number;
  reviews: number;
  poolStatus: {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  };
}

const DatabaseConnectionTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(
    null
  );
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call to your backend
      // For demo purposes, we'll simulate the connection test

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful connection
      setConnectionStatus(true);

      // Mock database stats
      setStats({
        users: 15,
        tourGuides: 8,
        destinations: 25,
        tours: 32,
        bookings: 127,
        reviews: 89,
        poolStatus: {
          totalCount: 10,
          idleCount: 8,
          waitingCount: 0,
        },
      });
    } catch (err) {
      setConnectionStatus(false);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test connection on component mount
    testConnection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Database Connection
              </h2>
              <p className="text-gray-600">
                Test your Neon PostgreSQL connection
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              {isLoading ? "Testing..." : "Test Connection"}
            </button>

            {connectionStatus !== null && (
              <div className="flex items-center gap-2">
                {connectionStatus ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">
                      Connected
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">
                      Connection Failed
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Database Stats */}
          {stats && connectionStatus && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Database Statistics
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {stats.users}
                  </div>
                  <div className="text-blue-600 text-sm">Users</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {stats.tourGuides}
                  </div>
                  <div className="text-green-600 text-sm">Tour Guides</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">
                    {stats.destinations}
                  </div>
                  <div className="text-purple-600 text-sm">Destinations</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">
                    {stats.tours}
                  </div>
                  <div className="text-orange-600 text-sm">Tours</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <div className="text-2xl font-bold text-indigo-700">
                    {stats.bookings}
                  </div>
                  <div className="text-indigo-600 text-sm">Bookings</div>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <div className="text-2xl font-bold text-pink-700">
                    {stats.reviews}
                  </div>
                  <div className="text-pink-600 text-sm">Reviews</div>
                </div>
              </div>

              {/* Connection Pool Status */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">
                  Connection Pool Status
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Connections:</span>
                    <span className="font-medium ml-2">
                      {stats.poolStatus.totalCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Idle:</span>
                    <span className="font-medium ml-2">
                      {stats.poolStatus.idleCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Waiting:</span>
                    <span className="font-medium ml-2">
                      {stats.poolStatus.waitingCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Setup Instructions
            </h4>
            <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
              <li>Create a Neon PostgreSQL database</li>
              <li>Copy your connection string</li>
              <li>
                Update the{" "}
                <code className="bg-blue-100 px-1 rounded">.env</code> file with
                your database credentials
              </li>
              <li>
                Run{" "}
                <code className="bg-blue-100 px-1 rounded">
                  npm run db:setup
                </code>{" "}
                to create tables
              </li>
              <li>Test the connection using the button above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionTest;
