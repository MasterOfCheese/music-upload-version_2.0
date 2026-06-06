/*
# Revoke EXECUTE on handle_new_user from anon and authenticated

1. Security Fix
- `public.handle_new_user()` is a SECURITY DEFINER function (runs as the function owner, not the caller).
- By default, PostgreSQL grants EXECUTE to PUBLIC, which includes both `anon` and `authenticated`.
- This allowed anyone to call the function via `/rest/v1/rpc/handle_new_user` with elevated privileges.
- The function should ONLY be called by the `on_auth_user_created` trigger on `auth.users`, never directly via the API.

2. Changes
- REVOKE EXECUTE on `public.handle_new_user()` from `public`, `anon`, and `authenticated`.
- The trigger (which runs as the DB superuser) is unaffected — it bypasses EXECUTE checks.
*/

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;