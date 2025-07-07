# Supabase RLS (Row Level Security) Troubleshooting Guide

## Problem: 401 Unauthorized Error when Creating Itinerary Requests

### Error Details
```
POST https://xxx.supabase.co/rest/v1/itinerary_requests 401 (Unauthorized)
Error: new row violates row-level security policy for table "itinerary_requests"
```

### Root Cause
The error occurs because:
1. Row Level Security (RLS) is enabled on the `itinerary_requests` table
2. No RLS policies exist that allow users to insert new records
3. The application is using local authentication instead of Supabase Auth

## Solutions

### Option 1: Quick Fix - Disable RLS for Development (RECOMMENDED FOR DEV)

Run the SQL script in Supabase SQL Editor:

```sql
-- Run this in Supabase SQL Editor
\i database/disable_rls_dev.sql
```

Or manually execute:
```sql
ALTER TABLE public.itinerary_requests DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.itinerary_requests TO anon, authenticated;
```

### Option 2: Proper RLS Policies (RECOMMENDED FOR PRODUCTION)

Run the comprehensive RLS setup:

```sql
-- Run this in Supabase SQL Editor
\i database/fix_rls_policies.sql
```

This creates proper policies for:
- Users can create their own requests
- Users can view their own requests
- Admins can manage all requests
- Tour guides can view assigned requests

### Option 3: Hybrid Approach

If using local authentication but want some security:

```sql
-- Allow public insert but with validation
CREATE POLICY "Allow authenticated requests"
ON public.itinerary_requests
FOR INSERT
TO authenticated, anon
WITH CHECK (
  user_id IS NOT NULL 
  AND itinerary_id IS NOT NULL 
  AND email IS NOT NULL
);
```

## Implementation Steps

### Step 1: Choose Your Approach

**For Development/Testing:**
- Use Option 1 (Disable RLS)
- Quick and allows full access
- Not secure but good for development

**For Production:**
- Use Option 2 (Proper RLS)
- Secure and follows best practices
- Requires proper authentication setup

### Step 2: Run the SQL Script

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the chosen SQL script
4. Click "Run"

### Step 3: Verify the Fix

Test the booking form:
1. Try to submit a booking request
2. Check browser console for errors
3. Verify data appears in Supabase table

### Step 4: Update Frontend (if needed)

If using proper RLS with Supabase Auth, update the frontend:

```typescript
// In supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

## Security Considerations

### Development Environment
- Disabling RLS is acceptable for development
- Ensure proper authentication is tested
- Use test data, not real user information

### Production Environment
- Never disable RLS in production
- Always use proper policies
- Test all user roles and permissions
- Implement logging and monitoring

## Common Issues and Solutions

### Issue 1: Policy Not Working
**Problem:** RLS policy exists but users still can't insert
**Solution:** Check policy syntax and ensure user authentication

### Issue 2: Admin Access Denied
**Problem:** Admins can't manage requests
**Solution:** Verify admin role in users table and policy conditions

### Issue 3: Performance Issues
**Problem:** RLS policies causing slow queries
**Solution:** Add proper indexes and optimize policy conditions

```sql
-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_itinerary_requests_user_id 
ON public.itinerary_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_requests_status 
ON public.itinerary_requests(status);
```

## Testing Your Implementation

### 1. Test User Creation
```javascript
// Test creating a request as a regular user
const testRequest = {
  user_id: 1,
  itinerary_id: 1,
  name: "Test User",
  email: "test@example.com",
  start_date: "2024-07-15",
  end_date: "2024-07-22",
  group_size: "2"
};
```

### 2. Test Admin Functions
```javascript
// Test admin can view all requests
const allRequests = await supabase
  .from('itinerary_requests')
  .select('*');
```

### 3. Test Error Handling
```javascript
// Test with invalid data
const invalidRequest = {
  user_id: null, // This should fail
  itinerary_id: 999999, // Non-existent itinerary
  // ... other fields
};
```

## Monitoring and Maintenance

### 1. Regular Security Audits
- Review RLS policies quarterly
- Check for unused permissions
- Monitor failed authentication attempts

### 2. Performance Monitoring
- Track query performance
- Monitor policy evaluation time
- Optimize slow policies

### 3. User Access Logs
```sql
-- Create audit table for tracking access
CREATE TABLE public.access_logs (
  id bigserial PRIMARY KEY,
  user_id bigint,
  action text,
  table_name text,
  timestamp timestamptz DEFAULT now()
);
```

## Next Steps

1. **Immediate:** Choose and implement one of the solutions above
2. **Short-term:** Test the booking functionality thoroughly
3. **Long-term:** Implement proper authentication and authorization
4. **Ongoing:** Monitor and maintain security policies

## Support

If you continue to experience issues:

1. Check Supabase logs in the dashboard
2. Verify your authentication setup
3. Test with a minimal example
4. Contact Supabase support if needed

## Related Files

- `database/fix_rls_policies.sql` - Comprehensive RLS setup
- `database/disable_rls_dev.sql` - Quick development fix
- `src/services/itineraryBookingService.ts` - Updated with better error handling
- `src/components/itineraries/TripPlanningModal.tsx` - Frontend error handling
