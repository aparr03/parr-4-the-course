# React Context Directory

This directory contains React Context providers that manage global state across the application.

## Authentication Context

`AuthContext.tsx` is the main authentication context that:

1. **Manages user authentication state** throughout the application
2. **Provides authentication methods** like:
   - `signIn` - Log in existing users
   - `signUp` - Register new users
   - `signOut` - Log out current user
   - `resetPasswordForEmail` - Password reset flow

3. **Exposes user data** and authentication status to components via the `useAuth` hook

## Usage

Components can access auth functionality by using the `useAuth` hook:

```tsx
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { user, signIn, signOut, isLoading } = useAuth();
  
  // Now you can use auth functionality and access user data
  return (
    <div>
      {user ? `Hello, ${user.email}` : "Please log in"}
    </div>
  );
}
```

## Related Files

- `/src/components/ProtectedRoute.tsx` - Component that restricts access to authenticated users
- `/api/src/middleware/auth.ts` - Backend middleware that verifies authentication tokens
- `/api/src/routes/auth.ts` - Backend API endpoints for authentication operations 