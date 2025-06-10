import { User, UserRole } from "../types";
import { DEMO_USERS } from "../data/users";

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: User;
  error?: string;
}

class MockAuthService {
  /**
   * Mock authentication with email and password
   */
  async login(email: string, password: string): Promise<LoginResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user by email
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // For demo purposes, check if password matches a simple pattern
    // In production, this would be handled by the backend
    const validPasswords = ["password", "demo123", "wanderwise123"];
    if (!validPasswords.includes(password)) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Simulate security logging
    console.log(`[MOCK AUTH] Login attempt for ${email} - SUCCESS`);

    return {
      success: true,
      user: {
        ...user,
        lastLogin: new Date().toISOString(),
      },
    };
  }
  /**
   * Mock user registration
   */
  async register(
    email: string,
    _password: string,
    username: string,
    firstName: string,
    lastName: string,
    role: "Traveler" | "Tour Guide"
  ): Promise<RegisterResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if user already exists
    const existingUser = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        u.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
      return {
        success: false,
        error: "User with this email or username already exists",
      };
    }

    // Map frontend roles to backend roles
    const dbRole: UserRole = role === "Tour Guide" ? "tour_guide" : "user";

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      username,
      role: dbRole,
      profile: {
        firstName,
        lastName,
        location: "",
        bio: "",
        phone: "",
      },
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    // Simulate security logging
    console.log(`[MOCK AUTH] Registration for ${email} - SUCCESS`);

    return {
      success: true,
      user: newUser,
    };
  }

  /**
   * Mock get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = DEMO_USERS.find((u) => u.id === userId);
    return user || null;
  }

  /**
   * Mock update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<User["profile"]>
  ): Promise<boolean> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[MOCK AUTH] Profile update for user ${userId}:`, updates);

    // In a real implementation, this would update the database
    // For now, just return success
    return true;
  }

  /**
   * Mock security event logging
   */
  async logSecurityEvent(
    userId: string | null,
    eventType: string,
    details: string,
    ipAddress: string = "127.0.0.1",
    userAgent: string = "Mock Browser"
  ): Promise<void> {
    console.log(`[MOCK SECURITY] ${eventType}:`, {
      userId,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }
}

export default MockAuthService;
