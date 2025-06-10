import { User, UserRole } from "../types";

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

class AuthService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  }

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Login failed",
        };
      }

      if (data.success && data.user) {
        // Transform backend user format to frontend format
        const user: User = {
          id: data.user.id.toString(),
          email: data.user.email,
          username: data.user.email, // Use email as username
          role: this.mapDatabaseRoleToAppRole(data.user.role),
          profile: {
            firstName: data.user.name ? data.user.name.split(" ")[0] || "" : "",
            lastName: data.user.name
              ? data.user.name.split(" ").slice(1).join(" ") || ""
              : "",
            phone: data.user.phone || "",
            location: "",
            avatar: data.user.profile_picture || "",
            bio: "",
          },
          createdAt: data.user.created_at,
          isActive: true,
        };

        return {
          success: true,
          user,
        };
      }

      return {
        success: false,
        error: data.error || "Login failed",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    role: string = "user"
  ): Promise<RegisterResult> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
          firstName,
          lastName,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Registration failed",
        };
      }

      if (data.success && data.user) {
        // Transform backend user format to frontend format
        const user: User = {
          id: data.user.id.toString(),
          email: data.user.email,
          username: data.user.email, // Use email as username
          role: this.mapDatabaseRoleToAppRole(data.user.role),
          profile: {
            firstName: firstName,
            lastName: lastName,
            phone: "",
            location: "",
            avatar: "",
            bio: "",
          },
          createdAt: data.user.created_at,
          isActive: true,
        };

        return {
          success: true,
          user,
        };
      }

      return {
        success: false,
        error: data.error || "Registration failed",
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.success && data.user) {
        return {
          id: data.user.id.toString(),
          email: data.user.email,
          username: data.user.email,
          role: this.mapDatabaseRoleToAppRole(data.user.role),
          profile: {
            firstName: data.user.name ? data.user.name.split(" ")[0] || "" : "",
            lastName: data.user.name
              ? data.user.name.split(" ").slice(1).join(" ") || ""
              : "",
            phone: data.user.phone || "",
            location: "",
            avatar: data.user.profile_picture || "",
            bio: "",
          },
          createdAt: data.user.created_at,
          isActive: data.user.is_active,
        };
      }

      return null;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<User["profile"]>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  }

  /**
   * Map database role names to frontend role names
   */
  private mapDatabaseRoleToAppRole(dbRole: string): UserRole {
    const roleMap: { [key: string]: UserRole } = {
      customer: "user",
      user: "user",
      tour_guide: "tour_guide",
      admin: "admin",
    };
    return roleMap[dbRole] || "user";
  }
}

export default new AuthService();
