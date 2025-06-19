# Supabase Database Connection Test

This component allows administrators to test and verify the connection to the Supabase PostgreSQL database used by WanderWise Indonesia application.

## Features

- **Connection Testing**: Verifies if the application can connect to the Supabase database
- **Database Statistics**: Displays the counts of key records (users, destinations, bookings, etc.)
- **Table Explorer**: Allows browsing available tables and viewing sample data
- **Storage Status**: Checks availability of Supabase storage buckets for file uploads

## Prerequisites

Before using this component, ensure you have:

1. A Supabase project created at [https://supabase.com](https://supabase.com)
2. Environment variables configured in your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Database tables created using the application's setup scripts

## Setup Database Function (Optional)

For enhanced functionality, you can add the `get_tables` database function to your Supabase project:

1. Navigate to the SQL Editor in your Supabase dashboard
2. Execute the SQL in `database/get_tables_function.sql`
3. This allows the component to list all available tables

## Usage

Import and use the component in your admin panel:

```jsx
import DatabaseConnectionTest from "../components/admin/DatabaseConnectionTest";

// In your admin page component:
return (
  <div className="admin-page">
    <h1>Admin Dashboard</h1>
    <DatabaseConnectionTest />
  </div>
);
```

## Troubleshooting

If you encounter connection issues:

1. Verify your Supabase URL and API key in `.env`
2. Check that your IP address is allowed in Supabase dashboard settings
3. Ensure that Row Level Security policies are configured correctly
4. Verify if the required tables exist in your database

## Security Note

This component should only be accessible to authenticated administrators. Ensure proper access controls are in place for any routes that use this component.
