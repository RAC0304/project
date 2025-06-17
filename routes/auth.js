import express from "express";
import { supabase } from "../src/utils/supabaseClient.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return errors;
};

const validateName = (name, fieldName) => {
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push(`${fieldName} is required`);
  }

  if (name.length > 50) {
    errors.push(`${fieldName} must be less than 50 characters`);
  }

  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    errors.push(
      `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
    );
  }

  return errors;
};

const validateUsername = (username) => {
  const errors = [];

  if (username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  }

  if (username.length > 30) {
    errors.push("Username must be less than 30 characters");
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    errors.push(
      "Username can only contain letters, numbers, dots, hyphens, and underscores"
    );
  }

  return errors;
};

// Security logging function
const logSecurityEvent = async (
  userId,
  action,
  details,
  status = "success",
  req
) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("User-Agent") || "unknown";

    await supabase.from("security_logs").insert([
      {
        user_id: userId,
        action,
        ip_address: ipAddress,
        user_agent: userAgent,
        status,
        details,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      role = "customer",
      phone,
      dateOfBirth,
    } = req.body;

    // Comprehensive input validation
    const validationErrors = [];

    // Email validation
    if (!email) {
      validationErrors.push("Email is required");
    } else if (!validateEmail(email)) {
      validationErrors.push("Please enter a valid email address");
    }

    // Password validation
    if (!password) {
      validationErrors.push("Password is required");
    } else {
      validationErrors.push(...validatePassword(password));
    }

    // Username validation
    if (!username) {
      validationErrors.push("Username is required");
    } else {
      validationErrors.push(...validateUsername(username));
    }

    // Name validation
    validationErrors.push(...validateName(firstName, "First name"));
    validationErrors.push(...validateName(lastName, "Last name"));

    // Role validation
    const validRoles = ["customer", "tour_guide", "admin"];
    if (!validRoles.includes(role)) {
      validationErrors.push("Invalid role specified");
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      await logSecurityEvent(
        null,
        "registration_attempt",
        `Validation failed: ${validationErrors.join(", ")}`,
        "failed",
        req
      );
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: validationErrors,
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("email, username")
      .or(`email.eq.${email.toLowerCase()},username.eq.${username}`)
      .single();

    if (existingUser) {
      const message =
        existingUser.email === email.toLowerCase()
          ? "User with this email already exists"
          : "Username is already taken";

      await logSecurityEvent(
        null,
        "registration_attempt",
        `Duplicate user attempt: ${email}`,
        "failed",
        req
      );

      return res.status(409).json({
        success: false,
        error: message,
      });
    }

    // Begin transaction-like operations
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: email.toLowerCase(),
          password,
          email_confirm: true, // Auto-confirm email for development
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            username,
            role,
          },
        });

      if (authError) {
        console.error("Supabase auth error:", authError);
        await logSecurityEvent(
          null,
          "registration_attempt",
          `Auth creation failed: ${authError.message}`,
          "failed",
          req
        );
        return res.status(400).json({
          success: false,
          error: authError.message,
        });
      }

      // Create user profile in users table
      const userData = {
        email: email.toLowerCase(),
        username,
        first_name: firstName,
        last_name: lastName,
        role,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        is_active: true,
        failed_login_attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);

        // Clean up auth user if profile creation fails
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error("Failed to cleanup auth user:", cleanupError);
        }

        await logSecurityEvent(
          null,
          "registration_attempt",
          `Profile creation failed: ${profileError.message}`,
          "failed",
          req
        );

        return res.status(500).json({
          success: false,
          error: "Failed to create user profile",
        });
      }

      // If registering as tour guide, create tour guide profile
      if (role === "tour_guide") {
        const { error: tourGuideError } = await supabase
          .from("tour_guides")
          .insert([
            {
              user_id: userProfile.id,
              location: "",
              experience: 0,
              rating: 0,
              review_count: 0,
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (tourGuideError) {
          console.error("Tour guide profile creation error:", tourGuideError);
          // Note: We don't fail the registration for this, user can complete profile later
        }
      }

      // Log successful registration
      await logSecurityEvent(
        userProfile.id,
        "user_registration",
        "User registered successfully",
        "success",
        req
      );

      // Return success response (excluding sensitive data)
      const responseUser = {
        id: userProfile.id,
        email: userProfile.email,
        username: userProfile.username,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: userProfile.role,
        phone: userProfile.phone,
        isActive: userProfile.is_active,
        createdAt: userProfile.created_at,
      };

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: responseUser,
      });
    } catch (transactionError) {
      console.error("Registration transaction error:", transactionError);
      await logSecurityEvent(
        null,
        "registration_attempt",
        `Transaction failed: ${transactionError.message}`,
        "failed",
        req
      );

      res.status(500).json({
        success: false,
        error: "Registration failed due to server error",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    await logSecurityEvent(
      null,
      "registration_attempt",
      `Server error: ${error.message}`,
      "failed",
      req
    );

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// POST /api/auth/check-availability
router.post("/check-availability", async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email && !username) {
      return res.status(400).json({
        success: false,
        error: "Email or username is required",
      });
    }

    let query = supabase.from("users").select("email, username");

    if (email && username) {
      query = query.or(
        `email.eq.${email.toLowerCase()},username.eq.${username}`
      );
    } else if (email) {
      query = query.eq("email", email.toLowerCase());
    } else if (username) {
      query = query.eq("username", username);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Availability check error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check availability",
      });
    }

    const emailTaken = email
      ? data.some((user) => user.email === email.toLowerCase())
      : false;
    const usernameTaken = username
      ? data.some((user) => user.username === username)
      : false;

    res.json({
      success: true,
      available: {
        email: email ? !emailTaken : null,
        username: username ? !usernameTaken : null,
      },
    });
  } catch (error) {
    console.error("Availability check error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /api/auth/validate-token
router.get("/validate-token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No valid token provided",
      });
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: "User profile not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        username: userProfile.username,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: userProfile.role,
        phone: userProfile.phone,
        isActive: userProfile.is_active,
        createdAt: userProfile.created_at,
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
