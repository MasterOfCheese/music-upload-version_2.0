/*
  # Complete User Favorites System Setup
  
  This migration creates the complete user favorites system including:
  1. The user_favorites table
  2. All necessary indexes and constraints
  3. Row Level Security policies
  4. Helper functions
  
  Run this in your Supabase SQL Editor to fix the missing table errors.
*/

-- Create the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the table if it exists (to ensure clean setup)
DROP TABLE IF EXISTS user_favorites CASCADE;

-- Create user_favorites table
CREATE TABLE user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_ip text NOT NULL,
  user_agent text,
  track_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to tracks table
ALTER TABLE user_favorites 
ADD CONSTRAINT fk_user_favorites_track_id 
FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate favorites
ALTER TABLE user_favorites 
ADD CONSTRAINT unique_user_track_favorite 
UNIQUE (user_ip, track_id);

-- Create indexes for performance
CREATE INDEX idx_user_favorites_user_ip ON user_favorites(user_ip);
CREATE INDEX idx_user_favorites_track_id ON user_favorites(track_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on user_favorites" ON user_favorites;
DROP POLICY IF EXISTS "Allow public insert access on user_favorites" ON user_favorites;
DROP POLICY IF EXISTS "Allow public delete access on user_favorites" ON user_favorites;
DROP POLICY IF EXISTS "Allow public update access on user_favorites" ON user_favorites;

-- Create policies for public access (since this is a music sharing app)
CREATE POLICY "Allow public read access on user_favorites"
  ON user_favorites
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access on user_favorites"
  ON user_favorites
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on user_favorites"
  ON user_favorites
  FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public update access on user_favorites"
  ON user_favorites
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_user_favorites_updated_at
  BEFORE UPDATE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_favorites' 
ORDER BY ordinal_position;

-- Show confirmation message
DO $$
BEGIN
  RAISE NOTICE 'User favorites table created successfully!';
  RAISE NOTICE 'You can now use the favorites functionality in your app.';
END $$;