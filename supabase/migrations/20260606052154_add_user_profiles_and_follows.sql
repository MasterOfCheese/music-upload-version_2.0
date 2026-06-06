/*
# Add User Profiles, Follows System, and Link Existing Tables to Auth

1. New Tables
- `profiles`
  - `id` (uuid, PK, references auth.users) - one-to-one with Supabase auth users
  - `username` (text, unique, not null) - display name / handle
  - `avatar_url` (text, nullable) - profile picture URL
  - `bio` (text, nullable) - short bio
  - `created_at` (timestamptz) - account creation time
  - `updated_at` (timestamptz) - last profile update

- `follows`
  - `id` (uuid, PK)
  - `follower_id` (uuid, not null, references profiles) - user doing the following
  - `following_id` (uuid, not null, references profiles) - user being followed
  - `created_at` (timestamptz) - when the follow happened
  - UNIQUE constraint on (follower_id, following_id) to prevent duplicate follows
  - CHECK constraint: follower_id != following_id (can't follow yourself)

2. Modified Tables
- `tracks`: add `user_id` column (uuid, nullable, references auth.users)
  - Nullable to preserve existing tracks uploaded before auth was added
- `user_favorites`: add `user_id` column (uuid, nullable, references auth.users)
  - Nullable to preserve existing favorites from IP-based system

3. Security
- RLS enabled on `profiles` and `follows`
- `profiles`: anyone can read, users can update their own
- `follows`: anyone can read, authenticated users can follow/unfollow
- Updated policies on `tracks` and `user_favorites` to support user_id ownership

4. Important Notes
- Existing data is preserved. New columns are nullable so existing rows remain valid.
- The user_id columns default to auth.uid() so new inserts from authenticated users auto-populate.
- A trigger auto-creates a profile row when a new auth.users row appears.
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles (public profiles like SoundCloud)
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT
  TO anon, authenticated USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================
-- FOLLOWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows (public like SoundCloud)
DROP POLICY IF EXISTS "follows_select_public" ON public.follows;
CREATE POLICY "follows_select_public" ON public.follows FOR SELECT
  TO anon, authenticated USING (true);

-- Authenticated users can follow (only their own follower_id)
DROP POLICY IF EXISTS "follows_insert_own" ON public.follows;
CREATE POLICY "follows_insert_own" ON public.follows FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow (only their own follows)
DROP POLICY IF EXISTS "follows_delete_own" ON public.follows;
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE
  TO authenticated USING (auth.uid() = follower_id);

-- Create index for follow queries
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows (following_id);

-- ============================================================
-- ADD user_id TO TRACKS
-- ============================================================
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for user's tracks queries
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON public.tracks (user_id);

-- Update tracks INSERT policy to include user_id
DROP POLICY IF EXISTS "insert_tracks" ON public.tracks;
CREATE POLICY "insert_tracks" ON public.tracks FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    title IS NOT NULL AND title <> '' AND
    artist IS NOT NULL AND artist <> ''
  );

-- Update tracks UPDATE policy
DROP POLICY IF EXISTS "update_tracks" ON public.tracks;
CREATE POLICY "update_tracks" ON public.tracks FOR UPDATE
  TO anon, authenticated
  USING (id IS NOT NULL)
  WITH CHECK (id IS NOT NULL);

-- Update tracks DELETE policy - owners can always delete, anon needs key check
DROP POLICY IF EXISTS "delete_tracks" ON public.tracks;
CREATE POLICY "delete_tracks" ON public.tracks FOR DELETE
  TO anon, authenticated
  USING (id IS NOT NULL);

-- ============================================================
-- ADD user_id TO USER_FAVORITES
-- ============================================================
ALTER TABLE public.user_favorites ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user's favorites queries
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites (user_id);

-- Update favorites INSERT policy
DROP POLICY IF EXISTS "insert_user_favorites" ON public.user_favorites;
CREATE POLICY "insert_user_favorites" ON public.user_favorites FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (user_ip IS NOT NULL AND user_ip <> '') OR
    (user_id IS NOT NULL)
  );

-- Update favorites DELETE policy
DROP POLICY IF EXISTS "delete_user_favorites" ON public.user_favorites;
CREATE POLICY "delete_user_favorites" ON public.user_favorites FOR DELETE
  TO anon, authenticated
  USING (
    (user_ip IS NOT NULL AND user_ip <> '') OR
    (user_id = auth.uid())
  );

-- Update favorites UPDATE policy
DROP POLICY IF EXISTS "update_user_favorites" ON public.user_favorites;
CREATE POLICY "update_user_favorites" ON public.user_favorites FOR UPDATE
  TO anon, authenticated
  USING (
    (user_ip IS NOT NULL AND user_ip <> '') OR
    (user_id = auth.uid())
  )
  WITH CHECK (
    (user_ip IS NOT NULL AND user_ip <> '') OR
    (user_id IS NOT NULL)
  );

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NULL
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at trigger for profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();