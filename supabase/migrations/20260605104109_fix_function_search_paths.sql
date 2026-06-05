-- Fix mutable search_path on functions by setting search_path to empty string
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE OR REPLACE FUNCTION public.update_track_play_count()
RETURNS TRIGGER AS $$
DECLARE
  total_play_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_play_count
  FROM public.track_plays
  WHERE track_id = NEW.track_id
  AND play_duration >= 10;

  UPDATE public.tracks
  SET
    play_count = total_play_count,
    last_played_at = NEW.played_at,
    updated_at = now()
  WHERE id = NEW.track_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';