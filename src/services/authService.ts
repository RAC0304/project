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
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Registration failed" };
      }

      // Map role to UserRole type
      const userRole: UserRole = role === "tour_guide" ? "tour_guide" : "user";

      // Insert user profile
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .insert([
          {
            id: data.user.id,
            email,
            username,
            role: userRole,
            first_name: firstName,
            last_name: lastName,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (profileError) {
        return { success: false, error: "Failed to create user profile" };
      }

      const user: User = {
        id: data.user.id,
        email,
        username,
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
      return { success: false, error: "Registration failed" };
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

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }
}

// Export a singleton instance
const authService = new AuthService();
export { authService };
export default authService;
