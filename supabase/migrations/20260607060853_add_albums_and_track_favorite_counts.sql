/*
# Add albums table and track favorite counts

1. New Tables
- `albums`
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null) — album name
  - `description` (text, nullable) — optional album description
  - `cover_url` (text, nullable) — optional cover image URL
  - `user_id` (uuid, not null, defaults to auth.uid()) — album owner
  - `created_at` (timestamptz, defaults to now())
  - `updated_at` (timestamptz, defaults to now())
- `album_tracks`
  - `id` (uuid, primary key, auto-generated)
  - `album_id` (uuid, not null, references albums.id ON DELETE CASCADE)
  - `track_id` (text, not null, references tracks.id ON DELETE CASCADE)
  - `position` (integer, not null default 0) — track order within album
  - `created_at` (timestamptz, defaults to now())
  - UNIQUE constraint on (album_id, track_id) to prevent duplicates

2. Schema Changes
- Add `favorite_count` column to `tracks` table (integer, default 0)
  - This denormalized count allows all users to see how many likes a track has
  - Will be kept in sync via a database trigger

3. Security
- Enable RLS on `albums` and `album_tracks`
- Owner-scoped CRUD on `albums`: authenticated users can only manage their own albums
- Owner-scoped CRUD on `album_tracks`: only the album owner can add/remove tracks
- Anyone authenticated can view albums and album tracks (public read)
- Add a trigger function to keep `tracks.favorite_count` in sync with `user_favorites`

4. Performance
- Index on `album_tracks.album_id` for fast album track lookups
- Index on `album_tracks.track_id` for finding which albums a track belongs to
- Index on `albums.user_id` for user's album listing

5. Important Notes
- The favorite_count trigger automatically updates tracks.favorite_count whenever
  a row is inserted or deleted from user_favorites, so all users see accurate like counts.
- album_tracks.position allows ordering tracks within an album.
*/

-- ==========================================
-- 1. Add favorite_count column to tracks
-- ==========================================
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS favorite_count integer NOT NULL DEFAULT 0;

-- ==========================================
-- 2. Backfill favorite_count from existing user_favorites
-- ==========================================
DO $$
BEGIN
  UPDATE tracks t
  SET favorite_count = (
    SELECT COUNT(*)::int
    FROM user_favorites uf
    WHERE uf.track_id = t.id
  );
END $$;

-- ==========================================
-- 3. Trigger to keep favorite_count in sync
-- ==========================================
CREATE OR REPLACE FUNCTION update_track_favorite_count()
RETURNS TRIGGER AS $$
DECLARE
  track_id text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    track_id := NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    track_id := OLD.track_id;
  ELSE
    track_id := NEW.track_id;
  END IF;

  UPDATE tracks
  SET favorite_count = (
    SELECT COUNT(*)::int
    FROM user_favorites
    WHERE user_favorites.track_id = track_id
  )
  WHERE tracks.id = track_id;

  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_favorite_change ON user_favorites;
CREATE TRIGGER on_favorite_change
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_track_favorite_count();

-- ==========================================
-- 4. Create albums table
-- ==========================================
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 5. Create album_tracks junction table
-- ==========================================
CREATE TABLE IF NOT EXISTS album_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  track_id text NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (album_id, track_id)
);

-- ==========================================
-- 6. Indexes for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_album_tracks_album_id ON album_tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_album_tracks_track_id ON album_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);

-- ==========================================
-- 7. Enable RLS
-- ==========================================
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_tracks ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 8. Albums policies (public read, owner write)
-- ==========================================
DROP POLICY IF EXISTS "anyone_can_view_albums" ON albums;
CREATE POLICY "anyone_can_view_albums" ON albums FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anyone_anon_can_view_albums" ON albums;
CREATE POLICY "anyone_anon_can_view_albums" ON albums FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "owner_can_insert_albums" ON albums;
CREATE POLICY "owner_can_insert_albums" ON albums FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_can_update_albums" ON albums;
CREATE POLICY "owner_can_update_albums" ON albums FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_can_delete_albums" ON albums;
CREATE POLICY "owner_can_delete_albums" ON albums FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ==========================================
-- 9. Album tracks policies (public read, album owner write)
-- ==========================================
DROP POLICY IF EXISTS "anyone_can_view_album_tracks" ON album_tracks;
CREATE POLICY "anyone_can_view_album_tracks" ON album_tracks FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anyone_anon_can_view_album_tracks" ON album_tracks;
CREATE POLICY "anyone_anon_can_view_album_tracks" ON album_tracks FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "album_owner_can_insert_tracks" ON album_tracks;
CREATE POLICY "album_owner_can_insert_tracks" ON album_tracks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM albums WHERE albums.id = album_tracks.album_id AND albums.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "album_owner_can_update_tracks" ON album_tracks;
CREATE POLICY "album_owner_can_update_tracks" ON album_tracks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM albums WHERE albums.id = album_tracks.album_id AND albums.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM albums WHERE albums.id = album_tracks.album_id AND albums.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "album_owner_can_delete_tracks" ON album_tracks;
CREATE POLICY "album_owner_can_delete_tracks" ON album_tracks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM albums WHERE albums.id = album_tracks.album_id AND albums.user_id = auth.uid())
  );
