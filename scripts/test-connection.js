import { Pool } from "pg";
import dotenv from "dotenv";

async function testDatabaseConnection() {
  console.log("🔗 Testing Supabase PostgreSQL connection...");

  // Get DATABASE_URL from environment
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres.gsmcojozukrzfkwtevkl:wanderwise123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

  console.log("📡 Connecting to:", databaseUrl.replace(/:[^:@]*@/, ":****@"));

  // Configure database connection
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log("✅ Successfully connected to Supabase PostgreSQL!");

    // Test a simple query
    const result = await client.query(
      "SELECT NOW() as current_time, version() as pg_version"
    );
    const { current_time, pg_version } = result.rows[0];

    console.log("⏰ Database time:", current_time);
    console.log("🔧 PostgreSQL version:", pg_version.split(" ")[0]);

    // Test database name and size
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        pg_size_pretty(pg_database_size(current_database())) as database_size
    `);
    const { database_name, database_size } = dbInfo.rows[0];
    console.log("📊 Database:", database_name);
    console.log("💾 Size:", database_size);

    // Check if our tables exist
    const tablesResult = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    const tableCount = tablesResult.rows[0].table_count;
    console.log("📋 Tables found:", tableCount);

    if (tableCount > 0) {
      const tablesList = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
        LIMIT 10
      `);
      console.log("🗂️  Sample tables:");
      tablesList.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
    }

    // Check connection pool status
    console.log("\n🔌 Connection Pool Status:");
    console.log(`   Total connections: ${pool.totalCount}`);
    console.log(`   Idle connections: ${pool.idleCount}`);
    console.log(`   Waiting requests: ${pool.waitingCount}`);

    client.release();
    console.log("\n🎉 Database connection test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error:", error.message);

    if (error.message.includes("password authentication failed")) {
      console.error("\n💡 Troubleshooting tips:");
      console.error("   1. Check your DATABASE_URL in .env file");
      console.error("   2. Verify your Supabase project credentials");
      console.error("   3. Make sure your password is correct");
    } else if (error.message.includes("does not exist")) {
      console.error("\n💡 Troubleshooting tips:");
      console.error("   1. Check if your Supabase project is active");
      console.error("   2. Verify the database URL format");
      console.error("   3. Check your project reference ID");
    }

    return false;
  } finally {
    await pool.end();
  }
}

// Load environment variables
dotenv.config();

// Run the test
testDatabaseConnection()
  .then((success) => {
    if (success) {
      console.log("\n✨ Ready to use Supabase with WanderWise!");
      process.exit(0);
    } else {
      console.log("\n💥 Fix the connection issues and try again.");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  });
