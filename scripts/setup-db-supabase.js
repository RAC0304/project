import { Pool } from "pg";
import fs from "fs";
import path from "path";

async function setupDatabase() {
  console.log("🚀 Setting up WanderWise database schema on Supabase...");

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
    const client = await pool.connect();
    console.log("✅ Connected to Supabase database successfully!");

    // Read SQL schema file
    const sqlFilePath = path.join(
      process.cwd(),
      "database",
      "wanderwise_supabase.sql"
    );

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }

    console.log("📄 Reading SQL schema file...");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

    // Split into individual statements (handle PostgreSQL functions properly)
    const statements = [];
    let currentStatement = "";
    let inFunction = false;
    let dollarTagStack = [];

    const lines = sqlContent.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("--")) {
        continue;
      }

      currentStatement += line + "\n";

      // Check for dollar-quoted strings (PostgreSQL functions)
      const dollarMatches = trimmedLine.match(/\$([^$]*)\$/g);
      if (dollarMatches) {
        for (const match of dollarMatches) {
          if (
            dollarTagStack.length > 0 &&
            dollarTagStack[dollarTagStack.length - 1] === match
          ) {
            // Closing tag
            dollarTagStack.pop();
            if (dollarTagStack.length === 0) {
              inFunction = false;
            }
          } else if (
            dollarTagStack.length === 0 ||
            !dollarTagStack.includes(match)
          ) {
            // Opening tag
            dollarTagStack.push(match);
            inFunction = true;
          }
        }
      }

      // If we're not in a function and line ends with semicolon, it's end of statement
      if (!inFunction && trimmedLine.endsWith(";")) {
        const statement = currentStatement.trim();
        if (statement && statement !== ";") {
          statements.push(statement);
        }
        currentStatement = "";
      }
    }

    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`📝 Found ${statements.length} SQL statements to execute...`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements
      if (!statement.trim()) continue;

      // Add semicolon if not present (except for statements that already end with it)
      const finalStatement = statement.endsWith(";")
        ? statement
        : statement + ";";

      try {
        await client.query(finalStatement);
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
          console.error(`📄 Statement: ${finalStatement.substring(0, 100)}...`);
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
      console.log(`\n👤 Found ${adminCount} admin user(s)`);      } else {
      console.log("\n⚠️  No admin users found. Creating default admin...");

      try {
        await client.query(`
          INSERT INTO users (username, first_name, last_name, email, password, role) 
          VALUES ('admin', 'Admin', 'User', 'admin@wanderwise.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
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
    console.error("❌ Supabase database setup failed:");
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
      console.log("\n🎉 Supabase database setup completed successfully!");
      console.log("✨ Your WanderWise database is ready to use!");
      process.exit(0);
    } else {
      console.log("\n💥 Supabase database setup failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  });
