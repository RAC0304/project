import { Pool } from "pg";

async function testDatabaseConnection() {
  console.log("🔗 Testing Neon PostgreSQL connection...");

  // Get DATABASE_URL from environment
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_TrJuZ49BYagU@ep-noisy-sun-a8x2dh09-pooler.eastus2.azure.neon.tech/wanderwise?sslmode=require";

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
    console.log("✅ Successfully connected to Neon PostgreSQL!");

    // Test a simple query
    const result = await client.query(
      "SELECT NOW() as current_time, version() as pg_version"
    );
    const { current_time, pg_version } = result.rows[0];

    console.log("📅 Server time:", current_time);
    console.log(
      "🗄️  PostgreSQL version:",
      pg_version.split(" ")[0] + " " + pg_version.split(" ")[1]
    );

    // Check if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log("📋 Existing tables:");
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log(
        '⚠️  No tables found. Run "npm run db:setup" to create the schema.'
      );
    }

    // Release client
    client.release();

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error:", error.message);

    if (error.code) {
      console.error("Error Code:", error.code);
    }

    return false;
  } finally {
    await pool.end();
  }
}

// Run the test
testDatabaseConnection()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Database connection test completed successfully!");
      process.exit(0);
    } else {
      console.log("\n💥 Database connection test failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  });
