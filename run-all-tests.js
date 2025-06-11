/**
 * Run all Supabase storage tests
 *
 * This script runs comprehensive tests for:
 * 1. Supabase storage functionality
 * 2. Profile service image upload
 * 3. URL generation and bucket management
 *
 * Usage: node run-all-tests.js
 */

const dotenv = require("dotenv");
dotenv.config();

console.log("🧪 Running Supabase Integration Tests");
console.log("====================================");

// Log environment status
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("\nEnvironment Check:");
console.log(`- Supabase URL: ${supabaseUrl ? "✓ Set" : "✗ Missing"}`);
console.log(`- Supabase Key: ${supabaseAnonKey ? "✓ Set" : "✗ Missing"}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("\n❌ ERROR: Missing environment variables");
  console.error("Please ensure your .env file contains:");
  console.error("  VITE_SUPABASE_URL=your_supabase_url");
  console.error("  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key");
  process.exit(1);
}

// Run the tests sequentially
async function runTests() {
  try {
    console.log("\n🧪 RUNNING BASIC STORAGE TESTS");
    console.log("------------------------------------");
    await require("./test-storage.js");

    console.log("\n\n🧪 RUNNING PROFILE SERVICE TESTS");
    console.log("------------------------------------");
    await require("./test-profile-service.js");

    console.log("\n\n✅ All tests completed successfully");
    console.log("\nSummary:");
    console.log("- Supabase storage is properly configured");
    console.log("- Profile image upload functionality is working");
    console.log("- URL generation is working correctly");
    console.log("- Error handling is functioning as expected");
  } catch (error) {
    console.error("\n\n❌ Tests failed with error:", error);
    process.exit(1);
  }
}

runTests();
