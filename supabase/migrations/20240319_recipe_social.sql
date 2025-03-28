-- Drop old community tables if they exist
DROP TABLE IF EXISTS post_bookmarks;
DROP TABLE IF EXISTS post_comments;
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS community_posts;
DROP VIEW IF EXISTS recipe_comments_with_profiles;

-- Create recipe comments table
CREATE TABLE IF NOT EXISTS recipe_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create recipe comment likes table
CREATE TABLE IF NOT EXISTS recipe_comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES recipe_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- Create recipe likes table
CREATE TABLE IF NOT EXISTS recipe_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(recipe_id, user_id)
);

-- Add likes_count and comments_count to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for recipe_comments
CREATE POLICY "Anyone can view recipe comments"
  ON recipe_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON recipe_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments"
  ON recipe_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON recipe_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for recipe_comment_likes
CREATE POLICY "Anyone can view comment likes"
  ON recipe_comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like comments"
  ON recipe_comment_likes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can unlike their own likes"
  ON recipe_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for recipe_likes
CREATE POLICY "Anyone can view recipe likes"
  ON recipe_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like recipes"
  ON recipe_likes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can unlike their own likes"
  ON recipe_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update recipe likes count
CREATE OR REPLACE FUNCTION update_recipe_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Check if the like already exists
    IF NOT EXISTS (
      SELECT 1 FROM recipe_likes
      WHERE recipe_id = NEW.recipe_id AND user_id = NEW.user_id
    ) THEN
      UPDATE recipes
      SET likes_count = likes_count + 1
      WHERE id = NEW.recipe_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipes
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.recipe_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update recipe comments count
CREATE OR REPLACE FUNCTION update_recipe_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipes
    SET comments_count = comments_count + 1
    WHERE id = NEW.recipe_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipes
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.recipe_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Check if the like already exists
    IF NOT EXISTS (
      SELECT 1 FROM recipe_comment_likes
      WHERE comment_id = NEW.comment_id AND user_id = NEW.user_id
    ) THEN
      UPDATE recipe_comments
      SET likes_count = likes_count + 1
      WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipe_comments
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_recipe_likes_count_trigger ON recipe_likes;
CREATE TRIGGER update_recipe_likes_count_trigger
  AFTER INSERT OR DELETE ON recipe_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_likes_count();

DROP TRIGGER IF EXISTS update_recipe_comments_count_trigger ON recipe_comments;
CREATE TRIGGER update_recipe_comments_count_trigger
  AFTER INSERT OR DELETE ON recipe_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_comments_count();

DROP TRIGGER IF EXISTS update_comment_likes_count_trigger ON recipe_comment_likes;
CREATE TRIGGER update_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON recipe_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count(); 