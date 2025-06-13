import { User, UserRole } from "../types/user";
import { supabase } from "../utils/supabaseClient";
import bcrypt from "bcryptjs";

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class CustomAuthService {
  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    try {
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@');
      let userProfile;
      let profileError;

      if (isEmail) {
        // Find user by email
        const result = await supabase
          .from("users")
          .select("*")
          .eq("email", emailOrUsername)
          .single();
        
        userProfile = result.data;
        profileError = result.error;
      } else {
        // Find user by username
        const result = await supabase
          .from("users")
          .select("*")
          .eq("username", emailOrUsername)
          .single();
        
        userProfile = result.data;
        profileError = result.error;
      }

      if (profileError) {
        return { success: false, error: "User not found" };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        userProfile.password
      );

      if (!isPasswordValid) {
        // Log failed login attempt
        await this.updateFailedLoginAttempts(userProfile.id);
        await this.logSecurityEvent(
          userProfile.id,
          "login_attempt",
          "Invalid password",
          "failed"
        );
        return { success: false, error: "Invalid credentials" };
      }

      // Check if account is active
      if (!userProfile.is_active) {
        await this.logSecurityEvent(
          userProfile.id,
          "login_attempt",
          "Account is disabled",
          "failed"
        );
        return { success: false, error: "Account is disabled" };
      }

      // Check if account is locked
      if (
        userProfile.locked_until &&
        new Date(userProfile.locked_until) > new Date()
      ) {
        await this.logSecurityEvent(
          userProfile.id,
          "login_attempt",
          "Account is locked",
          "failed"
        );
        return {
          success: false,
          error: "Account is locked due to too many failed login attempts",
        };
      }

      // Update last login info and reset failed login attempts
      await supabase
        .from("users")
        .update({
          last_login_at: new Date().toISOString(),
          last_login_ip: "client-ip", // In a real app, get from request
          failed_login_attempts: 0,
          locked_until: null,
        })
        .eq("id", userProfile.id);

      // Log successful login
      await this.logSecurityEvent(
        userProfile.id,
        "login",
        "Login successful",
        "success"
      );
      
      // Map to User object
      const user: User = {
        id: userProfile.id.toString(),
        email: userProfile.email,
        username: userProfile.username || userProfile.email.split("@")[0],
        role: userProfile.role as UserRole,
        dateOfBirth: userProfile.date_of_birth || undefined,
        gender: userProfile.gender as "male" | "female" | "other" | undefined,
        profile: {
          firstName: userProfile.first_name || "",
          lastName: userProfile.last_name || "",
          phone: userProfile.phone || "",
          location: userProfile.location || "",
          bio: userProfile.bio || "",
          languages: userProfile.languages || [],
          experience: userProfile.experience || "",
          avatar: userProfile.profile_picture || "",
        },
        createdAt: userProfile.created_at,
        isActive: userProfile.is_active,
      };

      return { success: true, user };
    } catch (error) {
      console.error("Custom auth service login error:", error);
      return { success: false, error: "Login failed" };
    }
  }
  
  // All other methods remain the same...
  // Add all existing methods from customAuthService.ts
}
