# Enhanced Supabase Registration System

## Overview
This document describes the enhanced backend registration system implemented with Supabase for the WanderWise Indonesia application.

## Architecture

### Frontend Components
1. **EnhancedRegister.tsx** - Enhanced registration UI with improved validation and user experience
2. **useRegistration.ts** - Custom React hook for registration logic
3. **registrationValidator.ts** - Client-side validation utilities
4. **enhancedAuthService.ts** - Enhanced authentication service

### Backend Components
1. **routes/auth.js** - Express routes for authentication API
2. **config/supabaseConfig.js** - Supabase client configuration for backend
3. **Enhanced authService.ts** - Improved authentication service with security logging

## Features

### ✅ Enhanced Validation
- **Email validation** with proper regex
- **Password strength** requirements (uppercase, lowercase, numbers)
- **Username validation** (length, allowed characters)
- **Name validation** (letters, spaces, hyphens, apostrophes only)
- **Phone number validation** for Indonesian numbers
- **Age validation** (minimum 13 years old)

### ✅ Security Features
- **Duplicate prevention** for email and username
- **Security event logging** for all registration attempts
- **Password strength indicator** in UI
- **Input sanitization** and validation
- **Transaction-like operations** with cleanup on failure

### ✅ User Experience
- **Real-time validation** with field-specific error messages
- **Password visibility toggle** 
- **Password match indicator**
- **Loading states** and animations
- **Success notifications** with auto-redirect
- **Availability checking** for email/username

### ✅ Role-Based Registration
- **Customer registration** - Standard user account
- **Tour Guide registration** - Automatically creates tour guide profile
- **Admin registration** - Admin-level access (backend only)

## API Endpoints

### POST /api/auth/register
Registers a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "wanderer123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer", // or "tour_guide"
  "phone": "+62 812 3456 7890", // optional
  "dateOfBirth": "1990-01-01" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "wanderer123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer",
    "phone": "+62 812 3456 7890",
    "isActive": true,
    "createdAt": "2025-06-10T10:00:00Z"
  }
}
```

### POST /api/auth/check-availability
Checks if email/username is available.

**Request Body:**
```json
{
  "email": "user@example.com", // optional
  "username": "wanderer123" // optional
}
```

**Response:**
```json
{
  "success": true,
  "available": {
    "email": true,
    "username": false
  }
}
```

### GET /api/auth/validate-token
Validates authentication token and returns user data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "wanderer123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer",
    "isActive": true,
    "createdAt": "2025-06-10T10:00:00Z"
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL, -- Managed by Supabase Auth
    role user_role DEFAULT 'customer',
    phone VARCHAR(255) NULL,
    date_of_birth DATE NULL,
    gender user_gender NULL,
    profile_picture VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(255) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tour Guides Table
```sql
CREATE TABLE tour_guides (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bio TEXT NULL,
    specialties JSONB NULL,
    location VARCHAR(255) NOT NULL,
    short_bio TEXT NULL,
    experience INTEGER DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    availability VARCHAR(255) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Security Logs Table
```sql
CREATE TABLE security_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255) NOT NULL,
    user_agent TEXT NOT NULL,
    status security_status DEFAULT 'success',
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Configuration
VITE_API_URL=http://localhost:3000/api
```

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js bcryptjs express cors dotenv
```

### 3. Run Database Migrations
```bash
npm run db:setup
```

### 4. Start the Server
```bash
npm run server:dev  # Development
npm run server      # Production
```

### 5. Test the Registration System
```bash
node test-enhanced-registration.js
```

## Usage Examples

### Frontend Registration
```tsx
import { useRegistration } from '../hooks/useRegistration';

const RegisterPage = () => {
  const {
    formData,
    errors,
    isLoading,
    updateField,
    submitRegistration
  } = useRegistration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitRegistration();
    if (success) {
      // Handle success
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        type="email"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};
```

### Backend Integration
```javascript
import enhancedAuthService from './services/enhancedAuthService';

// Register new user
const result = await enhancedAuthService.register(
  'user@example.com',
  'SecurePass123!',
  'username',
  'John',
  'Doe',
  'Traveler',
  '+62 812 3456 7890'
);

if (result.success) {
  console.log('User registered:', result.user);
} else {
  console.error('Registration failed:', result.error);
}
```

## Security Considerations

1. **Password Requirements**: Enforced strength requirements
2. **Input Validation**: Server-side validation for all inputs
3. **SQL Injection Prevention**: Using parameterized queries
4. **Rate Limiting**: Should be implemented for production
5. **HTTPS**: Required for production deployment
6. **Security Logging**: All attempts are logged for monitoring

## Monitoring & Logging

All registration attempts are logged in the `security_logs` table with:
- User ID (if available)
- Action performed
- IP address
- User agent
- Status (success/failed/warning)
- Detailed error messages
- Timestamp

## Error Handling

The system provides comprehensive error handling with:
- Field-specific validation errors
- General error messages
- Network error handling
- Transaction rollback on failure
- Cleanup of partially created data

## Testing

Run the test suite to verify functionality:
```bash
node test-enhanced-registration.js
```

The test covers:
- Availability checking
- User registration
- Tour guide registration
- Duplicate prevention
- Validation error handling

## Future Enhancements

1. **Email Verification**: Send confirmation emails
2. **SMS Verification**: Phone number verification
3. **Social Login**: Google, Facebook integration
4. **Rate Limiting**: Prevent brute force attacks
5. **CAPTCHA**: Bot prevention
6. **Account Recovery**: Password reset functionality
