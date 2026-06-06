export interface Track {
  id: string
  title: string
  artist: string
  url: string
  duration: number
  uploadedAt: Date
  waveformData: number[]
  fileName?: string
  fileSize?: number
  playCount?: number
  lastPlayedAt?: Date
  userId?: string
}

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error'
  title: string
  message: string
}

// Database schema type
export interface DatabaseTrack {
  id: string
  title: string
  artist: string
  file_name: string
  duration: number
  file_size: number
  waveform_data: number[]
  uploaded_at: string
  play_count?: number
  last_played_at?: string
  created_at?: string
  updated_at?: string
  user_id?: string | null
}