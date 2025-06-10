import { Pool, PoolClient, QueryResult } from "pg";

// Database configuration interface
interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  connectionString?: string;
}

// Query parameter types
type QueryParams = (string | number | boolean | null | Date)[];

// Transaction query interface
interface TransactionQuery {
  text: string;
  params?: QueryParams;
}

class DatabaseService {
  private pool: Pool;
  private static instance: DatabaseService;

  private constructor() {
    // Initialize connection pool
    this.pool = new Pool(this.getConfig());

    // Handle connection errors
    this.pool.on("error", (err) => {
      console.error("Database pool error:", err);
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private getConfig(): DatabaseConfig {
    // Try to get DATABASE_URL first (for Neon)
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      return {
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }, // Required for Neon
      } as DatabaseConfig;
    }

    // Fallback to individual environment variables
    return {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_DATABASE || "wanderwise",
      user: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "",
      ssl: process.env.NODE_ENV === "production",
    };
  }

  // Get a client from the pool
  public async getClient(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      console.error("Error getting database client:", error);
      throw error;
    }
  }
  // Execute a query
  public async query(text: string, params?: QueryParams): Promise<QueryResult> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    } finally {
      client.release();
    }
  }
  // Execute a transaction
  public async transaction(
    queries: TransactionQuery[]
  ): Promise<QueryResult[]> {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      const results: QueryResult[] = [];

      for (const query of queries) {
        const result = await client.query(query.text, query.params);
        results.push(result);
      }

      await client.query("COMMIT");
      return results;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Transaction error:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Test database connection
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query("SELECT NOW()");
      console.log("Database connection successful:", result.rows[0]);
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  }

  // Close all connections
  public async close(): Promise<void> {
    await this.pool.end();
  }

  // Get pool status
  public getPoolStatus() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

export default DatabaseService;
