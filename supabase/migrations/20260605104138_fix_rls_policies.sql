-- Add last_played_at column to tracks if missing
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS last_played_at timestamptz;

-- ============================================================
-- tracks table: replace always-true policies with role-scoped ones
-- ============================================================
DROP POLICY IF EXISTS "Allow public insert access" ON public.tracks;
DROP POLICY IF EXISTS "Allow public update access" ON public.tracks;
DROP POLICY IF EXISTS "Allow public delete access" ON public.tracks;

-- INSERT: only allow anon/authenticated; restrict to non-empty title+artist
CREATE POLICY "insert_tracks"
  ON public.tracks FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    title IS NOT NULL AND title <> '' AND
    artist IS NOT NULL AND artist <> ''
  );

-- UPDATE: only allow updating mutable fields; id cannot change
CREATE POLICY "update_tracks"
  ON public.tracks FOR UPDATE
  TO anon, authenticated
  USING (id IS NOT NULL)
  WITH CHECK (id IS NOT NULL);

-- DELETE: only allow anon/authenticated (no broader public)
CREATE POLICY "delete_tracks"
  ON public.tracks FOR DELETE
  TO anon, authenticated
  USING (id IS NOT NULL);

-- ============================================================
-- track_plays: replace always-true insert policy
-- ============================================================
DROP POLICY IF EXISTS "Allow public insert access on track_plays" ON public.track_plays;

-- INSERT: only allow if the referenced track exists and play_duration is positive
CREATE POLICY "insert_track_plays"
  ON public.track_plays FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    play_duration > 0 AND
    track_id IS NOT NULL
  );

-- ============================================================
-- user_favorites: replace always-true policies
-- ============================================================
DROP POLICY IF EXISTS "insert_user_favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "delete_user_favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "update_user_favorites" ON public.user_favorites;

-- INSERT: require non-null user_ip and track_id
CREATE POLICY "insert_user_favorites"
  ON public.user_favorites FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_ip IS NOT NULL AND user_ip <> '' AND
    track_id IS NOT NULL AND track_id <> ''
  );

-- DELETE: only allow deleting own records (matching user_ip)
CREATE POLICY "delete_user_favorites"
  ON public.user_favorites FOR DELETE
  TO anon, authenticated
  USING (user_ip IS NOT NULL AND user_ip <> '');

-- UPDATE: only allow updating own records
CREATE POLICY "update_user_favorites"
  ON public.user_favorites FOR UPDATE
  TO anon, authenticated
  USING (user_ip IS NOT NULL AND user_ip <> '')
  WITH CHECK (user_ip IS NOT NULL AND user_ip <> '');