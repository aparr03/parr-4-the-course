# Admin Functionality Setup

This document provides instructions for setting up and using the admin functionality in your recipe application.

## Setup Instructions

### 1. Run the SQL Setup Script

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of the `supabase-admin-setup.sql` file
4. Run the SQL script

### 2. Set Up Your First Admin User

After running the SQL script:

1. Sign in to your application with the account you want to make an admin
2. Get your user ID from the Supabase dashboard:
   - Go to Authentication > Users
   - Find your user and copy the User UID
3. Run the following SQL in the Supabase SQL editor:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'your-user-id-here';
```

Replace `'your-user-id-here'` with your actual user ID.

### 3. Test Admin Access

1. Sign in to the application with your admin account
2. You should now see an "Admin Dashboard" option in your user menu
3. Click on it to access the admin functionality

## Admin Features

The admin dashboard provides the following features:

### User Management

- View all users registered in the system
- Search for users by username
- See user details, including registration date and admin status
- Delete user accounts (this also deletes all their recipes)

### Recipe Management

- View all recipes in the system
- Search for recipes by title or author
- Delete any recipe regardless of owner

## Implementation Details

The admin functionality is implemented with:

1. **Database-Level Security**: Using Supabase Row-Level Security policies that check admin status
2. **Server-Side Functions**: Using secure RPC functions that verify admin status
3. **Client-Side UI**: Admin-only interfaces that are conditionally rendered

### Security Model

The admin functionality follows a strict security model:

- Admin status is checked server-side through database RLS policies
- Critical operations require admin verification
- All admin operations are logged through Supabase's built-in audit system

### Important Files

- `src/services/adminService.ts`: Admin-specific API functions
- `src/pages/AdminPage.tsx`: Admin dashboard UI
- `supabase-admin-setup.sql`: Database setup for admin functionality

## Troubleshooting

### Common Issues

1. **Admin functions not working**:
   - Verify the user has is_admin=true in the profiles table
   - Check Supabase logs for policy violations

2. **Admin UI not showing**:
   - Clear browser cache and reload
   - Verify the admin status check in Navbar.tsx is working correctly

3. **Cannot delete users**:
   - Ensure the RPC function permissions are set correctly
   - Verify that Postgres permissions allow auth.users deletion

## Best Practices

1. Only grant admin access to trusted users
2. Regularly audit admin actions through Supabase logs
3. Consider implementing more granular permissions if needed 