/*
  # Create user-specific favorites system

  1. New Tables
    - `user_favorites`
      - `id` (uuid, primary key)
      - `user_ip` (text, not null) - User IP address
      - `user_agent` (text) - User agent string for additional uniqueness
      - `track_id` (text, foreign key) - Reference to tracks table
      - `created_at` (timestamptz) - When favorite was added
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on `user_favorites` table
    - Add policies for public access

  3. Indexes
    - Composite index on user_ip + track_id for fast lookups
    - Index on track_id for counting favorites per track

  4. Functions
    - Create update_updated_at_column function if it doesn't exist
*/

-- Create the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_ip text NOT NULL,
  user_agent text,
  track_id text NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent duplicate favorites
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_unique 
ON user_favorites(user_ip, track_id);

-- Enable Row Level Security
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on user_favorites" ON user_favorites;
DROP POLICY IF EXISTS "Allow public insert access on user_favorites" ON user_favorites;
DROP POLICY IF EXISTS "Allow public delete access on user_favorites" ON user_favorites;

-- Create policies for public access
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_ip ON user_favorites(user_ip);
CREATE INDEX IF NOT EXISTS idx_user_favorites_track_id ON user_favorites(track_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_favorites_updated_at ON user_favorites;

-- Create updated_at trigger
CREATE TRIGGER update_user_favorites_updated_at
  BEFORE UPDATE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();