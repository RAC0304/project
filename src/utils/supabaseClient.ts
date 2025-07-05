// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Add a helper function to check storage status and ensure avatar bucket exists
export const checkSupabaseStorage = async () => {
  try {
    // Instead of listing buckets (which may fail due to RLS),
    // try to directly access the avatars bucket
    console.log("Testing direct access to avatars bucket...");

    const { error } = await supabase.storage
      .from("avatars")
      .list("", { limit: 1 });

    if (error) {
      // If error is about bucket not found, that's the real issue
      if (error.message.includes("Bucket not found")) {
        console.warn("Avatars bucket not found in Supabase storage.");
        return {
          ok: false,
          error:
            "Avatars bucket not found. Please create it manually in Supabase dashboard.",
        };
      }

      // If it's a permission error, bucket exists but we can't list contents
      // That's actually OK for our purposes
      if (
        error.message.includes("permission") ||
        error.message.includes("policy")
      ) {
        console.log(
          "Avatars bucket exists but listing is restricted (this is OK)"
        );
        return {
          ok: true,
          message: "Avatars bucket exists (verified via direct access)",
        };
      }

      // Other errors
      console.error("Supabase storage error:", error);
      return {
        ok: false,
        error: error.message,
      };
    }

    // If we can list contents, bucket definitely exists
    console.log("Avatars bucket verified via direct access");
    return {
      ok: true,
      message: "Avatars bucket exists and accessible",
    };
  } catch (e) {
    console.error("Failed to check Supabase storage status:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};

/**
 * Ensure a specific bucket exists in Supabase storage
 * @param bucketName Name of the bucket to check/create
 * @param isPublic Whether the bucket should be publicly accessible
 * @returns Result object with status and error information
 */
export const ensureSupabaseBucket = async (
  bucketName: string,
  isPublic = true
): Promise<{ ok: boolean; message?: string; error?: string }> => {
  try {
    console.log(`Checking if bucket "${bucketName}" exists...`);

    // Check if buckets can be listed
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("Supabase storage error:", listError);
      return {
        ok: false,
        error: `Storage error: ${listError.message}`,
      };
    }

    // Check if bucket exists
    const bucketExists = buckets?.find((b) => b.name === bucketName);
    if (bucketExists) {
      console.log(`Bucket "${bucketName}" already exists`);
      return {
        ok: true,
        message: `Bucket "${bucketName}" exists`,
      };
    }

    // Create the bucket if it doesn't exist
    console.log(`Creating bucket "${bucketName}"...`);
    const { data, error: createError } = await supabase.storage.createBucket(
      bucketName,
      { public: isPublic }
    );

    if (createError) {
      console.error(`Failed to create bucket "${bucketName}":`, createError);
      return {
        ok: false,
        error: `Could not create bucket: ${createError.message}`,
      };
    }

    console.log(`Successfully created bucket "${bucketName}"`, data);
    return {
      ok: true,
      message: `Created bucket "${bucketName}" successfully`,
    };
  } catch (e) {
    console.error(`Error ensuring bucket "${bucketName}" exists:`, e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};

// Helper function to construct profile picture URLs
export const getProfilePictureUrl = (
  filename: string | null | undefined
): string => {
  if (!filename || filename.trim() === "") {
    return "";
  }

  // If it's already a full URL, return as-is
  if (filename.startsWith("http")) {
    return filename;
  }

  // Construct the Supabase storage URL
  return `${supabaseUrl}/storage/v1/object/public/avatars/profile/${filename}`;
};

// Helper function to get fallback avatar URL
export const getFallbackAvatarUrl = (name: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    name
  )}`;
};

// Export both the client and the URL
export { supabase, supabaseUrl };
