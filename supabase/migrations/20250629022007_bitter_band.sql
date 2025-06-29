/*
  # Fix play count logic to allow multiple views per IP

  1. Changes
    - Remove unique IP constraint - allow multiple plays per IP
    - Count ALL plays ≥10 seconds (not just unique IPs)
    - Update trigger to count total plays instead of unique users
    - Keep user tracking for "Total Users" stat (unique IPs)

  2. Logic
    - play_count = total number of plays ≥10s (can be multiple per IP)
    - Total Users = unique IPs across all tracks
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_update_play_count ON track_plays;
DROP FUNCTION IF EXISTS update_track_play_count();

-- Create new function that counts ALL plays (not unique IPs)
CREATE OR REPLACE FUNCTION update_track_play_count()
RETURNS TRIGGER AS $$
DECLARE
  total_play_count INTEGER;
BEGIN
  -- Count ALL plays that are 10+ seconds (not unique IPs)
  SELECT COUNT(*) INTO total_play_count
  FROM track_plays 
  WHERE track_id = NEW.track_id 
  AND play_duration >= 10;
  
  -- Update the tracks table with total play count
  UPDATE tracks 
  SET 
    play_count = total_play_count,
    last_played_at = NEW.played_at,
    updated_at = now()
  WHERE id = NEW.track_id;
  
  -- Log the update for debugging
  RAISE NOTICE 'Updated play count for track % to % (total plays)', NEW.track_id, total_play_count;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_play_count
  AFTER INSERT ON track_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_track_play_count();

-- Update refresh function to count total plays
CREATE OR REPLACE FUNCTION refresh_all_play_counts()
RETURNS void AS $$
DECLARE
  track_record RECORD;
  total_play_count INTEGER;
BEGIN
  -- Loop through all tracks and recalculate their play counts
  FOR track_record IN SELECT id FROM tracks LOOP
    -- Count ALL plays for this track (not unique IPs)
    SELECT COUNT(*) INTO total_play_count
    FROM track_plays 
    WHERE track_id = track_record.id 
    AND play_duration >= 10;
    
    -- Update the track
    UPDATE tracks 
    SET 
      play_count = total_play_count,
      updated_at = now()
    WHERE id = track_record.id;
    
    RAISE NOTICE 'Refreshed play count for track % to % (total plays)', track_record.id, total_play_count;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute refresh to fix existing data
SELECT refresh_all_play_counts();