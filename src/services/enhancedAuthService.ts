import { User, UserRole } from "../types/user";

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  errors?: string[];
}

interface AvailabilityResponse {
  success: boolean;
  available?: {
    email: boolean | null;
    username: boolean | null;
  };
  error?: string;
}

class EnhancedAuthService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  async register(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    role: string,
    phone?: string,
    dateOfBirth?: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          username: username.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: role === "Tour Guide" ? "tour_guide" : "customer",
          phone: phone?.trim() || null,
          dateOfBirth: dateOfBirth || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Registration failed',
          errors: data.errors || []
        };
      }

      if (data.success && data.user) {
        // Map the response user to our User type
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          role: this.mapRole(data.user.role),
          profile: {
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            phone: data.user.phone || "",
            location: "",
            bio: "",
            languages: [],
            experience: "",
          },
          createdAt: data.user.createdAt,
          isActive: data.user.isActive,
        };

        return { success: true, user };
      }

      return {
        success: false,
        error: data.error || 'Registration failed'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  async checkAvailability(email?: string, username?: string): Promise<AvailabilityResponse> {
    try {
      const body: any = {};
      if (email) body.email = email.toLowerCase().trim();
      if (username) body.username = username.trim();

      const response = await fetch(`${this.baseUrl}/auth/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to check availability'
        };
      }

      return data;

    } catch (error) {
      console.error('Availability check error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  async validateToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Token validation failed'
        };
      }

      if (data.success && data.user) {
        // Map the response user to our User type
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          role: this.mapRole(data.user.role),
          profile: {
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            phone: data.user.phone || "",
            location: "",
            bio: "",
            languages: [],
            experience: "",
          },
          createdAt: data.user.createdAt,
          isActive: data.user.isActive,
        };

        return { success: true, user };
      }

      return {
        success: false,
        error: data.error || 'Token validation failed'
      };

    } catch (error) {
      console.error('Token validation error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  private mapRole(dbRole: string): UserRole {
    switch (dbRole) {
      case 'tour_guide':
        return 'tour_guide';
      case 'admin':
        return 'admin';
      case 'customer':
      default:
        return 'user';
    }
  }

  // Enhanced login method that also uses the backend API
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // First try Supabase auth (existing method)
      const { default: originalAuthService } = await import('./authService');
      return await originalAuthService.login(email, password);
    } catch (error) {
      console.error('Enhanced auth service login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const { default: originalAuthService } = await import('./authService');
      await originalAuthService.logout();
    } catch (error) {
      console.error('Enhanced auth service logout error:', error);
    }
  }
}

// Export a singleton instance
const enhancedAuthService = new EnhancedAuthService();
export { enhancedAuthService };
export default enhancedAuthService;
