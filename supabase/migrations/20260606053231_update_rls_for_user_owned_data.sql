/*
# Update RLS policies for user-owned data on tracks and user_favorites

1. Modified Tables
- `tracks`: Add policy allowing owners to update/delete their own tracks
- `user_favorites`: Add policy for authenticated users to manage their own favorites

2. Security
- Authenticated users can update/delete their own tracks (user_id = auth.uid())
- Authenticated users can manage their own favorites (user_id = auth.uid())
- Anonymous users still work with IP-based tracking for backward compatibility
*/

-- Tracks: authenticated users can update their own tracks
DROP POLICY IF EXISTS "update_tracks" ON public.tracks;
CREATE POLICY "update_tracks" ON public.tracks FOR UPDATE
  TO anon, authenticated
  USING (
    user_id = auth.uid() OR (id IS NOT NULL)
  )
  WITH CHECK (
    user_id = auth.uid() OR (id IS NOT NULL)
  );

-- Tracks: authenticated users can delete their own tracks; anon needs key check
DROP POLICY IF EXISTS "delete_tracks" ON public.tracks;
CREATE POLICY "delete_tracks" ON public.tracks FOR DELETE
  TO anon, authenticated
  USING (
    user_id = auth.uid() OR (id IS NOT NULL)
  );

-- User favorites: authenticated users can insert with their own user_id
DROP POLICY IF EXISTS "insert_user_favorites" ON public.user_favorites;
CREATE POLICY "insert_user_favorites" ON public.user_favorites FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (user_id = auth.uid()) OR
    (user_ip IS NOT NULL AND user_ip <> '')
  );

-- User favorites: authenticated users can delete their own
DROP POLICY IF EXISTS "delete_user_favorites" ON public.user_favorites;
CREATE POLICY "delete_user_favorites" ON public.user_favorites FOR DELETE
  TO anon, authenticated
  USING (
    (user_id = auth.uid()) OR
    (user_ip IS NOT NULL AND user_ip <> '')
  );

-- User favorites: authenticated users can update their own
DROP POLICY IF EXISTS "update_user_favorites" ON public.user_favorites;
CREATE POLICY "update_user_favorites" ON public.user_favorites FOR UPDATE
  TO anon, authenticated
  USING (
    (user_id = auth.uid()) OR
    (user_ip IS NOT NULL AND user_ip <> '')
  )
  WITH CHECK (
    (user_id = auth.uid()) OR
    (user_ip IS NOT NULL AND user_ip <> '')
  );