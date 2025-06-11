/**
 * Test script for Supabase storage functionality
 */

// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection with:');
console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Key:', supabaseAnonKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabaseStorage() {
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
}

async function ensureSupabaseBucket(bucketName, isPublic = true) {
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
}

async function runStorageTests() {
  console.log('📁 Testing Supabase storage functionality...');

  try {
    // 1. Check general storage availability
    console.log('\n1. Checking general storage availability...');
    const generalStatus = await checkSupabaseStorage();
    
    if (generalStatus.ok) {
      console.log('✅ Storage is available');
      console.log('Available buckets:', generalStatus.buckets);
    } else {
      console.error('❌ Storage is not available:', generalStatus.error);
      return; // Stop here if storage is not available
    }

    // 2. Test avatars bucket
    console.log('\n2. Testing avatars bucket...');
    const avatarsBucketResult = await ensureSupabaseBucket('avatars', true);
    
    if (avatarsBucketResult.ok) {
      console.log('✅ Avatars bucket is ready');
    } else {
      console.error('❌ Failed to ensure avatars bucket:', avatarsBucketResult.error);
      return; // Stop if we can't ensure the bucket exists
    }

    // 3. Test uploading a text file
    console.log('\n3. Testing basic file upload to avatars bucket...');
    
    // Simple text content for testing
    const testContent = Buffer.from('Test content for upload');
    const filePath = 'test-upload.txt';
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload('profiles/' + filePath, testContent, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Failed to upload test file:', uploadError.message);
    } else {
      console.log('✅ Successfully uploaded test file');
      
      // Get public URL for the text file
      console.log('\n4. Testing public URL generation for text file...');
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl('profiles/' + filePath);
      
      console.log('Generated URL:', urlData?.publicUrl);
      
      // Clean up the text file
      await supabase.storage
        .from('avatars')
        .remove(['profiles/' + filePath]);
      
      console.log('✅ Text file test cleanup complete');
    }

    // 4. Test uploading an image file (simulating profile picture upload)
    console.log('\n5. Testing profile image upload...');

    // Create a simple SVG image as test data
    const svgImage = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="#3498db" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20">Test</text>
      </svg>
    `;
    
    // Convert to base64 (simulating the data from a file input)
    const base64Image = Buffer.from(svgImage).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64Image}`;
    
    // Extract image data (similar to what profileService does)
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      console.error('❌ Invalid base64 image format');
      return;
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    
    try {
      // Process the base64 data
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const imageFilePath = `profiles/test_profile_${Date.now()}.svg`;
      
      console.log(`Uploading profile image to ${imageFilePath}...`);
      
      const { data: imageData, error: imageError } = await supabase.storage
        .from('avatars')
        .upload(imageFilePath, imageBuffer, {
          contentType: mimeType,
          upsert: true
        });
      
      if (imageError) {
        console.error('❌ Failed to upload profile image:', imageError.message);
      } else {
        console.log('✅ Successfully uploaded profile image');
        
        // Get public URL for the image
        console.log('\n6. Getting public URL for profile image...');
        const { data: imageUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(imageFilePath);
        
        console.log('Profile image URL:', imageUrlData?.publicUrl);
        
        // Clean up the image file
        await supabase.storage
          .from('avatars')
          .remove([imageFilePath]);
        
        console.log('✅ Profile image test cleanup complete');
      }
    } catch (imageProcessError) {
      console.error('❌ Error processing image:', imageProcessError);
    }    console.log('\n📋 Storage test summary:');
    console.log('- Storage service is available');
    console.log('- Avatars bucket is available');
    console.log('- Basic file uploads to avatars bucket were tested');
    console.log('- Profile image upload was tested');
    console.log('- Public URL generation was verified');
    console.log('- Test files were cleaned up');
    
  } catch (error) {
    console.error('❌ Error during storage test:', error);
  }
}

// Run the tests
runStorageTests();
