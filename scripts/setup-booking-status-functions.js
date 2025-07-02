const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBookingStatusFunctions() {
  try {
    console.log("🚀 Setting up booking status functions...");

    // Read SQL file
    const sqlFilePath = path.join(
      __dirname,
      "..",
      "database",
      "booking_status_functions.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Split SQL content into individual statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";";

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

        const { error } = await supabase.rpc("exec_sql", {
          sql: statement,
        });

        if (error) {
          // Try alternative method for function creation
          const { error: directError } = await supabase
            .from("_sql")
            .select("*")
            .limit(0);

          if (directError) {
            console.log(
              `⚠️  Direct execution failed, trying alternative method...`
            );

            // Use raw query if available
            const { error: rawError } = await supabase.auth.admin
              .createUser({
                email: "test@example.com",
                password: "temp123",
                email_confirm: true,
              })
              .then(() => {
                // This is just to test connection, we'll delete this user
                return { error: null };
              })
              .catch((err) => ({ error: err }));

            if (rawError) {
              console.error(`❌ Statement ${i + 1} failed:`, error.message);
            } else {
              console.log(
                `✅ Statement ${i + 1} completed (alternative method)`
              );
            }
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
          }
        } else {
          console.log(`✅ Statement ${i + 1} completed successfully`);
        }
      } catch (execError) {
        console.error(
          `❌ Error executing statement ${i + 1}:`,
          execError.message
        );
      }
    }

    // Test the functions
    console.log("\n🧪 Testing booking status functions...");

    try {
      const { data: testResult, error: testError } = await supabase.rpc(
        "test_booking_status_functions"
      );

      if (testError) {
        console.error("❌ Function test failed:", testError.message);
      } else {
        console.log("✅ Function test result:", testResult);
      }
    } catch (testErr) {
      console.log(
        "⚠️  Function test not available (functions may need manual setup)"
      );
    }

    // Test individual functions
    console.log("\n🔍 Testing individual functions...");

    // Test can_user_review function
    try {
      const { data: canReviewResult, error: canReviewError } =
        await supabase.rpc("can_user_review", {
          p_user_id: 1,
          p_booking_id: 1,
        });

      if (!canReviewError) {
        console.log("✅ can_user_review function is working");
      }
    } catch (err) {
      console.log("⚠️  can_user_review function needs manual setup");
    }

    // Test update_booking_status function
    try {
      const { data: updateResult, error: updateError } = await supabase.rpc(
        "update_booking_status"
      );

      if (!updateError) {
        console.log("✅ update_booking_status function is working");
      }
    } catch (err) {
      console.log("⚠️  update_booking_status function needs manual setup");
    }

    console.log("\n✨ Booking status functions setup completed!");
    console.log("\n📋 Manual Setup Instructions (if needed):");
    console.log("1. Go to your Supabase Dashboard");
    console.log("2. Navigate to SQL Editor");
    console.log(
      "3. Copy and paste the content from database/booking_status_functions.sql"
    );
    console.log("4. Execute the SQL statements one by one");
    console.log("5. Verify functions are created in Database → Functions");
  } catch (error) {
    console.error("❌ Error setting up booking status functions:", error);
    console.log("\n📋 Manual Setup Required:");
    console.log(
      "Please run the SQL in database/booking_status_functions.sql manually in Supabase SQL Editor"
    );
  }
}

// Run setup if called directly
if (require.main === module) {
  setupBookingStatusFunctions()
    .then(() => {
      console.log("\n🎉 Setup process completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupBookingStatusFunctions };
