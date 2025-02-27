# Supabase Database Setup Guide

This guide will help you set up the necessary database tables and configurations in Supabase for your recipe application.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com) and login or create an account
2. Click on "New Project"
3. Enter a project name and set a secure database password
4. Choose the region closest to your users
5. Click "Create new project" and wait for it to be created

## Step 2: Set Up the Database Schema

There are two ways to set up your database schema:

### Option 1: Using the SQL Editor

1. In your Supabase project, navigate to the SQL Editor
2. Create a new query
3. Copy the contents of the `schema.sql` file in this directory
4. Execute the SQL to create all necessary tables and policies
5. Then run the `initial_data.sql` script to populate initial categories and common ingredients

### Option 2: Using the Table Editor

If you prefer a visual interface, you can create each table manually:

#### Profiles Table
- Fields:
  - `id`: uuid (Primary Key, References auth.users)
  - `username`: text (Unique, Required)
  - `full_name`: text
  - `avatar_url`: text
  - `created_at`: timestamp with timezone (Default: now())
  - `updated_at`: timestamp with timezone (Default: now())

#### Recipes Table
- Fields:
  - `id`: uuid (Primary Key, Default: gen_random_uuid())
  - `title`: text (Required)
  - `description`: text
  - `instructions`: text (Required)
  - `cook_time_minutes`: integer
  - `prep_time_minutes`: integer
  - `servings`: integer
  - `image_url`: text
  - `user_id`: uuid (Foreign Key → profiles.id)
  - `created_at`: timestamp with timezone (Default: now())
  - `updated_at`: timestamp with timezone (Default: now())

#### Ingredients Table
- Fields:
  - `id`: uuid (Primary Key, Default: gen_random_uuid())
  - `name`: text (Unique, Required)
  - `created_at`: timestamp with timezone (Default: now())

#### Recipe_Ingredients Junction Table
- Fields:
  - `id`: uuid (Primary Key, Default: gen_random_uuid())
  - `recipe_id`: uuid (Foreign Key → recipes.id)
  - `ingredient_id`: uuid (Foreign Key → ingredients.id)
  - `quantity`: text (Required)
  - `unit`: text
  - `created_at`: timestamp with timezone (Default: now())
  - `updated_at`: timestamp with timezone (Default: now())
- Constraints:
  - Unique(recipe_id, ingredient_id)

#### Categories Table
- Fields:
  - `id`: uuid (Primary Key, Default: gen_random_uuid())
  - `name`: text (Unique, Required)
  - `created_at`: timestamp with timezone (Default: now())

#### Recipe_Categories Junction Table
- Fields:
  - `id`: uuid (Primary Key, Default: gen_random_uuid())
  - `recipe_id`: uuid (Foreign Key → recipes.id)
  - `category_id`: uuid (Foreign Key → categories.id)
  - `created_at`: timestamp with timezone (Default: now())
- Constraints:
  - Unique(recipe_id, category_id)

#### Favorites Table
- Fields:
  - `id`: uuid (Primary Key, Default: gen_random_uuid())
  - `user_id`: uuid (Foreign Key → profiles.id)
  - `recipe_id`: uuid (Foreign Key → recipes.id)
  - `created_at`: timestamp with timezone (Default: now())
- Constraints:
  - Unique(user_id, recipe_id)

#### Comments Table
- Fields:
  - `id`: uuid (Primary Key, Default: gen_random_uuid())
  - `content`: text (Required)
  - `user_id`: uuid (Foreign Key → profiles.id)
  - `recipe_id`: uuid (Foreign Key → recipes.id)
  - `created_at`: timestamp with timezone (Default: now())
  - `updated_at`: timestamp with timezone (Default: now())

#### Ratings Table
- Fields:
  - `id`: uuid (Primary Key, Default: gen_random_uuid())
  - `rating`: integer (Required, Check: between 1 and 5)
  - `user_id`: uuid (Foreign Key → profiles.id)
  - `recipe_id`: uuid (Foreign Key → recipes.id)
  - `created_at`: timestamp with timezone (Default: now())
  - `updated_at`: timestamp with timezone (Default: now())
- Constraints:
  - Unique(user_id, recipe_id)

## Step 3: Configure Row-Level Security (RLS)

After creating your tables, you need to:

1. Enable RLS on all tables: In the Table Editor, select each table → "Authentication" tab → Enable RLS
2. Add RLS policies for each table using the policies defined in `schema.sql`

## Step 4: Create Storage Buckets (for recipe images)

1. Navigate to Storage in your Supabase dashboard
2. Create two new buckets:
   - `recipe-images`: for storing recipe images
   - `avatar-images`: for user profile pictures
3. Configure appropriate RLS policies for these buckets

## Step 5: Update Environment Variables

Make sure to update your application's environment variables with your Supabase URL and API key:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema Diagram

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   profiles  │     │   recipes   │     │  ingredients │
├─────────────┤     ├─────────────┤     ├──────────────┤
│ id          │     │ id          │     │ id           │
│ username    │     │ title       │     │ name         │
│ full_name   │     │ description │     │ created_at   │
│ avatar_url  │     │ instructions│     └──────┬───────┘
│ created_at  │     │ cook_time   │            │
│ updated_at  │◄────┤ prep_time   │            │
└──────┬──────┘     │ servings    │            │
       │            │ image_url   │            │
       │            │ user_id     │            │
       │            │ created_at  │            │
       │            │ updated_at  │            │
       │            └──────┬──────┘            │
       │                   │                   │
       │                   │                   │
       │            ┌──────┴───────┐          │
       │            │ recipe_      │          │
       │            │ ingredients  │          │
       │            ├──────────────┤          │
       │            │ id           │          │
       │            │ recipe_id    ├──────────┘
       │            │ ingredient_id│
       │            │ quantity     │      ┌───────────┐
       │            │ unit         │      │ categories│
       │            │ created_at   │      ├───────────┤
       │            │ updated_at   │      │ id        │
       │            └──────────────┘      │ name      │
       │                   ▲              │ created_at│
       │                   │              └─────┬─────┘
       │                   │                    │
       │            ┌──────┴───────┐           │
       │            │ recipe_      │           │
       │            │ categories   │           │
       │            ├──────────────┤           │
       │            │ id           │           │
       │            │ recipe_id    │           │
       │            │ category_id  ├───────────┘
       │            │ created_at   │
       │            └──────────────┘
       │
       │            ┌──────────────┐
       │            │  favorites   │
       │            ├──────────────┤
       │            │ id           │
       │            │ user_id      │
       └────────────┤ recipe_id    │
                    │ created_at   │
                    └──────────────┘
       ┌────────────────────────────┐
       │                            │
┌──────┴───────┐            ┌──────┴───────┐
│   comments   │            │    ratings   │
├──────────────┤            ├──────────────┤
│ id           │            │ id           │
│ content      │            │ rating       │
│ user_id      │            │ user_id      │
│ recipe_id    │            │ recipe_id    │
│ created_at   │            │ created_at   │
│ updated_at   │            │ updated_at   │
└──────────────┘            └──────────────┘
```
