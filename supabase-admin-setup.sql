-- This file contains the SQL commands needed to set up admin functionality in Supabase
-- Run these in the Supabase SQL editor

-- 1. Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- 2. Create a function to delete a user by ID (admin only)
CREATE OR REPLACE FUNCTION delete_user_by_id(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calling_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get the ID of the calling user
  calling_user_id := auth.uid();
  
  -- Check if the calling user is an admin
  SELECT profiles.is_admin INTO is_admin
  FROM profiles
  WHERE profiles.id = calling_user_id;
  
  -- If the user is not an admin, raise an exception
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admin users can delete other users';
  END IF;
  
  -- Delete the user from auth.users
  -- This requires enabling the postgres extension and granting permissions
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- 3. Create an RPC function to make a user an admin
CREATE OR REPLACE FUNCTION make_user_admin(target_user_id UUID, set_admin BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calling_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get the ID of the calling user
  calling_user_id := auth.uid();
  
  -- Check if the calling user is an admin
  SELECT profiles.is_admin INTO is_admin
  FROM profiles
  WHERE profiles.id = calling_user_id;
  
  -- If the user is not an admin, raise an exception
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admin users can make other users admins';
  END IF;
  
  -- Update the target user's profile
  UPDATE profiles 
  SET is_admin = set_admin
  WHERE id = target_user_id;
END;
$$;

-- 4. Create Row Level Security policies for admin access
-- This allows admins to see and modify all data

-- Profiles table admin policy
CREATE POLICY "Admins can view all profiles" 
ON profiles 
FOR SELECT
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can update all profiles" 
ON profiles 
FOR UPDATE
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Recipes table admin policies
CREATE POLICY "Admins can view all recipes" 
ON recipes 
FOR SELECT
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can delete any recipe" 
ON recipes 
FOR DELETE
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 5. Instructions for making the first admin user
/*
To make your first admin user:
1. Sign up for an account through your application
2. Get your user ID from the auth.users table
3. Run the following SQL in the Supabase SQL editor:

UPDATE profiles 
SET is_admin = true 
WHERE id = 'your-user-id-here';

Replace 'your-user-id-here' with your actual user ID.
*/

-- 6. Recommended: Create a view of users for admin dashboard
CREATE VIEW admin_users_view AS
SELECT 
  profiles.id,
  profiles.username,
  profiles.avatar_url,
  profiles.created_at,
  profiles.is_admin,
  auth.users.email,
  (SELECT COUNT(*) FROM recipes WHERE user_id = profiles.id) as recipe_count
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id;

-- Grant access to the view only to authenticated users
CREATE POLICY "Allow authenticated users to view admin_users_view"
ON admin_users_view
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Create banned_emails table
create table public.banned_emails (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    reason text,
    created_at timestamp with time zone default now()
);

-- Set up RLS for banned_emails
alter table public.banned_emails enable row level security;

-- Create policy to allow admins to see all banned emails
create policy "Admins can view all banned emails"
on public.banned_emails for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
);

-- Create policy to allow admins to insert banned emails
create policy "Admins can ban emails"
on public.banned_emails for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
);

-- Create policy to allow admins to delete banned emails
create policy "Admins can remove banned emails"
on public.banned_emails for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
);

-- Create a function to handle new user signups and preserve usernames
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  preferred_username TEXT;
BEGIN
  -- Check if user has a preferred username in metadata
  preferred_username := NEW.raw_user_meta_data->>'preferred_username';
  
  -- If no preferred username, generate one based on user id
  IF preferred_username IS NULL THEN
    preferred_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;
  
  -- Insert a new row into profiles table
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (NEW.id, preferred_username, now())
  ON CONFLICT (id) DO
    -- If there's already a profile (rare race condition), only update if current username starts with 'user_'
    UPDATE SET username = preferred_username
    WHERE profiles.username LIKE 'user_%';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call this function after a user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add critical RLS policies for profiles to allow users to manipulate their own profiles
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- Add default public profile policies for read access
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles
FOR SELECT
USING (true);

-- Create a function to properly set a username after registration
CREATE OR REPLACE FUNCTION public.set_username_after_signup(p_user_id UUID, p_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with elevated privileges
AS $$
BEGIN
  -- Only update if current username is auto-generated
  UPDATE public.profiles
  SET username = p_username
  WHERE id = p_user_id
    AND (username LIKE 'user_%' OR username IS NULL);
  
  RETURN FOUND;
END;
$$; 