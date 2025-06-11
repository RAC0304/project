// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

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
    // Check if storage is configured properly
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Supabase storage error:', error);
      return { 
        ok: false, 
        error: error.message
      };
    }
    
    // Check if avatars bucket exists
    const avatarBucket = buckets?.find(b => b.name === 'avatars');
    if (!avatarBucket) {
      console.warn('Avatars bucket missing in Supabase storage, attempting to create it');
      
      try {
        // Attempt to create the avatars bucket
        const { data: newBucket, error: createError } = await supabase.storage.createBucket(
          'avatars', 
          { public: true } // Make the bucket public for easy access to profile images
        );
        
        if (createError) {
          console.error('Failed to create avatars bucket:', createError);
          return {
            ok: false,
            error: `Could not create avatars bucket: ${createError.message}`,
            buckets: buckets?.map(b => b.name) || []
          };
        }
        
        console.log('Successfully created avatars bucket:', newBucket);
        return { 
          ok: true,
          buckets: [...(buckets?.map(b => b.name) || []), 'avatars'],
          message: 'Created avatars bucket successfully'
        };
      } catch (createError) {
        console.error('Exception creating avatars bucket:', createError);
        return {
          ok: false,
          error: createError instanceof Error ? createError.message : 'Unknown error creating bucket',
          buckets: buckets?.map(b => b.name) || []
        };
      }
    }
    
    return { 
      ok: true,
      buckets: buckets?.map(b => b.name) || []
    };
  } catch (e) {
    console.error('Failed to check Supabase storage status:', e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Unknown error'
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
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Supabase storage error:', listError);
      return { 
        ok: false, 
        error: `Storage error: ${listError.message}`
      };
    }
    
    // Check if bucket exists
    const bucketExists = buckets?.find(b => b.name === bucketName);
    if (bucketExists) {
      console.log(`Bucket "${bucketName}" already exists`);
      return { 
        ok: true,
        message: `Bucket "${bucketName}" exists` 
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
        error: `Could not create bucket: ${createError.message}`
      };
    }
    
    console.log(`Successfully created bucket "${bucketName}"`, data);
    return { 
      ok: true,
      message: `Created bucket "${bucketName}" successfully` 
    };
  } catch (e) {
    console.error(`Error ensuring bucket "${bucketName}" exists:`, e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    };
  }
};

export { supabase };
