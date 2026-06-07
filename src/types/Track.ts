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
  favoriteCount?: number
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
  favorite_count?: number
  last_played_at?: string
  created_at?: string
  updated_at?: string
  user_id?: string | null
}

export interface Album {
  id: string
  title: string
  description: string | null
  coverUrl: string | null
  userId: string
  username?: string
  trackCount: number
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseAlbum {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  user_id: string
  created_at: string
  updated_at: string
  track_count?: number
}

export interface AlbumTrack {
  id: string
  albumId: string
  trackId: string
  position: number
  createdAt: Date
}

export interface DatabaseAlbumTrack {
  id: string
  album_id: string
  track_id: string
  position: number
  created_at: string
}