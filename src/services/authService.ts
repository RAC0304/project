import { User, UserRole } from "../types/user";
import { supabase } from "../utils/supabaseClient";

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "No user data returned" };
      }

      // Fetch user profile from your users table
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (profileError) {
        return { success: false, error: "Failed to fetch user profile" };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        username: userProfile.username || data.user.email!.split("@")[0],
        role: userProfile.role || "user",
        profile: {
          firstName: userProfile.first_name || "",
          lastName: userProfile.last_name || "",
          phone: userProfile.phone || "",
          location: userProfile.location || "",
          bio: userProfile.bio || "",
          languages: userProfile.languages || [],
          experience: userProfile.experience || "",
        },
        createdAt: userProfile.created_at || new Date().toISOString(),
        isActive: userProfile.is_active ?? true,
      };

      return { success: true, user };
    } catch (error) {
      console.error("Auth service login error:", error);
      return { success: false, error: "Login failed" };
    }
  }
  async register(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    role: string
  ): Promise<AuthResponse> {
    try {
      // Validate input data
      if (!email || !password || !firstName || !lastName) {
        return { success: false, error: "All required fields must be provided" };
      }

      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long" };
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        return { success: false, error: "User with this email already exists" };
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username || email.split("@")[0],
            role: role === "tour_guide" ? "tour_guide" : "customer",
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Registration failed" };
      }

      // Map role to UserRole type
      const userRole: UserRole = role === "tour_guide" ? "tour_guide" : "user";

      // Insert user profile into users table
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .insert([
          {
            email,
            username: username || email.split("@")[0],
            role: role === "tour_guide" ? "tour_guide" : "customer",
            first_name: firstName,
            last_name: lastName,
            is_active: true,
            failed_login_attempts: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(data.user.id);
        return { success: false, error: "Failed to create user profile" };
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
          // Note: We continue even if tour guide profile creation fails
          // The user can complete their tour guide profile later
        }
      }

      // Log the registration event
      await this.logSecurityEvent(
        userProfile.id,
        "user_registration",
        "Registration successful",
        "success"
      );

      const user: User = {
        id: data.user.id,
        email,
        username: username || email.split("@")[0],
        role: userRole,
        profile: {
          firstName,
          lastName,
          phone: "",
          location: "",
          bio: "",
          languages: [],
          experience: "",
        },
        createdAt: userProfile.created_at,
        isActive: true,
      };

      return { success: true, user };
    } catch (error) {
      console.error("Auth service registration error:", error);
      return { success: false, error: "Registration failed. Please try again." };
    }
  }
  async updateProfile(
    userId: string,
    updates: Partial<User["profile"]>
  ): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {};

      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.location) updateData.location = updates.location;
      if (updates.bio) updateData.bio = updates.bio;
      if (updates.languages !== undefined)
        updateData.languages = updates.languages;
      if (updates.experience !== undefined)
        updateData.experience = updates.experience;

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);

      return !error;
    } catch (error) {
      console.error("Auth service update profile error:", error);
      return false;
    }
  }

  private async logSecurityEvent(
    userId: number | null,
    action: string,
    details: string,
    status: "success" | "failed" | "warning" = "success",
    ipAddress: string = "unknown",
    userAgent: string = "unknown"
  ): Promise<void> {
    try {
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
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }
}

// Export a singleton instance
const authService = new AuthService();
export { authService };
export default authService;
