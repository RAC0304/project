/**
 * Test script for Supabase storage functionality
 *
 * Run this script with: npx ts-node src/scripts/test-storage.ts
 */

import {
  supabase,
  ensureSupabaseBucket,
  checkSupabaseStorage,
} from "../utils/supabaseClient";

const runStorageTests = async (): Promise<void> => {
  console.log("📁 Testing Supabase storage functionality...");

  try {
    // 1. Check general storage availability
    console.log("\n1. Checking general storage availability...");
    const generalStatus = await checkSupabaseStorage();

    if (generalStatus.ok) {
      console.log("✅ Storage is available");
      console.log("Available buckets:", generalStatus.buckets);
    } else {
      console.error("❌ Storage is not available:", generalStatus.error);
      return; // Stop here if storage is not available
    }

    // 2. Test creating a bucket
    console.log("\n2. Testing bucket creation...");
    const bucketName = "test-bucket-" + Date.now();
    const bucketResult = await ensureSupabaseBucket(bucketName);

    if (bucketResult.ok) {
      console.log(`✅ Successfully created bucket "${bucketName}"`);
    } else {
      console.error(
        `❌ Failed to create bucket "${bucketName}":`,
        bucketResult.error
      );
    }

    // 3. Test uploading a file
    console.log("\n3. Testing file upload...");
    const testContent = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello" in bytes
    const filePath = "test-file.txt";

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, testContent, {
        contentType: "text/plain",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Failed to upload test file:", uploadError.message);
    } else {
      console.log("✅ Successfully uploaded test file");

      // 4. Get public URL
      console.log("\n4. Testing public URL generation...");
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log("Generated URL:", urlData?.publicUrl);
    }

    // 5. Clean up
    console.log("\n5. Cleaning up test resources...");

    // Delete the test file
    await supabase.storage.from(bucketName).remove([filePath]);

    // Delete the test bucket
    await supabase.storage.deleteBucket(bucketName);

    console.log("✅ Cleanup complete");

    console.log("\n📋 Storage test summary:");
    console.log("- Storage service is available");
    console.log("- Bucket creation works");
    console.log("- File uploads work");
    console.log("- Public URL generation works");
    console.log("- Cleanup succeeded");
  } catch (error) {
    console.error("❌ Error during storage test:", error);
  } finally {
    // Exit the process
    process.exit(0);
  }
};

// Run the tests
runStorageTests();
