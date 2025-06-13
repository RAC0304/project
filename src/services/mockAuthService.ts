import { User, UserRole } from "../types/user";

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Mock data for testing
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@wanderwise.com",
    username: "admin",
    role: "admin",
    profile: {
      firstName: "Admin",
      lastName: "User",
      phone: "+1234567890",
      location: "Jakarta, Indonesia",
      bio: "System administrator",
      languages: ["English", "Indonesian"],
      experience: "5+ years",
    },
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "2",
    email: "guide@wanderwise.com",
    username: "guide",
    role: "tour_guide",
    profile: {
      firstName: "John",
      lastName: "Guide",
      phone: "+1234567891",
      location: "Bali, Indonesia",
      bio: "Experienced tour guide specializing in Bali cultural tours",
      languages: ["English", "Indonesian", "Balinese"],
      experience: "8+ years",
    },
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "3",
    email: "user@wanderwise.com",
    username: "user",
    role: "user",
    profile: {
      firstName: "Jane",
      lastName: "Traveler",
      phone: "+1234567892",
      location: "Melbourne, Australia",
      bio: "Travel enthusiast",
      languages: ["English"],
      experience: "",
    },
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

class MockAuthService {
  private users: User[] = [...mockUsers];
  async login(emailOrUsername: string, _password: string): Promise<AuthResponse> {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if input is an email or username
      const isEmail = emailOrUsername.includes('@');
      
      // Search for user by email or username
      const user = isEmail 
        ? this.users.find((u) => u.email === emailOrUsername)
        : this.users.find((u) => u.username === emailOrUsername);

      if (!user) {
        return { success: false, error: "User not found" };
      } // For mock service, accept any password for demo purposes
      // In real implementation, you'd verify the password hash
      if (_password.length < 1) {
        return { success: false, error: "Password is required" };
      }

      return { success: true, user };
    } catch (error) {
      console.error("Mock auth service login error:", error);
      return { success: false, error: "Login failed" };
    }
  }
  async register(
    email: string,
    _password: string,
    username: string,
    firstName: string,
    lastName: string,
    role: string
  ): Promise<AuthResponse> {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if user already exists
      if (this.users.find((u) => u.email === email)) {
        return { success: false, error: "User already exists" };
      }

      if (this.users.find((u) => u.username === username)) {
        return { success: false, error: "Username already taken" };
      }

      // Map role to UserRole type
      let userRole: UserRole = "user";
      if (role === "Tour Guide" || role === "tour_guide") {
        userRole = "tour_guide";
      } else if (role === "admin") {
        userRole = "admin";
      }

      const newUser: User = {
        id: (this.users.length + 1).toString(),
        email,
        username,
        role: userRole,
        profile: {
          firstName,
          lastName,
          phone: "",
          location: "",
          bio: "",
          languages: ["English"],
          experience: "",
        },
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      this.users.push(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      console.error("Mock auth service registration error:", error);
      return { success: false, error: "Registration failed" };
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<User["profile"]>
  ): Promise<boolean> {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const userIndex = this.users.findIndex((u) => u.id === userId);

      if (userIndex === -1) {
        return false;
      }

      this.users[userIndex] = {
        ...this.users[userIndex],
        profile: {
          ...this.users[userIndex].profile,
          ...updates,
        },
      };

      return true;
    } catch (error) {
      console.error("Mock auth service update profile error:", error);
      return false;
    }
  }

  // Additional mock methods for testing
  getAllUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  resetUsers(): void {
    this.users = [...mockUsers];
  }
}

// Export a singleton instance
const mockAuthService = new MockAuthService();
export { mockAuthService };
export default mockAuthService;
