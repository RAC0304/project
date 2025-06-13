import { User, UserRole } from "../types/user";
import { supabase } from "../utils/supabaseClient";
import bcrypt from "bcryptjs";

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class CustomAuthService {  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    try {
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@');
      
      // Find user in the users table by email or username
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .or(isEmail ? `email.eq.${emailOrUsername}` : `username.eq.${emailOrUsername}`)
        .single();

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
        return { success: false, error: "Invalid email or password" };
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
      ); // Map to User object
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
        return {
          success: false,
          error: "All required fields must be provided",
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters long",
        };
      }
      try {
        // First check if the users table exists by checking database schema
        // const { data: tables, error: tableError } = await supabase
        //   .from("pg_catalog.pg_tables")
        //   .select("tablename")
        //   .eq("schemaname", "public")
        //   .eq("tablename", "users");

        // if (tableError || !tables || tables.length === 0) {
        //   console.error(
        //     "Database table 'users' not found in schema:",
        //     tableError
        //   );
        //   return {
        //     success: false,
        //     error:
        //       "Database schema issue. The users table does not exist. Please run the database setup script.",
        //   };
        // }

        // Check if user already exists - use .filter() instead of .eq() and .maybeSingle() instead of .single()
        const { data: existingUsers, error: checkError } = await supabase
          .from("users")
          .select("email")
          .filter("email", "eq", email)
          .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking user existence:", checkError);
          return {
            success: false,
            error: "Database query error. Please try again later.",
          };
        }

        if (existingUsers) {
          return {
            success: false,
            error: "User with this email already exists",
          };
        }

        if (username) {
          // Check if username already exists - use .filter() instead of .eq()
          const { data: existingUsernames, error: usernameError } =
            await supabase
              .from("users")
              .select("username")
              .filter("username", "eq", username)
              .maybeSingle();

          if (usernameError && usernameError.code !== "PGRST116") {
            console.error("Error checking username:", usernameError);
            return {
              success: false,
              error: "Database query error. Please try again later.",
            };
          }

          if (existingUsernames) {
            return { success: false, error: "Username is already taken" };
          }
        }
      } catch (error) {
        console.error("Error checking user existence:", error);
        return {
          success: false,
          error:
            "Failed to verify user. Database may not be properly configured.",
        };
      } // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert user profile into users table with hashed password
      console.log("Registering user with data:", {
        email,
        username: username || email.split("@")[0],
        role: role === "tour_guide" ? "tour_guide" : "customer",
      });
      let data, profileError;
      try {
        // Fix the role assignment to match exactly what's defined in the enum
        const userRole = role === "tour_guide" ? "tour_guide" : "customer";

        console.log("Attempting to insert user with role:", userRole);

        const result = await supabase
          .from("users")
          .insert([
            {
              // Make sure we're inserting an array of objects
              email,
              username: username || email.split("@")[0],
              password: hashedPassword, // Store hashed password
              role: userRole,
              first_name: firstName,
              last_name: lastName,
              is_active: true,
              failed_login_attempts: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select("*")
          .single(); // Get the inserted row as a single object

        data = result.data ? [result.data] : null; // Normalize to array format
        profileError = result.error;

        if (profileError) {
          console.error("Profile creation error:", profileError);

          if (profileError.code === "PGRST116") {
            return {
              success: false,
              error:
                "The database tables are not properly set up. Please run the database migration script.",
            };
          }

          if (profileError.code === "23514") {
            // Violates check constraint
            return {
              success: false,
              error:
                "Role value is not valid. Must be one of: admin, tour_guide, customer.",
            };
          }

          return {
            success: false,
            error: `Failed to create user profile: ${profileError.message}`,
          };
        }

        // Check if data is null or array is empty
        if (!data || data.length === 0) {
          console.error("No user profile data returned after insert");
          return {
            success: false,
            error: "Failed to create user profile. No data returned.",
          };
        }
      } catch (error) {
        console.error("Exception during user creation:", error);
        return {
          success: false,
          error: "An unexpected error occurred. Please try again later.",
        };
      }

      const userProfile = data[0]; // If registering as tour guide, create tour guide profile
      if (role === "tour_guide") {
        try {
          const { error: tourGuideError } = await supabase
            .from("tour_guides")
            .insert({
              user_id: userProfile.id,
              location: "",
              experience: 0,
              rating: 0,
              review_count: 0,
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (tourGuideError) {
            console.error("Tour guide profile creation error:", tourGuideError);
            // Note: We continue even if tour guide profile creation fails
            // The user can complete their tour guide profile later
          }
        } catch (error) {
          console.error("Exception during tour guide profile creation:", error);
          // Continue despite errors
        }
      } // Log the registration event
      try {
        await this.logSecurityEvent(
          userProfile.id,
          "user_registration",
          "Registration successful",
          "success"
        );
      } catch (error) {
        console.error("Failed to log registration event:", error);
        // Continue despite errors
      }

      // Map role to UserRole type
      const userRole: UserRole = role === "tour_guide" ? "tour_guide" : "user";

      const user: User = {
        id: userProfile.id.toString(),
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
      console.error("Custom auth service registration error:", error);
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }
  }
  async updateProfile(
    userId: string,
    updates: Partial<User["profile"]> & {
      avatar?: string;
      dateOfBirth?: string;
      gender?: "male" | "female" | "other";
    }
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
      if ("avatar" in updates && updates.avatar !== undefined)
        updateData.profile_picture = updates.avatar;
      // Add support for dateOfBirth and gender fields that are directly on the user
      if (updates.dateOfBirth !== undefined)
        updateData.date_of_birth = updates.dateOfBirth;
      if (updates.gender !== undefined) updateData.gender = updates.gender;

      const { error } = await supabase
        .from("users")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Supabase profile update error:", error);
        return false;
      }

      // Store avatar separately in storage if it's a new base64 image
      if (
        "avatar" in updates &&
        updates.avatar &&
        updates.avatar.startsWith("data:image")
      ) {
        try {
          const { data: imageData, error: storageError } =
            await this.uploadProfileImage(userId, updates.avatar);

          if (storageError) {
            console.error("Failed to upload profile image:", storageError);
            // Continue despite image upload failure          } else if (imageData?.path) {
            // Update user record with the new image URL
            const { data: urlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(imageData.path);
            const imageUrl = urlData?.publicUrl;
            await supabase
              .from("users")
              .update({ profile_picture: imageUrl })
              .eq("id", userId);
          }
        } catch (imageError) {
          console.error("Error processing profile image:", imageError);
          // Continue despite image errors
        }
      }

      await this.logSecurityEvent(
        parseInt(userId),
        "profile_update",
        "Profile updated successfully",
        "success"
      );

      return true;
    } catch (error) {
      console.error("Custom auth service update profile error:", error);
      return false;
    }
  }

  private async uploadProfileImage(
    userId: string,
    base64Image: string
  ): Promise<{
    data?: { path: string };
    error?: Error;
  }> {
    try {
      // Extract MIME type and base64 data
      const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 image string");
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      // Determine file extension based on MIME type
      let extension = "jpg";
      if (mimeType === "image/png") extension = "png";
      if (mimeType === "image/gif") extension = "gif";

      const filename = `user_${userId}_${Date.now()}.${extension}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(`profiles/${filename}`, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) throw error;

      return { data: { path: data?.path || "" } };
    } catch (error) {
      console.error("Profile image upload error:", error);
      return { error: error as Error };
    }
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find user
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("password")
        .eq("id", userId)
        .single();

      if (userError) {
        return { success: false, error: "User not found" };
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        await this.logSecurityEvent(
          parseInt(userId),
          "password_change_attempt",
          "Invalid current password",
          "failed"
        );
        return { success: false, error: "Current password is incorrect" };
      }

      // Hash and update new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const { error: updateError } = await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("id", userId);

      if (updateError) {
        return { success: false, error: "Failed to update password" };
      }

      await this.logSecurityEvent(
        parseInt(userId),
        "password_change",
        "Password changed successfully",
        "success"
      );

      return { success: true };
    } catch (error) {
      console.error("Password update error:", error);
      return { success: false, error: "Failed to update password" };
    }
  }

  private async updateFailedLoginAttempts(userId: number): Promise<void> {
    try {
      // Get current failed attempts
      const { data: user } = await supabase
        .from("users")
        .select("failed_login_attempts")
        .eq("id", userId)
        .single();

      if (!user) return;

      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const updateData: Record<string, unknown> = {
        failed_login_attempts: failedAttempts,
      };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30); // Lock for 30 minutes
        updateData.locked_until = lockUntil.toISOString();

        await this.logSecurityEvent(
          userId,
          "account_locked",
          "Account locked due to too many failed login attempts",
          "warning"
        );
      }

      await supabase.from("users").update(updateData).eq("id", userId);
    } catch (error) {
      console.error("Failed to update login attempts:", error);
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
      const { error } = await supabase.from("security_logs").insert([
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

      if (error) {
        // Check if it's a table not found error
        if (error.code === "PGRST116") {
          console.error("Security logs table does not exist:", error);
          // In a production app, we might create a fallback logging mechanism here
        } else {
          console.error("Failed to insert security log:", error);
        }
      }
    } catch (error) {
      console.error("Exception while logging security event:", error);
    }
  }

  async logout(userId: string): Promise<void> {
    if (userId) {
      try {
        await this.logSecurityEvent(
          parseInt(userId),
          "logout",
          "User logged out",
          "success"
        );
      } catch (error) {
        console.error("Logout logging error:", error);
      }
    }
  }
}

// Export a singleton instance
const customAuthService = new CustomAuthService();
export { customAuthService };
export default customAuthService;
