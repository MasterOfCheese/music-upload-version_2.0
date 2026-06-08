/*
# Revoke PUBLIC EXECUTE on update_track_favorite_count

1. Security Changes
- Revoke EXECUTE on `update_track_favorite_count()` from PUBLIC.
  The default PostgreSQL grant gives EXECUTE to PUBLIC on functions, which means
  both `anon` and `authenticated` can call it via the Supabase REST API.
  This function is a trigger function and should never be called directly via RPC.
  Only the database trigger needs to invoke it (triggers run as the function owner).

2. Important Notes
- `{=X/postgres}` in proacl means PUBLIC has EXECUTE. Revoking from PUBLIC removes
  this entry, leaving only `postgres` and `service_role` with EXECUTE.
- The trigger `on_favorite_change` continues to work because triggers execute
  as the function owner regardless of role-based EXECUTE grants.
*/

REVOKE EXECUTE ON FUNCTION public.update_track_favorite_count() FROM PUBLIC;
