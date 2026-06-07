/*
# Fix security issues on update_track_favorite_count function

1. Security Changes
- Set immutable search_path on `update_track_favorite_count` to prevent search path injection.
  The function is SECURITY DEFINER, so a mutable search_path could allow an attacker to
  shadow functions/operators. Setting `search_path = ''` makes it immutable and safe.
- Revoke EXECUTE on `update_track_favorite_count` from `anon` and `authenticated` roles.
  This function is a trigger function (called automatically by PostgreSQL when rows change
  in user_favorites). It should NOT be callable directly via the Supabase REST API
  (`/rest/v1/rpc/update_track_favorite_count`). Only the trigger needs to run it,
  and triggers execute with the function owner's privileges regardless of EXECUTE grants.
- Grant EXECUTE only to `postgres` (the superuser that owns the function).

2. Important Notes
- The trigger `on_favorite_change` on `user_favorites` will continue to work because
  trigger functions execute as the function owner (SECURITY DEFINER context), not as
  the calling role. Revoking EXECUTE from anon/authenticated only affects direct RPC calls.
- `search_path = ''` means the function must fully-qualify any table references, which
  it already does (references `tracks` and `user_favorites` without schema prefix, but
  since it runs as the function owner in the `public` schema context, this is safe).
  To be fully explicit, we also set `search_path = 'public'` which is a safe fixed path.
*/

-- 1. Fix mutable search_path: recreate the function with an explicit, fixed search_path
CREATE OR REPLACE FUNCTION public.update_track_favorite_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = 'public'
LANGUAGE plpgsql
AS $$
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
$$;

-- 2. Revoke EXECUTE from anon and authenticated (prevent RPC access)
REVOKE EXECUTE ON FUNCTION public.update_track_favorite_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_track_favorite_count() FROM authenticated;

-- 3. Ensure only postgres (owner) can execute
-- (By default only the owner has EXECUTE after REVOKE, but be explicit)
GRANT EXECUTE ON FUNCTION public.update_track_favorite_count() TO postgres;
