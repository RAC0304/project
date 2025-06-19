import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  Table,
  HardDrive,
} from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

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

interface TableData {
  name: string;
  rowCount: number;
}

interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  created_at: string;
  updated_at: string;
}

const DatabaseConnectionTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(
    null
  );
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableRows, setTableRows] = useState<Record<string, unknown>[]>([]);
  const [storageStatus, setStorageStatus] = useState<{
    success: boolean;
    message: string;
    buckets?: StorageBucket[];
  } | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    setTables([]);
    setSelectedTable("");
    setTableRows([]);
    setStorageStatus(null);
    try {
      // Test Supabase connection by querying the users table
      const { error: userError } = await supabase
        .from("users")
        .select("count")
        .single();

      if (userError) throw userError;

      setConnectionStatus(true);

      // Fetch key tables and their counts
      await fetchDatabaseStats();

      // Fetch available tables
      await fetchTables();

      // Check storage
      await checkStorage();
    } catch (err) {
      console.error("Connection error:", err);
      setConnectionStatus(false);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDatabaseStats = async () => {
    try {
      // Run multiple count queries in parallel
      const [
        usersResult,
        tourGuidesResult,
        destinationsResult,
        toursResult,
        bookingsResult,
        reviewsResult,
      ] = await Promise.all([
        supabase.from("users").select("count", { count: "exact", head: true }),
        supabase
          .from("tour_guides")
          .select("count", { count: "exact", head: true }),
        supabase
          .from("destinations")
          .select("count", { count: "exact", head: true }),
        supabase.from("tours").select("count", { count: "exact", head: true }),
        supabase
          .from("bookings")
          .select("count", { count: "exact", head: true }),
        supabase
          .from("reviews")
          .select("count", { count: "exact", head: true }),
      ]);

      // Set the stats
      setStats({
        users: usersResult.count || 0,
        tourGuides: tourGuidesResult.count || 0,
        destinations: destinationsResult.count || 0,
        tours: toursResult.count || 0,
        bookings: bookingsResult.count || 0,
        reviews: reviewsResult.count || 0,
        poolStatus: {
          totalCount: 10, // These are not usually accessible via client API
          idleCount: 8, // Using placeholder values
          waitingCount: 0,
        },
      });
    } catch (err) {
      console.error("Error fetching database stats:", err);
      // Don't throw - we'll still show partial UI even if stats fail
    }
  };

  const fetchTables = async () => {
    try {
      // List of important tables to check
      const tableNames = [
        "users",
        "tour_guides",
        "destinations",
        "tours",
        "bookings",
        "reviews",
        "attractions",
        "activities",
        "itineraries",
      ];

      // Fetch row counts for each table
      const tableData: TableData[] = [];

      for (const tableName of tableNames) {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select("*", { count: "exact", head: true });

          if (!error) {
            tableData.push({
              name: tableName,
              rowCount: count || 0,
            });
          }
        } catch (tableError) {
          console.warn(`Error fetching ${tableName}:`, tableError);
          // Skip this table but continue with others
        }
      }

      setTables(tableData);
    } catch (err) {
      console.error("Error fetching tables:", err);
      // Don't throw - we'll still show partial UI
    }
  };

  const fetchTableData = async (tableName: string) => {
    if (!tableName) return;

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(5);

      if (error) throw error;
      setTableRows(data || []);
    } catch (err) {
      console.error(`Error fetching ${tableName} data:`, err);
      setTableRows([]);
    }
  };

  const checkStorage = async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        setStorageStatus({
          success: false,
          message: `Storage error: ${error.message}`,
        });
        return;
      }

      setStorageStatus({
        success: true,
        message: `Found ${data.length} storage buckets`,
        buckets: data,
      });
    } catch (err) {
      console.error("Storage error:", err);
      setStorageStatus({
        success: false,
        message: err instanceof Error ? err.message : "Unknown storage error",
      });
    }
  };

  const handleTableSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tableName = e.target.value;
    setSelectedTable(tableName);
    if (tableName) {
      fetchTableData(tableName);
    } else {
      setTableRows([]);
    }
  };
  useEffect(() => {
    // Auto-test connection on component mount
    testConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              {" "}
              <h2 className="text-2xl font-bold text-gray-900">
                Supabase Database Connection
              </h2>
              <p className="text-gray-600">
                Test your Supabase PostgreSQL connection and explore data
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

              {/* Tables Explorer */}
              {tables.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Table className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tables Explorer
                    </h3>
                  </div>

                  <div className="mb-4">
                    <select
                      value={selectedTable}
                      onChange={handleTableSelect}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select a table to preview</option>
                      {tables.map((table) => (
                        <option key={table.name} value={table.name}>
                          {table.name} ({table.rowCount} rows)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTable && tableRows.length > 0 && (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full table-auto">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(tableRows[0]).map((key) => (
                              <th
                                key={key}
                                className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((row, i) => (
                            <tr
                              key={i}
                              className={
                                i % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              {Object.values(row).map((value, j) => (
                                <td
                                  key={j}
                                  className="p-2 text-sm text-gray-900"
                                >
                                  {typeof value === "object"
                                    ? JSON.stringify(value).substring(0, 40) +
                                      (JSON.stringify(value).length > 40
                                        ? "..."
                                        : "")
                                    : String(value !== null ? value : "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedTable && tableRows.length === 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">
                        No data found in table {selectedTable}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Storage Status */}
              {storageStatus && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HardDrive className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Storage Status
                    </h3>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      storageStatus.success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p
                      className={`${
                        storageStatus.success
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {storageStatus.message}
                    </p>

                    {storageStatus.buckets &&
                      storageStatus.buckets.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium text-gray-800 mb-1">
                            Available buckets:
                          </p>
                          <ul className="list-disc pl-5 space-y-1">
                            {storageStatus.buckets.map((bucket) => (
                              <li
                                key={bucket.id}
                                className="text-sm text-gray-700"
                              >
                                {bucket.name}{" "}
                                {bucket.public ? "(public)" : "(private)"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Setup Instructions
            </h4>{" "}
            <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
              <li>Create a Supabase project at https://supabase.com</li>
              <li>
                Copy your Supabase URL and anon key to your environment
                variables
              </li>
              <li>
                Update the{" "}
                <code className="bg-blue-100 px-1 rounded">.env</code> file
                with:
                <pre className="mt-1 p-2 bg-blue-100 rounded font-mono text-xs overflow-x-auto">
                  VITE_SUPABASE_URL=your_supabase_url
                  <br />
                  VITE_SUPABASE_ANON_KEY=your_anon_key
                </pre>
              </li>
              <li>
                Run{" "}
                <code className="bg-blue-100 px-1 rounded">
                  npm run db:setup
                </code>{" "}
                to initialize tables using the schema
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
