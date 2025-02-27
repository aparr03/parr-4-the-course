
-- USERS table (using Supabase Auth)
-- This leverages Supabase Auth's built-in users table (auth.users)
-- We'll create a public profiles table that references it

-- PROFILES table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Secure profiles with RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RECIPES table
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  cook_time_minutes INTEGER,
  prep_time_minutes INTEGER,
  servings INTEGER,
  image_url TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Secure recipes with RLS policies
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- INGREDIENTS table
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Secure ingredients with RLS policies
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- RECIPE_INGREDIENTS junction table 
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(recipe_id, ingredient_id)
);

-- Secure recipe_ingredients with RLS policies
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- CATEGORIES table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Secure categories with RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RECIPE_CATEGORIES junction table
CREATE TABLE recipe_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(recipe_id, category_id)
);

-- Secure recipe_categories with RLS policies
ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;

-- FAVORITES table
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, recipe_id)
);

-- Secure favorites with RLS policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- COMMENTS table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Secure comments with RLS policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RATINGS table
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, recipe_id)
);

-- Secure ratings with RLS policies
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security (RLS) policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Recipes are viewable by everyone" 
ON recipes FOR SELECT USING (true);

CREATE POLICY "Users can create their own recipes" 
ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" 
ON recipes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" 
ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Ingredients policies
CREATE POLICY "Ingredients are viewable by everyone" 
ON ingredients FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add ingredients" 
ON ingredients FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Recipe_ingredients policies
CREATE POLICY "Recipe ingredients are viewable by everyone" 
ON recipe_ingredients FOR SELECT USING (true);

CREATE POLICY "Users can add ingredients to their recipes" 
ON recipe_ingredients FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipes 
    WHERE id = recipe_ingredients.recipe_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update ingredients in their recipes" 
ON recipe_ingredients FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM recipes 
    WHERE id = recipe_ingredients.recipe_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete ingredients from their recipes" 
ON recipe_ingredients FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM recipes 
    WHERE id = recipe_ingredients.recipe_id 
    AND user_id = auth.uid()
  )
);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT USING (true);

-- Recipe_categories policies
CREATE POLICY "Recipe categories are viewable by everyone" 
ON recipe_categories FOR SELECT USING (true);

CREATE POLICY "Users can add categories to their recipes" 
ON recipe_categories FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipes 
    WHERE id = recipe_categories.recipe_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete categories from their recipes" 
ON recipe_categories FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM recipes 
    WHERE id = recipe_categories.recipe_id 
    AND user_id = auth.uid()
  )
);

-- Favorites policies
CREATE POLICY "Users can view their own favorites" 
ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" 
ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add comments" 
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON comments FOR DELETE USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone" 
ON ratings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add ratings" 
ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON ratings FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for improved performance

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_categories_recipe_id ON recipe_categories(recipe_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_comments_recipe_id ON comments(recipe_id);
CREATE INDEX idx_ratings_recipe_id ON ratings(recipe_id);

-- Create functions for computed values

-- Function to get average rating for a recipe
CREATE OR REPLACE FUNCTION get_recipe_average_rating(recipe_id UUID)
RETURNS FLOAT AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM ratings
  WHERE recipe_id = $1;
$$ LANGUAGE SQL STABLE;
