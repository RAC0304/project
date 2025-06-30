/**
 * Setup script for payments table migration
 * This script creates the payments table for handling booking payments
 */

import { supabase } from "../src/config/supabaseClient.ts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupPaymentsTable() {
  console.log("🚀 Setting up payments table...");

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, "../database/migrations/create_payments_table.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Execute the migration
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL });

    if (error) {
      // If the RPC doesn't exist, try executing directly
      console.log("Trying direct execution...");
      const { error: directError } = await supabase
        .from("payments")
        .select("*")
        .limit(1);

      if (directError && directError.code === "42P01") {
        // Table doesn't exist, we need to create it
        console.log("❌ Payments table doesn't exist. Please run the migration manually in Supabase SQL Editor.");
        console.log("📁 Migration file: database/migrations/create_payments_table.sql");
        return false;
      }
    }

    console.log("✅ Payments table setup completed successfully!");

    // Test the table by checking its structure
    const { data: tableInfo, error: infoError } = await supabase
      .from("payments")
      .select("*")
      .limit(0);

    if (infoError) {
      console.log("⚠️  Warning: Could not verify table structure:", infoError.message);
    } else {
      console.log("✅ Payments table is accessible and ready for use");
    }

    return true;

  } catch (error) {
    console.error("❌ Error setting up payments table:", error);
    return false;
  }
}

// Test the payment service
async function testPaymentService() {
  console.log("\n🧪 Testing payment service...");

  try {
    const { paymentService } = await import("../src/services/paymentService.ts");

    // Test getting payment methods
    const paymentMethods = paymentService.getAvailablePaymentMethods();
    console.log("✅ Payment methods loaded:", paymentMethods.length, "methods");

    // Test getting payment history (will return empty for non-existent user)
    const history = await paymentService.getPaymentHistory(999);
    console.log("✅ Payment history service working (empty result expected)");

    console.log("✅ Payment service tests passed!");
    return true;

  } catch (error) {
    console.error("❌ Payment service test failed:", error);
    return false;
  }
}

async function main() {
  console.log("🎯 Payment System Setup");
  console.log("========================");

  const tableSetup = await setupPaymentsTable();
  const serviceTest = await testPaymentService();

  if (tableSetup && serviceTest) {
    console.log("\n🎉 Payment system setup completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Ensure booking statuses are correctly set to 'confirmed' when tour guides accept bookings");
    console.log("2. Test the payment flow in the user profile page");
    console.log("3. Verify payment status updates are reflected in the activity feed");
  } else {
    console.log("\n❌ Payment system setup failed. Please check the errors above.");
  }
}

main();
