import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function testAuthentication() {
  console.log("🧪 Testing WanderWise Authentication Integration...");

  // Database connection
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_TrJuZ49BYagU@ep-noisy-sun-a8x2dh09-pooler.eastus2.azure.neon.tech/wanderwise?sslmode=require";

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log("✅ Connected to database successfully!");

    // Test 1: Verify demo users exist
    console.log("\n📋 Test 1: Checking demo users...");
    const usersQuery =
      "SELECT id, name, email, role, is_active FROM users ORDER BY role, email";
    const usersResult = await client.query(usersQuery);

    console.log(`Found ${usersResult.rows.length} users in database:`);
    usersResult.rows.forEach((user) => {
      console.log(
        `  ${user.role.toUpperCase()}: ${user.name} (${user.email}) - ${
          user.is_active ? "Active" : "Inactive"
        }`
      );
    });

    // Test 2: Test password verification
    console.log("\n🔑 Test 2: Testing password verification...");
    const testCredentials = [
      {
        email: "user@wanderwise.com",
        password: "user123",
        expectedRole: "customer",
      },
      {
        email: "guide@wanderwise.com",
        password: "guide123",
        expectedRole: "tour_guide",
      },
      {
        email: "admin@wanderwise.com",
        password: "admin123",
        expectedRole: "admin",
      },
    ];

    for (const cred of testCredentials) {
      const userQuery =
        "SELECT id, name, email, password, role FROM users WHERE email = $1";
      const userResult = await client.query(userQuery, [cred.email]);

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        const isValidPassword = await bcrypt.compare(
          cred.password,
          user.password
        );
        const status = isValidPassword ? "✅" : "❌";
        console.log(
          `  ${status} ${cred.email}: ${
            isValidPassword ? "Password correct" : "Password incorrect"
          }`
        );

        if (user.role !== cred.expectedRole) {
          console.log(
            `    ⚠️  Role mismatch: expected ${cred.expectedRole}, got ${user.role}`
          );
        }
      } else {
        console.log(`  ❌ ${cred.email}: User not found`);
      }
    }

    // Test 3: Check security logs table
    console.log("\n📝 Test 3: Checking security logs table...");
    try {
      const logsQuery = "SELECT COUNT(*) as count FROM security_logs";
      const logsResult = await client.query(logsQuery);
      console.log(
        `  ✅ Security logs table accessible, ${logsResult.rows[0].count} entries found`
      );
    } catch (logError) {
      console.log(`  ❌ Security logs table error: ${logError.message}`);
    }

    // Test 4: Test user creation (simulation)
    console.log("\n👤 Test 4: Testing user profile mapping...");
    const sampleUser = usersResult.rows[0];
    if (sampleUser) {
      // Simulate the frontend mapping
      const frontendUser = {
        id: sampleUser.id.toString(),
        email: sampleUser.email,
        username: sampleUser.email,
        role: mapDatabaseRoleToFrontend(sampleUser.role),
        profile: {
          firstName: sampleUser.name ? sampleUser.name.split(" ")[0] || "" : "",
          lastName: sampleUser.name
            ? sampleUser.name.split(" ").slice(1).join(" ") || ""
            : "",
          phone: "", // Would come from database
          location: "",
          avatar: "",
          bio: "",
        },
        createdAt: new Date().toISOString(),
        isActive: sampleUser.is_active,
      };

      console.log(`  ✅ User mapping successful for ${sampleUser.email}:`);
      console.log(`     Frontend role: ${frontendUser.role}`);
      console.log(
        `     Name split: ${frontendUser.profile.firstName} ${frontendUser.profile.lastName}`
      );
    }

    client.release();
    console.log("\n🎉 Authentication integration test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    await pool.end();
  }
}

function mapDatabaseRoleToFrontend(dbRole) {
  const roleMap = {
    customer: "user",
    tour_guide: "tour_guide",
    admin: "admin",
  };
  return roleMap[dbRole] || "user";
}

testAuthentication().catch(console.error);
