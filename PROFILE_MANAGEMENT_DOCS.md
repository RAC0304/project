# Profile Management with Supabase

This document explains the implementation of profile management functionality using Supabase for backend storage, database, and image handling.

## Overview

The profile management system allows users to:

- Update their profile information
- Upload profile pictures
- Remove custom profile pictures
- Store all data in Supabase

## Key Components

### 1. ProfileService

Located in `src/services/profileService.ts`, this service handles:

- Profile data updates through Supabase
- Profile image uploads to Supabase Storage
- Proper error handling and fallbacks

```typescript
// Main methods
updateProfile(userId, updates) - Updates user profile data and handles image uploads
uploadProfileImage(userId, base64Image) - Handles profile image upload to Supabase storage
```

### 2. Supabase Storage Integration

Located in `src/utils/supabaseClient.ts`, these utilities provide:

- Storage availability checking
- Automatic bucket creation if missing
- Secure URL generation for profile images

```typescript
checkSupabaseStorage() - Verifies if Supabase storage is available
ensureSupabaseBucket() - Creates a bucket if it doesn't exist
```

### 3. User Profile Page

Located in `src/pages/UserProfilePage.tsx`, this component:

- Displays user profile information
- Provides UI for editing profile data
- Handles image upload and display
- Shows loading states for async operations

## Storage Structure

All profile images are stored in the Supabase storage bucket called `avatars`, in the `profiles/` folder with the naming convention: `user_[USER_ID]_[TIMESTAMP].[EXTENSION]`.

## Error Handling

The system includes robust error handling for:

- Missing Supabase storage
- Failed image uploads
- Invalid image formats
- Network failures

## Testing

Two test scripts are provided to validate the functionality:

1. `test-storage.js` - Tests basic Supabase storage functionality
2. `test-profile-service.js` - Tests the ProfileService's image upload capability

To run the tests:

```bash
# Install dependencies if not already installed
npm install dotenv @supabase/supabase-js

# Run storage tests
node test-storage.js

# Run profile service tests
node test-profile-service.js
```

## Integration Flow

1. User selects a profile image or updates profile info
2. Data is sent to the Auth Context's `updateProfile` method
3. Auth Context calls ProfileService's `updateProfile` method
4. For images, `uploadProfileImage` is called to handle Supabase storage operations
5. URLs are generated for uploaded images
6. Profile data is updated in the database
7. UI is updated to reflect changes

## Environmental Requirements

Requires the following environment variables:

- `VITE_SUPABASE_URL`: The URL of your Supabase project
- `VITE_SUPABASE_ANON_KEY`: Anon/public key for your Supabase project

## Improvements and Future Work

Potential improvements include:

- Image resizing before upload to reduce storage usage
- Caching of profile images for better performance
- Additional image validation on the client side
- Implementing image cropping functionality
