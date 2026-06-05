-- Fix storage bucket SELECT policy: restrict to object-level access only (no listing)
-- The current policy allows listing all files in the bucket.
-- Replacing with a policy that only allows reading individual objects by name.
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;

CREATE POLICY "Allow public downloads"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'audio-files'
    AND name IS NOT NULL
  );