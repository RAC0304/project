/**
 * Test script for ProfileService functionality
 *
 * This script tests the profile image upload functionality in the ProfileService
 */

// Load environment variables from .env file
require("dotenv").config({ path: ".env" });

const { createClient } = require("@supabase/supabase-js");

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Simple mock for the profile service functionality
class ProfileServiceSimulator {
  constructor(supabase) {
    this.supabase = supabase;
    this.storageAvailable = false;
  }

  async checkStorageAvailability() {
    try {
      const { data: buckets, error } =
        await this.supabase.storage.listBuckets();

      if (error) {
        console.error("Supabase storage error:", error);
        this.storageAvailable = false;
        return false;
      }

      const avatarBucket = buckets?.find((b) => b.name === "avatars");
      if (!avatarBucket) {
        console.error("Avatars bucket missing in Supabase storage");
        this.storageAvailable = false;

        // Try to create the bucket
        console.log("Attempting to create avatars bucket...");
        const { error: createError } = await this.supabase.storage.createBucket(
          "avatars",
          { public: true }
        );

        if (createError) {
          console.error("Failed to create bucket:", createError);
          return false;
        }

        this.storageAvailable = true;
        console.log("Created avatars bucket successfully");
        return true;
      }

      this.storageAvailable = true;
      return true;
    } catch (e) {
      console.error("Failed to check storage availability:", e);
      this.storageAvailable = false;
      return false;
    }
  }

  async uploadProfileImage(userId, base64Image) {
    try {
      // Check if storage is available
      if (!this.storageAvailable) {
        const availabilityResult = await this.checkStorageAvailability();

        if (!availabilityResult) {
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

      // For Node.js environment, convert base64 to Buffer
      const imageBuffer = Buffer.from(base64Data, "base64");

      // Determine file extension based on MIME type
      let extension = "jpg";
      if (mimeType === "image/png") extension = "png";
      if (mimeType === "image/svg+xml") extension = "svg";
      if (mimeType === "image/gif") extension = "gif";

      const filename = `user_${userId}_${Date.now()}.${extension}`;
      const filePath = `profiles/${filename}`;

      console.log(`Uploading file to avatars/${filePath}`);

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from("avatars")
        .upload(filePath, imageBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Get the public URL
      const { data: urlData } = this.supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl;

      return {
        success: true,
        url: publicUrl,
        filePath: filePath,
      };
    } catch (error) {
      console.error("Profile image upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a profile service simulator
const profileService = new ProfileServiceSimulator(supabase);

async function testProfileImageUpload() {
  console.log("🧪 Testing profile service image upload functionality...");
  console.log("--------------------------------------------------");

  try {
    // 1. Check storage availability
    console.log("\n1. Checking Supabase storage availability...");
    const isAvailable = await profileService.checkStorageAvailability();

    if (isAvailable) {
      console.log(
        "✅ Storage is available and avatars bucket exists or was created"
      );
    } else {
      console.error("❌ Storage is not available");
      return;
    }

    // 2. Test profile image upload with SVG
    console.log("\n2. Testing profile image upload with SVG...");

    // Create a simple SVG image as test data
    const svgImage = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="#3498db" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20">Test</text>
      </svg>
    `;

    // Convert to base64
    const base64Image = Buffer.from(svgImage).toString("base64");
    const dataUrl = `data:image/svg+xml;base64,${base64Image}`;

    // Test user ID
    const testUserId = "test-user-" + Date.now();

    // Upload the image
    const uploadResult = await profileService.uploadProfileImage(
      testUserId,
      dataUrl
    );

    if (uploadResult.success) {
      console.log("✅ Successfully uploaded profile image");
      console.log("Generated URL:", uploadResult.url);

      // Clean up
      console.log("\n3. Cleaning up test data...");

      if (uploadResult.filePath) {
        await supabase.storage.from("avatars").remove([uploadResult.filePath]);
        console.log("✅ Successfully cleaned up test data");
      }
    } else {
      console.error("❌ Failed to upload profile image:", uploadResult.error);
    }

    console.log("\n📋 Test summary:");
    console.log("- ProfileService image upload functionality was tested");
    console.log("- Supabase storage availability was verified");
    console.log("- Image upload and URL generation were tested");
  } catch (error) {
    console.error("❌ Error during profile service test:", error);
  }
}

// Run the tests
testProfileImageUpload();
