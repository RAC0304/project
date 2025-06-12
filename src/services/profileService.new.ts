import { User } from "../types/user";
import { supabase, checkSupabaseStorage } from "../utils/supabaseClient";

/**
 * Service to handle profile management with Supabase
 */
class ProfileService {
  private storageAvailable: boolean = false;

  constructor() {
    // Check storage availability at initialization
    this.checkStorageAvailability();
  }

  /**
   * Check if Supabase storage is available
   */
  private async checkStorageAvailability(): Promise<void> {
    try {
      const status = await checkSupabaseStorage();
      this.storageAvailable = status.ok;

      if (!status.ok) {
        console.warn("Supabase storage is not available:", status.error);
      } else {
        console.log("Supabase storage is available. Buckets:", status.buckets);
      }
    } catch (error) {
      console.error("Failed to check storage availability:", error);
      this.storageAvailable = false;
    }
  }

  /**
   * Updates a user's profile in Supabase
   */
  async updateProfile(
    userId: string,
    updates: Partial<User["profile"]> & { avatar?: string }
  ): Promise<boolean> {
    try {
      console.log(`Updating profile for user ${userId}`, updates);
      // Create a copy of updates to avoid modifying the original
      const updatesToApply = { ...updates };
      const updateData: Record<string, unknown> = {};

      // Handle profile image upload if it's a base64 image
      if (
        "avatar" in updatesToApply &&
        updatesToApply.avatar &&
        updatesToApply.avatar.startsWith("data:image")
      ) {
        try {
          console.log("Uploading image to Supabase storage...");
          const result = await this.uploadProfileImage(
            userId,
            updatesToApply.avatar
          );

          if (result.success && result.url) {
            console.log("Image upload successful, URL:", result.url);
            updateData.profile_picture = result.url;
          } else {
            console.error("Failed to upload profile image:", result.error);
            // Don't update the profile picture field if upload failed
          }
        } catch (imageError) {
          console.error("Exception during image upload:", imageError);
        }
      } else if ("avatar" in updatesToApply && updatesToApply.avatar) {
        // Regular URL avatar
        updateData.profile_picture = updatesToApply.avatar;
      } // Map profile fields to database fields
      if (updatesToApply.firstName)
        updateData.first_name = updatesToApply.firstName;
      if (updatesToApply.lastName)
        updateData.last_name = updatesToApply.lastName;
      if (updatesToApply.phone) updateData.phone = updatesToApply.phone;
      if (updatesToApply.location)
        updateData.location = updatesToApply.location;
      if (updatesToApply.bio) updateData.bio = updatesToApply.bio;
      if (updatesToApply.languages !== undefined)
        updateData.languages = updatesToApply.languages;
      // Removed experience field as it doesn't exist in the users table
      // if (updatesToApply.experience !== undefined)
      //   updateData.experience = updatesToApply.experience;

      // Only update if there's data to update
      if (Object.keys(updateData).length > 0) {
        console.log("Updating profile data in database:", updateData);
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

        // Log the activity
        await this.logActivity(
          userId,
          "profile_update",
          "Profile updated successfully"
        );
      } else {
        console.log("No profile data to update");
      }

      return true;
    } catch (error) {
      console.error("Profile service error:", error);
      return false;
    }
  }

  /**
   * Uploads a profile image to Supabase Storage
   */
  private async uploadProfileImage(
    userId: string,
    base64Image: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Check if storage is available
      if (!this.storageAvailable) {
        // Try again to check availability
        await this.checkStorageAvailability();

        if (!this.storageAvailable) {
          return {
            success: false,
            error: "Supabase storage is not available",
          };
        }
      }

      // Extract MIME type and base64 data
      const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        return {
          success: false,
          error: "Invalid base64 image string",
        };
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      try {
        // For browser environments, convert base64 to Blob instead of Buffer
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Determine file extension based on MIME type
        let extension = "jpg";
        if (mimeType === "image/png") extension = "png";
        if (mimeType === "image/gif") extension = "gif";

        const filename = `user_${userId}_${Date.now()}.${extension}`;
        const filePath = `profiles/${filename}`;

        console.log(`Uploading file to avatars/${filePath}`);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(filePath, blob, {
            contentType: mimeType,
            upsert: true,
          });

        console.log("Upload response:", { data, error });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        const publicUrl = urlData?.publicUrl;
        console.log("Generated public URL:", publicUrl);

        return {
          success: true,
          url: publicUrl,
        };
      } catch (error) {
        console.error("Error processing image:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to process image",
        };
      }
    } catch (error) {
      console.error("Profile image upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Log user activity in Supabase
   */
  private async logActivity(
    userId: string,
    action: string,
    details: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from("activity_logs").insert([
        {
          user_id: userId,
          action,
          details,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        // If the table doesn't exist, just log it but don't halt operations
        if (error.code === "PGRST116") {
          console.warn("Activity logs table does not exist:", error.message);
        } else {
          console.error("Failed to insert activity log:", error);
        }
      }
    } catch (error) {
      // Just log the error, don't fail the whole operation
      console.error("Failed to log activity:", error);
    }
  }
}

// Export a singleton instance
const profileService = new ProfileService();
export { profileService };
export default profileService;
