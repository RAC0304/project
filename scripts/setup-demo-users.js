import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function setupDemoUsers() {
  console.log("🚀 Setting up demo users in WanderWise database...");

  // Get DATABASE_URL from environment
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_TrJuZ49BYagU@ep-noisy-sun-a8x2dh09-pooler.eastus2.azure.neon.tech/wanderwise?sslmode=require";

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
    console.log("✅ Connected to database successfully!");

    // Demo users to insert
    const demoUsers = [
      {
        name: "Regular User",
        email: "user@wanderwise.com",
        password: "user123",
        role: "customer",
        phone: "+62123456789",
      },
      {
        name: "Tour Guide",
        email: "guide@wanderwise.com",
        password: "guide123",
        role: "tour_guide",
        phone: "+62123456790",
      },
      {
        name: "Administrator",
        email: "admin@wanderwise.com",
        password: "admin123",
        role: "admin",
        phone: "+62123456791",
      },
    ];

    // Check if users already exist and insert if not
    for (const user of demoUsers) {
      try {
        // Check if user exists
        const existingUser = await client.query(
          "SELECT id FROM users WHERE email = $1",
          [user.email]
        );

        if (existingUser.rows.length > 0) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // Insert user
        const insertQuery = `
          INSERT INTO users (name, email, password, role, phone, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id, name, email, role
        `;

        const result = await client.query(insertQuery, [
          user.name,
          user.email,
          hashedPassword,
          user.role,
          user.phone,
        ]);

        const insertedUser = result.rows[0];
        console.log(
          `✅ Created user: ${insertedUser.name} (${insertedUser.email}) - Role: ${insertedUser.role}`
        ); // Log the creation in security logs
        const securityLogQuery = `
          INSERT INTO security_logs (user_id, action, ip_address, user_agent, status, details, created_at)
          VALUES ($1, 'user_creation', 'system', 'setup-script', 'success', 'Demo user created via setup script', CURRENT_TIMESTAMP)
        `;

        await client.query(securityLogQuery, [insertedUser.id]);
      } catch (userError) {
        console.error(
          `❌ Error creating user ${user.email}:`,
          userError.message
        );
      }
    }

    client.release();
    console.log("🎉 Demo users setup completed!");

    console.log("\n📋 Demo Login Credentials:");
    console.log(
      "┌─────────────────────────────────────────────────────────────┐"
    );
    console.log("│ Role          │ Email                  │ Password        │");
    console.log(
      "├─────────────────────────────────────────────────────────────┤"
    );
    console.log("│ Customer      │ user@wanderwise.com    │ user123         │");
    console.log("│ Tour Guide    │ guide@wanderwise.com   │ guide123        │");
    console.log("│ Administrator │ admin@wanderwise.com   │ admin123        │");
    console.log(
      "└─────────────────────────────────────────────────────────────┘"
    );
  } catch (error) {
    console.error("❌ Error setting up demo users:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDemoUsers()
  .then(() => {
    console.log("✨ Setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  });
