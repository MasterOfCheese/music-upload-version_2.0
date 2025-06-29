import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage bucket name
export const STORAGE_BUCKET = 'audio-files'

// Helper functions for file operations
export const uploadAudioFile = async (file: File, fileName: string) => {
  try {
    // Check file size before upload (Supabase has a 50MB limit for free tier)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error(`File size ${Math.round(file.size / (1024 * 1024))}MB exceeds Supabase limit of 50MB. Please compress your file or upgrade your Supabase plan.`)
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        duplex: 'half' // Add this for better large file handling
      })

    if (error) {
      console.error('Supabase upload error:', error)
      
      // Handle specific Supabase errors
      if (error.message.includes('exceeded the maximum allowed size')) {
        throw new Error('File exceeds Supabase storage limit. Free tier allows up to 50MB per file.')
      } else if (error.message.includes('Duplicate')) {
        throw new Error('A file with this name already exists. Please rename your file.')
      } else if (error.message.includes('Invalid file type')) {
        throw new Error('File type not supported. Please use MP3, WAV, FLAC, M4A, AAC, or OGG.')
      } else if (error.message.includes('timeout')) {
        throw new Error('Upload timeout. Please try again or use a smaller file.')
      } else {
        throw new Error(`Upload failed: ${error.message}`)
      }
    }

    return data
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const getAudioFileUrl = async (fileName: string) => {
  try {
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    return data.publicUrl
  } catch (error) {
    console.error('Error getting file URL:', error)
    throw error
  }
}

export const deleteAudioFile = async (fileName: string) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// Database operations for tracks
export const saveTrackToDatabase = async (track: any) => {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .insert([track])
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error saving track:', error)
    throw error
  }
}

export const getTracksFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return []
  }
}

export const deleteTrackFromDatabase = async (trackId: string) => {
  try {
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting track from database:', error)
    throw error
  }
}

// Check Supabase storage limits
export const checkStorageQuota = async () => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 1000 })

    if (error) throw error

    const totalSize = data?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0
    const totalSizeMB = Math.round(totalSize / (1024 * 1024))
    
    return {
      used: totalSizeMB,
      limit: 1000, // 1GB for free tier
      remaining: 1000 - totalSizeMB
    }
  } catch (error) {
    console.error('Error checking storage quota:', error)
    return { used: 0, limit: 1000, remaining: 1000 }
  }
}

// Play tracking functions
export const getUserFingerprint = async () => {
  try {
    // Get user IP
    const ipResponse = await fetch('https://api.ipify.org?format=json')
    const ipData = await ipResponse.json()
    
    // Create a simple fingerprint from user agent and screen info
    const userAgent = navigator.userAgent
    const fingerprint = `${ipData.ip}_${btoa(userAgent).slice(0, 20)}`
    
    return {
      ip: ipData.ip,
      userAgent,
      fingerprint
    }
  } catch (error) {
    console.error('Error getting user fingerprint:', error)
    // Fallback to a random ID if IP detection fails
    const randomId = Math.random().toString(36).substring(7)
    return {
      ip: randomId,
      userAgent: navigator.userAgent,
      fingerprint: randomId
    }
  }
}

export const checkIfUserPlayedTrack = async (trackId: string, userIp: string) => {
  try {
    const { data, error } = await supabase
      .from('track_plays')
      .select('id')
      .eq('track_id', trackId)
      .eq('user_ip', userIp)
      .gte('play_duration', 10)
      .limit(1)

    if (error) {
      console.error('Error checking if user played track:', error)
      return false
    }
    
    return data && data.length > 0
  } catch (error) {
    console.error('Error checking if user played track:', error)
    return false
  }
}

export const recordTrackPlay = async (trackId: string, userIp: string, userAgent: string, playDuration: number) => {
  try {
    // Only record if played for at least 10 seconds
    if (playDuration < 10) {
      console.log(`Play duration ${playDuration}s is less than 10s, not recording`)
      return
    }

    // Check if this IP already played this track for 10+ seconds
    const alreadyPlayed = await checkIfUserPlayedTrack(trackId, userIp)
    if (alreadyPlayed) {
      console.log('User already counted for this track')
      return
    }

    console.log(`Recording play for track ${trackId}, duration: ${playDuration}s`)

    const { data, error } = await supabase
      .from('track_plays')
      .insert([{
        track_id: trackId,
        user_ip: userIp,
        user_agent: userAgent,
        play_duration: Math.floor(playDuration),
        played_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Error recording track play:', error)
      throw error
    }
    
    console.log('Track play recorded successfully:', data[0])
    
    // Manually update the play count in tracks table
    await updateTrackPlayCount(trackId)
    
    return data[0]
  } catch (error) {
    console.error('Error recording track play:', error)
    throw error
  }
}

// Manual function to update play count
export const updateTrackPlayCount = async (trackId: string) => {
  try {
    // Get unique play count for this track
    const { data: playData, error: playError } = await supabase
      .from('track_plays')
      .select('user_ip')
      .eq('track_id', trackId)
      .gte('play_duration', 10)

    if (playError) {
      console.error('Error getting play data:', playError)
      return
    }

    // Count unique IPs
    const uniqueIPs = new Set(playData?.map(play => play.user_ip) || [])
    const playCount = uniqueIPs.size

    console.log(`Updating play count for track ${trackId}: ${playCount} unique plays`)

    // Update the tracks table
    const { error: updateError } = await supabase
      .from('tracks')
      .update({ 
        play_count: playCount,
        last_played_at: new Date().toISOString()
      })
      .eq('id', trackId)

    if (updateError) {
      console.error('Error updating track play count:', updateError)
      throw updateError
    }

    console.log(`Successfully updated play count for track ${trackId} to ${playCount}`)
    
  } catch (error) {
    console.error('Error updating track play count:', error)
    throw error
  }
}

export const getTrackPlayCount = async (trackId: string) => {
  try {
    const { data, error } = await supabase
      .from('track_plays')
      .select('user_ip')
      .eq('track_id', trackId)
      .gte('play_duration', 10)

    if (error) throw error
    
    // Count unique IPs
    const uniqueIPs = new Set(data?.map(play => play.user_ip) || [])
    return uniqueIPs.size
  } catch (error) {
    console.error('Error getting track play count:', error)
    return 0
  }
}

export const getTotalUniqueUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('track_plays')
      .select('user_ip')
      .gte('play_duration', 10)

    if (error) throw error
    
    // Count unique IPs across all tracks
    const uniqueIPs = new Set(data?.map(play => play.user_ip) || [])
    return uniqueIPs.size
  } catch (error) {
    console.error('Error getting total unique users:', error)
    return 0
  }
}