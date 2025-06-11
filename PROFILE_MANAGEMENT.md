# Profile Management with Supabase

This document provides instructions for setting up and testing the profile management functionality with Supabase storage.

## Setup

1. Make sure your Supabase environment variables are correctly set in your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Ensure the `avatars` storage bucket is created in your Supabase project.
   - The application will attempt to create it automatically if it doesn't exist
   - You can manually create it in the Supabase dashboard under Storage

3. Set up the proper CORS configuration in Supabase:
   - Go to your Supabase project dashboard
   - Navigate to Storage > Policies
   - Set the bucket to public if you want the avatars to be publicly accessible
   - Add appropriate RLS (Row Level Security) policies for file uploads and downloads

## Testing

### Automated Testing

You can run the automated test script to verify Supabase storage functionality:

```bash
npx ts-node src/scripts/test-storage.ts
```

### Manual Testing

1. Log in to the application
2. Navigate to the User Profile page
3. If you're in development mode, click the "Test Storage" button to verify Supabase storage is working
4. Try uploading a profile image by clicking the camera icon
5. Verify that the image appears correctly and persists after page refresh

## Troubleshooting

### Common Issues

1. **"Storage is not available" error**
   - Verify your Supabase URL and API key
   - Make sure your storage module is enabled in Supabase

2. **"Bucket not found" error**
   - The application should automatically create the bucket, but you can create it manually in the Supabase dashboard

3. **Upload permission denied**
   - Check your storage bucket permissions in Supabase
   - Make sure you have appropriate Row Level Security policies set up

4. **Images not displaying**
   - Verify the public URL is correctly generated
   - Check your browser console for CORS errors
   - Ensure your bucket is set to public access

### Debug Mode

To enable detailed debugging logs, add this to your application code:

```typescript
localStorage.setItem('DEBUG_PROFILE_SERVICE', 'true');
```

## Implementation Notes

- Profile images are stored in the `avatars` bucket with path pattern `profiles/user_[userId]_[timestamp].[ext]`
- Base64 images are converted to Blobs before upload to ensure compatibility
- The profile service handles fallbacks to default avatars if uploads fail
