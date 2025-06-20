import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import reviewsRoutes from "./routes/reviews.js";
import messagesRoutes from "./routes/messages.js";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/messages", messagesRoutes);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test database connection
pool
  .connect()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err));

// Auth routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body; // Get user by email
    const userQuery = `
      SELECT id, email, name, phone, date_of_birth, gender, 
             profile_picture, role, password, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;

    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const user = userResult.rows[0]; // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user;

    // Log security event
    await pool.query(
      `INSERT INTO security_logs (action, user_id, ip_address, user_agent, details) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        "Login",
        user.id,
        req.ip,
        req.get("User-Agent") || "Customer",
        "User logged in successfully",
      ]
    );

    res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      role = "user",
    } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    } // Hash password    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const insertQuery = `
      INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role, created_at, updated_at
    `;

    const result = await pool.query(insertQuery, [
      email,
      passwordHash,
      firstName,
      lastName,
      role,
    ]);

    const newUser = result.rows[0]; // Log security event
    await pool.query(
      `INSERT INTO security_logs (action, user_id, ip_address, user_agent, details) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        "Registration",
        newUser.id,
        req.ip,
        req.get("User-Agent") || "Customer",
        "New user registered",
      ]
    );

    res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Database test endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    res.json({
      success: true,
      message: "Database connection successful",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      error: "Database connection failed",
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
