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
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(`File size ${Math.round(file.size / (1024 * 1024))}MB exceeds Supabase limit of 50MB.`)
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        duplex: 'half'
      })

    if (error) {
      console.error('Supabase upload error:', error)
      if (error.message.includes('exceeded the maximum allowed size')) {
        throw new Error('File exceeds Supabase storage limit.')
      } else if (error.message.includes('Duplicate')) {
        throw new Error('A file with this name already exists.')
      } else if (error.message.includes('Invalid file type')) {
        throw new Error('File type not supported.')
      } else if (error.message.includes('timeout')) {
        throw new Error('Upload timeout.')
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
      limit: 1000,
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
    const ipResponse = await fetch('https://api.ipify.org?format=json')
    const ipData = await ipResponse.json()

    const userAgent = navigator.userAgent
    const fingerprint = `${ipData.ip}_${btoa(userAgent).slice(0, 20)}`

    return {
      ip: ipData.ip,
      userAgent,
      fingerprint
    }
  } catch (error) {
    console.error('Error getting user fingerprint:', error)
    const randomId = Math.random().toString(36).substring(7)
    return {
      ip: randomId,
      userAgent: navigator.userAgent,
      fingerprint: randomId
    }
  }
}

export const recordTrackPlay = async (trackId: string, userIp: string, userAgent: string, playDuration: number) => {
  try {
    if (playDuration < 10) {
      console.log(`Play duration ${playDuration}s is less than 10s, not recording`)
      return null
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

    const updatedCount = await updateTrackPlayCount(trackId)
    console.log(`Manually updated play count for track ${trackId}: ${updatedCount}`)

    return { playRecord: data[0], newPlayCount: updatedCount }
  } catch (error) {
    console.error('Error recording track play:', error)
    throw error
  }
}

export const updateTrackPlayCount = async (trackId: string) => {
  try {
    const { data: playData, error: playError } = await supabase
      .from('track_plays')
      .select('id')
      .eq('track_id', trackId)
      .gte('play_duration', 10)

    if (playError) {
      console.error('Error getting play data:', playError)
      return 0
    }

    const playCount = playData?.length || 0

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

    return playCount
  } catch (error) {
    console.error('Error updating track play count:', error)
    throw error
  }
}

export const getTrackPlayCount = async (trackId: string) => {
  try {
    const { data: trackData, error: trackError } = await supabase
      .from('tracks')
      .select('play_count')
      .eq('id', trackId)
      .single()

    if (trackError) {
      console.error('Error getting track from database:', trackError)
    } else if (trackData?.play_count !== null && trackData?.play_count !== undefined) {
      return trackData.play_count
    }

    const { data, error } = await supabase
      .from('track_plays')
      .select('id')
      .eq('track_id', trackId)
      .gte('play_duration', 10)

    if (error) throw error

    return data?.length || 0
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

    const uniqueIPs = new Set(data?.map(play => play.user_ip) || [])
    return uniqueIPs.size
  } catch (error) {
    console.error('Error getting total unique users:', error)
    return 0
  }
}

// USER FAVORITES FUNCTIONS
export const getUserFavorites = async (userIp: string, _userAgent: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('track_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data?.map(fav => fav.track_id) || []
    }

    // Fallback for anonymous users (IP-based)
    const { data, error } = await supabase
      .from('user_favorites')
      .select('track_id')
      .eq('user_ip', userIp)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(fav => fav.track_id) || []
  } catch (error) {
    console.error('Error getting user favorites:', error)
    return []
  }
}

export const addToUserFavorites = async (trackId: string, userIp: string, userAgent: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const insertData: any = { track_id: trackId }

    if (user) {
      insertData.user_id = user.id
    } else {
      insertData.user_ip = userIp
      insertData.user_agent = userAgent
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert([insertData])
      .select()

    if (error) {
      if (error.code === '23505') return null
      throw error
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Error adding to favorites:', error)
    throw error
  }
}

export const removeFromUserFavorites = async (trackId: string, userIp: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('track_id', trackId)
        .eq('user_id', user.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('track_id', trackId)
        .eq('user_ip', userIp)

      if (error) throw error
    }
  } catch (error) {
    console.error('Error removing from favorites:', error)
    throw error
  }
}

export const getTrackFavoriteCount = async (trackId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('track_id', trackId)

    if (error) throw error
    return data?.length || 0
  } catch (error) {
    console.error('Error getting track favorite count:', error)
    return 0
  }
}

export const checkUserFavoritesTableExists = async () => {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .select('count')
      .limit(1)

    return !error
  } catch (error) {
    return false
  }
}

// PROFILE FUNCTIONS
export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}

export const getTracksByUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting tracks by user:', error)
    return []
  }
}

export const searchProfiles = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(10)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error searching profiles:', error)
    return []
  }
}

// DEBUG FUNCTIONS
export const debugTrackPlays = async (trackId: string) => {
  try {
    const { data: plays, error: playsError } = await supabase
      .from('track_plays')
      .select('*')
      .eq('track_id', trackId)
      .order('played_at', { ascending: false })

    if (playsError) return

    const validPlays = plays?.filter(play => play.play_duration >= 10) || []
    const uniqueIPs = new Set(validPlays.map(play => play.user_ip))

    const { data: track } = await supabase
      .from('tracks')
      .select('play_count')
      .eq('id', trackId)
      .single()

    return {
      totalPlays: plays?.length || 0,
      validPlays: validPlays.length,
      uniqueUsers: uniqueIPs.size,
      currentPlayCount: track?.play_count || 0
    }
  } catch (error) {
    console.error('Debug error:', error)
  }
}

export const forceRefreshAllPlayCounts = async () => {
  try {
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('id')

    if (error) throw error

    for (const track of tracks || []) {
      await updateTrackPlayCount(track.id)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return true
  } catch (error) {
    console.error('Error force refreshing play counts:', error)
    return false
  }
}

export const simulatePlayFromDifferentUser = async (trackId: string) => {
  try {
    const randomIp = `192.168.1.${Math.floor(Math.random() * 255)}`
    const randomUserAgent = `TestAgent-${Math.random().toString(36).substring(7)}`

    const { data, error } = await supabase
      .from('track_plays')
      .insert([{
        track_id: trackId,
        user_ip: randomIp,
        user_agent: randomUserAgent,
        play_duration: 15,
        played_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error

    const newCount = await updateTrackPlayCount(trackId)
    return { playRecord: data[0], newPlayCount: newCount }
  } catch (error) {
    console.error('Error simulating play:', error)
    throw error
  }
}
