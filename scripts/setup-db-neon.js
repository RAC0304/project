import { Pool } from "pg";
import fs from "fs";
import path from "path";

async function setupDatabase() {
  console.log("🚀 Setting up WanderWise database schema...");

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
    const client = await pool.connect();
    console.log("✅ Connected to database successfully!");

    // Read SQL schema file
    const sqlFilePath = path.join(
      process.cwd(),
      "database",
      "wanderwise_neon.sql"
    );

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }

    console.log("📄 Reading SQL schema file...");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

    // Split into individual statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--") && stmt !== "");

    console.log(`📝 Found ${statements.length} SQL statements to execute...`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";";

      try {
        await client.query(statement);
        successCount++;

        // Show progress every 10 statements
        if ((i + 1) % 10 === 0) {
          console.log(
            `⏳ Progress: ${i + 1}/${statements.length} statements executed`
          );
        }
      } catch (error) {
        // Some errors are expected (like "already exists")
        if (
          error.message.includes("already exists") ||
          error.message.includes("does not exist") ||
          error.message.includes("duplicate key")
        ) {
          console.log(
            `⚠️  Warning (${i + 1}): ${error.message.split("\n")[0]}`
          );
        } else {
          console.error(`❌ Error (${i + 1}): ${error.message.split("\n")[0]}`);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Execution Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${statements.length}`);

    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log("\n📋 Created tables:");
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
    }

    // Check for admin user
    const adminCheck = await client.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    const adminCount = parseInt(adminCheck.rows[0].count);

    if (adminCount > 0) {
      console.log(`\n👤 Found ${adminCount} admin user(s)`);
    } else {
      console.log("\n⚠️  No admin users found. Creating default admin...");

      try {
        await client.query(`
          INSERT INTO users (name, email, password, role) 
          VALUES ('Admin', 'admin@wanderwise.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
          ON CONFLICT (email) DO NOTHING
        `);
        console.log("✅ Default admin user created");
      } catch (error) {
        console.log("⚠️  Could not create admin user:", error.message);
      }
    }

    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database setup failed:");
    console.error("Error:", error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Database setup completed successfully!");
      console.log("✨ Your WanderWise database is ready to use!");
      process.exit(0);
    } else {
      console.log("\n💥 Database setup failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  });
