// Environment configuration loader for client-side
// Note: Vite automatically loads .env files and exposes variables with VITE_ prefix

export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  appName: import.meta.env.VITE_APP_NAME || "WanderWise Indonesia",
  appUrl: import.meta.env.VITE_APP_URL || "http://localhost:5173",

  // Database Configuration (for server-side only)
  database: {
    url: process.env?.DATABASE_URL || "",
    host: process.env?.DB_HOST || "localhost",
    port: parseInt(process.env?.DB_PORT || "5432"),
    database: process.env?.DB_DATABASE || "wanderwise",
    username: process.env?.DB_USERNAME || "postgres",
    password: process.env?.DB_PASSWORD || "",
  },

  // Security Configuration
  security: {
    maxLoginAttempts: parseInt(
      import.meta.env.VITE_SECURITY_MAX_LOGIN_ATTEMPTS || "5"
    ),
    lockoutDuration: parseInt(
      import.meta.env.VITE_SECURITY_LOCKOUT_DURATION || "30"
    ),
    sessionTimeout: parseInt(
      import.meta.env.VITE_SECURITY_SESSION_TIMEOUT || "120"
    ),
  },

  // Development flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Debug mode
  debug: import.meta.env.VITE_DEBUG === "true" || import.meta.env.DEV,
};

// Helper function to check if environment is properly configured
export const validateEnvironment = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check required environment variables
  if (!config.apiUrl) {
    errors.push("VITE_API_URL is required");
  }

  // Validate database configuration (server-side only)
  if (typeof window === "undefined") {
    if (
      !config.database.url &&
      (!config.database.host || !config.database.database)
    ) {
      errors.push(
        "Database configuration is incomplete. Either DATABASE_URL or DB_HOST and DB_DATABASE are required"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Log configuration on load (development only)
if (config.isDevelopment) {
  console.log("🔧 Environment Configuration:", {
    apiUrl: config.apiUrl,
    appName: config.appName,
    appUrl: config.appUrl,
    isDevelopment: config.isDevelopment,
    debug: config.debug,
  });

  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.warn("⚠️ Environment validation failed:", validation.errors);
  }
}

export default config;
