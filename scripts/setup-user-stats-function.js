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

function showUserStatsFunctionSQL() {
  try {
    const sqlContent = fs.readFileSync(
      path.join(__dirname, "../database/create_user_stats_function.sql"),
      "utf8"
    );
    console.log("\n=== User Stats Function SQL ===");
    console.log("Go to Supabase SQL Editor and run this:");
    console.log("\n" + sqlContent + "\n");
    console.log("=== End of SQL ===\n");
  } catch (err) {
    console.log("\n=== Manual SQL for User Stats Function ===");
    console.log("Go to Supabase SQL Editor and run this:");
    console.log(`
-- Create function to get user account statistics
CREATE OR REPLACE FUNCTION get_user_account_stats(p_user_id bigint)
RETURNS TABLE (
    reviews_written bigint,
    tours_booked bigint,
    places_visited bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(r.review_count, 0) as reviews_written,
        COALESCE(b.booking_count, 0) as tours_booked,
        COALESCE(GREATEST(COALESCE(r.review_count, 0), COALESCE(b.booking_count, 0)), 0) as places_visited
    FROM 
        (SELECT 1) as dummy
    LEFT JOIN (
        SELECT COUNT(*) as review_count
        FROM reviews 
        WHERE user_id = p_user_id
    ) r ON true
    LEFT JOIN (
        SELECT COUNT(*) as booking_count
        FROM bookings 
        WHERE user_id = p_user_id
    ) b ON true;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_account_stats(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_account_stats(bigint) TO anon;
    `);
    console.log("=== End of SQL ===\n");
  }
}

async function createUserStatsFunction() {
  console.log("🔧 Setting up User Stats Function...\n");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("❌ Missing Supabase credentials");
    console.log("The service has fallback logic, but for optimal performance:");
    showUserStatsFunctionSQL();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Test database connection
    console.log("Testing database connection...");
    const { error } = await supabase.from("users").select("id").limit(1);

    if (error) {
      console.log("❌ Database connection error:", error.message);
      showUserStatsFunctionSQL();
      return;
    }

    console.log("✅ Database connection successful");
    console.log("❌ Cannot execute DDL directly through Supabase client.");
    showUserStatsFunctionSQL();

    console.log("📋 Benefits of creating this function:");
    console.log("✅ Faster user stats queries");
    console.log("✅ Single database call instead of multiple");
    console.log("✅ Better performance for user profile page");
    console.log("");
    console.log(
      "📌 Note: The service already has fallback logic, so the profile page will work"
    );
    console.log(
      "   even without this function, but performance will be slower."
    );
  } catch (error) {
    console.error("Error:", error);
    showUserStatsFunctionSQL();
  }
}

createUserStatsFunction();
