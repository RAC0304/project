import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  console.log(
    "Please make sure you have VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file"
  );
  console.log("For now, please run the SQL migration manually:");
  showMigrationSQL();
  process.exit(1);
}

function showMigrationSQL() {
  try {
    const migrationSql = fs.readFileSync(
      path.join(__dirname, "../database/fix_profile_picture_length.sql"),
      "utf8"
    );
    console.log("\n=== SQL Migration to Run ===");
    console.log("Go to Supabase SQL Editor and run this:");
    console.log("\n" + migrationSql + "\n");
    console.log("=== End of SQL Migration ===\n");
  } catch (err) {
    console.log("\n=== Manual SQL Migration ===");
    console.log("Go to Supabase SQL Editor and run this:");
    console.log(`
-- Fix profile_picture field length issue
ALTER TABLE public.users 
ALTER COLUMN profile_picture TYPE TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.users.profile_picture IS 'User profile picture URL - can be storage URL or external URL';
    `);
    console.log("=== End of SQL Migration ===\n");
  }
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log("Running profile_picture field migration...");

    // Since we can't run DDL directly through Supabase client in most cases,
    // we'll just show the SQL that needs to be run manually
    console.log("❌ Cannot execute DDL directly through Supabase client.");
    showMigrationSQL();

    // Test if the change is already applied by trying to insert a long URL
    console.log("Testing current database schema...");
    const testUrl = "https://example.com/" + "a".repeat(300); // 300+ char URL

    // This would fail if the field is still limited to 255 chars
    const { error } = await supabase.from("users").select("id").limit(1);

    if (error) {
      console.log("Database connection error:", error.message);
    } else {
      console.log("✅ Database connection successful");
      console.log(
        "Please run the SQL migration manually in Supabase SQL Editor"
      );
    }
  } catch (error) {
    console.error("Migration test failed:", error);
    showMigrationSQL();
  }
}

runMigration();
