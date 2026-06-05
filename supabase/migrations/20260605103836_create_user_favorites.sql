CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_ip text NOT NULL,
  user_agent text,
  track_id text NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_track_favorite UNIQUE (user_ip, track_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_ip ON user_favorites(user_ip);
CREATE INDEX IF NOT EXISTS idx_user_favorites_track_id ON user_favorites(track_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_user_favorites" ON user_favorites FOR SELECT TO public USING (true);
CREATE POLICY "insert_user_favorites" ON user_favorites FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "delete_user_favorites" ON user_favorites FOR DELETE TO public USING (true);
CREATE POLICY "update_user_favorites" ON user_favorites FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_user_favorites_updated_at ON user_favorites;
CREATE TRIGGER update_user_favorites_updated_at
  BEFORE UPDATE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();