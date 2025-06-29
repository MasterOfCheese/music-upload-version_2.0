/*
  # Create play tracking system

  1. New Tables
    - `track_plays`
      - `id` (uuid, primary key)
      - `track_id` (text, foreign key to tracks)
      - `user_ip` (text) - User IP address
      - `user_agent` (text) - Browser fingerprint
      - `played_at` (timestamptz) - When the play occurred
      - `play_duration` (integer) - How long was played in seconds

  2. Security
    - Enable RLS on `track_plays` table
    - Add policies for public access

  3. Indexes
    - Index on track_id for fast lookups
    - Composite index on track_id + user_ip for duplicate checking
*/

-- Create track_plays table for tracking individual plays
CREATE TABLE IF NOT EXISTS track_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id text NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  user_ip text NOT NULL,
  user_agent text,
  played_at timestamptz DEFAULT now(),
  play_duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add play_count column to tracks table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' AND column_name = 'play_count'
  ) THEN
    ALTER TABLE tracks ADD COLUMN play_count integer DEFAULT 0;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE track_plays ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access on track_plays"
  ON track_plays
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access on track_plays"
  ON track_plays
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_track_plays_track_id ON track_plays(track_id);
CREATE INDEX IF NOT EXISTS idx_track_plays_user_ip ON track_plays(user_ip);
CREATE INDEX IF NOT EXISTS idx_track_plays_composite ON track_plays(track_id, user_ip);
CREATE INDEX IF NOT EXISTS idx_track_plays_played_at ON track_plays(played_at);

-- Function to update track play count
CREATE OR REPLACE FUNCTION update_track_play_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the play count in tracks table
  UPDATE tracks 
  SET play_count = (
    SELECT COUNT(DISTINCT user_ip) 
    FROM track_plays 
    WHERE track_id = NEW.track_id 
    AND play_duration >= 10
  )
  WHERE id = NEW.track_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update play count
DROP TRIGGER IF EXISTS trigger_update_play_count ON track_plays;
CREATE TRIGGER trigger_update_play_count
  AFTER INSERT OR UPDATE ON track_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_track_play_count();