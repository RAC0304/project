// Test script to check database access
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gsmcojozukrzfkwtevkl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbWNvam96dWtyemZrd3RldmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAwNTgsImV4cCI6MjA2NTExNjA1OH0.yOb-a-QUeuPGD5jZqg4wc7cOkMlLaHFVQKzjYPokbOg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseAccess() {
  console.log("🔍 Testing database access to Supabase...");

  try {
    // Test connection by listing tables
    console.log("📋 Checking available tables...");
    const { data: tables, error: tablesError } = await supabase
      .from("pg_catalog.pg_tables")
      .select("tablename")
      .eq("schemaname", "public");

    if (tablesError) {
      console.error("❌ Error listing tables:", tablesError);
      return;
    }

    console.log(
      "📊 Available tables:",
      tables.map((t) => t.tablename)
    );

    // Check if users table exists
    const usersTableExists = tables.some((t) => t.tablename === "users");
    console.log(
      `👤 Users table exists: ${usersTableExists ? "✅ Yes" : "❌ No"}`
    );

    if (usersTableExists) {
      // Try to get a row count from users table
      console.log("🧮 Checking if we can query the users table...");
      const { data: usersCount, error: usersError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (usersError) {
        console.error("❌ Error accessing users table:", usersError);
      } else {
        console.log(
          `✅ Successfully accessed users table. Count: ${
            usersCount?.length || 0
          }`
        );

        // Test specific database operations
        const testEmail = `test_${Date.now()}@example.com`;
        console.log(`🧪 Testing insert operation with email: ${testEmail}`);

        const { data: insertData, error: insertError } = await supabase
          .from("users")
          .insert([
            {
              email: testEmail,
              username: `testuser_${Date.now()}`,
              password: "hashedpassword123",
              first_name: "Test",
              last_name: "User",
              role: "customer",
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select("*");

        if (insertError) {
          console.error("❌ Insert test failed:", insertError);
        } else {
          console.log("✅ Insert test successful:", insertData);

          // Clean up test data
          const { error: deleteError } = await supabase
            .from("users")
            .delete()
            .eq("email", testEmail);

          if (deleteError) {
            console.error("❗ Could not clean up test data:", deleteError);
          } else {
            console.log("🧹 Test data cleaned up successfully");
          }
        }
      }
    }

    console.log("✅ Database access test completed");
  } catch (error) {
    console.error("❌ Unexpected error during database test:", error);
  }
}

testDatabaseAccess();
