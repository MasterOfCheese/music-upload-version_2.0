export interface Track {
  id: string
  title: string
  artist: string
  url: string
  duration: number
  uploadedAt: Date
  waveformData: number[]
  fileName?: string // Thêm để lưu tên file trong storage
  fileSize?: number // Thêm để lưu kích thước file
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
  created_at?: string
  updated_at?: string
}