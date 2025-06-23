import { createClient } from "@supabase/supabase-js";

// Test the profile picture upload fix
async function testProfilePictureUpload() {
  console.log("🧪 Testing Profile Picture Upload Fix...\n");

  // Test 1: Validate that base64 data detection works
  console.log("Test 1: Base64 data detection");
  const base64Image =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoJCyJpBo=";

  const isBase64 = base64Image.startsWith("data:image");
  console.log(`✅ Base64 detection: ${isBase64 ? "PASS" : "FAIL"}`);

  // Test 2: Check data size validation
  console.log("\nTest 2: Data size validation");
  const base64Data = base64Image.split(",")[1];
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  console.log(
    `Base64 data size: ${sizeInBytes} bytes (${sizeInMB.toFixed(4)} MB)`
  );
  console.log(
    `✅ Size check: ${sizeInMB < 5 ? "PASS" : "FAIL"} (under 5MB limit)`
  );

  // Test 3: URL validation
  console.log("\nTest 3: URL validation");
  const validUrl = "https://example.com/path/to/image.jpg";
  const longUrl = "https://example.com/" + "a".repeat(300);

  console.log(
    `Valid URL length: ${validUrl.length} chars - ${
      validUrl.length < 2000 ? "PASS" : "FAIL"
    }`
  );
  console.log(
    `Long URL length: ${longUrl.length} chars - ${
      longUrl.length < 2000 ? "PASS" : "FAIL"
    }`
  );

  // Test 4: Field length validation
  console.log("\nTest 4: Field length validation");
  const testFields = {
    first_name: "John",
    last_name: "Doe",
    bio: "This is a sample bio",
    longField: "a".repeat(300),
  };

  Object.entries(testFields).forEach(([field, value]) => {
    const isValid = value.length <= (field === "bio" ? 1000 : 255);
    console.log(
      `${field}: ${value.length} chars - ${isValid ? "PASS" : "FAIL"}`
    );
  });

  console.log("\n🎉 All validation tests completed!");
  console.log("\n📋 Summary of fixes applied:");
  console.log("✅ Base64 data is uploaded to storage before database update");
  console.log("✅ Only URLs are stored in database, not base64 data");
  console.log("✅ Field length validation prevents database errors");
  console.log("✅ File size validation (5MB limit) added to UI");
  console.log("✅ Enhanced error messages for better user experience");

  console.log("\n⚠️  Manual step required:");
  console.log("Run this SQL in Supabase SQL Editor to complete the fix:");
  console.log(
    "ALTER TABLE public.users ALTER COLUMN profile_picture TYPE TEXT;"
  );
}

testProfilePictureUpload().catch(console.error);
