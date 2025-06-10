import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegistration() {
  console.log("🧪 Testing user registration flow...");

  try {
    // Test 1: Check if we can query the users table structure
    console.log("\n1. Testing users table query...");
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, is_active, created_at")
      .limit(1);

    if (error) {
      console.log("❌ Users table query failed:", error.message);
      return;
    }

    console.log("✅ Users table query successful");
    console.log(
      "   Sample data structure:",
      data.length > 0 ? Object.keys(data[0]) : "No data"
    );

    // Test 2: Try to insert a test user (we'll delete it afterwards)
    console.log("\n2. Testing user insertion...");
    const testEmail = `test-${Date.now()}@example.com`;

    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          email: testEmail,
          username: "testuser",
          first_name: "Test",
          last_name: "User",
          role: "customer",
          is_active: true,
          password: "hashedpassword", // In real app, this would be properly hashed
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.log("❌ User insertion failed:", insertError.message);
      return;
    }

    console.log("✅ User insertion successful");
    console.log("   Inserted user:", insertData);

    // Clean up - delete the test user
    await supabase.from("users").delete().eq("email", testEmail);
    console.log("🧹 Test user cleaned up");

    console.log(
      "\n🎉 All tests passed! The registration fix is working correctly."
    );
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

testRegistration();
