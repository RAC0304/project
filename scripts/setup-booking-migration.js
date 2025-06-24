const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  console.error(
    "Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runBookingMigration() {
  try {
    console.log("Running booking migration...");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "..",
      "database",
      "booking_migration.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Execute the migration
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: migrationSQL,
    });

    if (error) {
      console.error("Migration failed:", error);
      process.exit(1);
    }

    console.log("✅ Booking migration completed successfully!");
    console.log("The following changes have been applied:");
    console.log("- Added customer contact fields to bookings table");
    console.log("- Created booking_status and payment_status enums");
    console.log("- Added indexes for better performance");
    console.log("- Set up Row Level Security policies");
    console.log("- Created helper function for tour guide bookings");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

// Alternative method if exec_sql doesn't exist
async function runMigrationAlternative() {
  try {
    console.log("Running booking migration using alternative method...");

    // Test connection first
    const { data: test, error: testError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("Database connection failed:", testError);
      process.exit(1);
    }

    console.log("✅ Database connection successful");
    console.log("🔄 Manual migration required:");
    console.log(
      "Please run the SQL commands in database/booking_migration.sql manually in your Supabase SQL editor"
    );

    const migrationPath = path.join(
      __dirname,
      "..",
      "database",
      "booking_migration.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("\n📄 Migration SQL:");
    console.log("----------------------------------------");
    console.log(migrationSQL);
    console.log("----------------------------------------");
  } catch (error) {
    console.error("Migration check error:", error);
  }
}

// Run migration
if (require.main === module) {
  runBookingMigration().catch(() => {
    console.log("\nTrying alternative method...");
    runMigrationAlternative();
  });
}

module.exports = { runBookingMigration, runMigrationAlternative };
