/*
  # Create tracks table with proper data types

  1. New Tables
    - `tracks`
      - `id` (text, primary key) - Track identifier
      - `title` (text, not null) - Track title
      - `artist` (text, not null) - Artist name
      - `file_name` (text, not null) - Storage file name
      - `duration` (numeric, not null) - Track duration in seconds (supports decimals)
      - `file_size` (bigint, not null) - File size in bytes
      - `waveform_data` (jsonb) - Waveform visualization data
      - `uploaded_at` (timestamptz, not null) - Upload timestamp
      - `created_at` (timestamptz, default now()) - Record creation time
      - `updated_at` (timestamptz, default now()) - Record update time

  2. Security
    - Enable RLS on `tracks` table
    - Add policy for public read access (can be customized later)
    - Add policy for public insert access (can be customized later)

  3. Storage
    - Create audio-files bucket for file storage
    - Set public access for audio files
*/

-- Create tracks table with proper data types
CREATE TABLE IF NOT EXISTS tracks (
  id text PRIMARY KEY,
  title text NOT NULL,
  artist text NOT NULL,
  file_name text NOT NULL,
  duration numeric NOT NULL, -- Changed from integer to numeric to support decimal values
  file_size bigint NOT NULL,
  waveform_data jsonb,
  uploaded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (can be customized for authentication later)
CREATE POLICY "Allow public read access"
  ON tracks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON tracks
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON tracks
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access"
  ON tracks
  FOR DELETE
  TO public
  USING (true);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for public access
CREATE POLICY "Allow public uploads"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'audio-files');

CREATE POLICY "Allow public downloads"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'audio-files');

CREATE POLICY "Allow public deletes"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'audio-files');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();