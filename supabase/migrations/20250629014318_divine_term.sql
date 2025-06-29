/*
  # Fix play count tracking system

  1. Issues Fixed
    - Trigger function not updating play_count correctly
    - Duplicate trigger definitions causing conflicts
    - Play count not incrementing for existing tracks with views

  2. Solutions
    - Drop and recreate trigger function with better logic
    - Ensure proper unique counting based on user_ip
    - Add manual refresh function for existing data
    - Fix any data type issues

  3. Data Integrity
    - Recalculate all existing play counts
    - Ensure consistent counting logic
*/

-- Drop existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS trigger_update_play_count ON track_plays;
DROP FUNCTION IF EXISTS update_track_play_count();

-- Create improved function to update track play count
CREATE OR REPLACE FUNCTION update_track_play_count()
RETURNS TRIGGER AS $$
DECLARE
  unique_play_count INTEGER;
BEGIN
  -- Count unique IPs that played this track for at least 10 seconds
  SELECT COUNT(DISTINCT user_ip) INTO unique_play_count
  FROM track_plays 
  WHERE track_id = NEW.track_id 
  AND play_duration >= 10;
  
  -- Update the tracks table with the new play count
  UPDATE tracks 
  SET 
    play_count = unique_play_count,
    last_played_at = NEW.played_at,
    updated_at = now()
  WHERE id = NEW.track_id;
  
  -- Log the update for debugging
  RAISE NOTICE 'Updated play count for track % to %', NEW.track_id, unique_play_count;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_play_count
  AFTER INSERT ON track_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_track_play_count();

-- Function to manually refresh all play counts (for fixing existing data)
CREATE OR REPLACE FUNCTION refresh_all_play_counts()
RETURNS void AS $$
DECLARE
  track_record RECORD;
  unique_play_count INTEGER;
BEGIN
  -- Loop through all tracks and recalculate their play counts
  FOR track_record IN SELECT id FROM tracks LOOP
    -- Count unique plays for this track
    SELECT COUNT(DISTINCT user_ip) INTO unique_play_count
    FROM track_plays 
    WHERE track_id = track_record.id 
    AND play_duration >= 10;
    
    -- Update the track
    UPDATE tracks 
    SET 
      play_count = unique_play_count,
      updated_at = now()
    WHERE id = track_record.id;
    
    RAISE NOTICE 'Refreshed play count for track % to %', track_record.id, unique_play_count;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the refresh function to fix existing data
SELECT refresh_all_play_counts();

-- Ensure all tracks have a play_count value (not null)
UPDATE tracks 
SET play_count = 0 
WHERE play_count IS NULL;

-- Create index for better performance if not exists
CREATE INDEX IF NOT EXISTS idx_track_plays_duration_ip ON track_plays(track_id, user_ip, play_duration);