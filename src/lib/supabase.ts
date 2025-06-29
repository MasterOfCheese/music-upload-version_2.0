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

export const recordTrackPlay = async (trackId: string, userIp: string, userAgent: string, playDuration: number) => {
  try {
    // Only record if played for at least 10 seconds
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
    
    // Wait longer for trigger to process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Manually update the play count to ensure consistency
    const updatedCount = await updateTrackPlayCount(trackId)
    console.log(`Manually updated play count for track ${trackId}: ${updatedCount}`)
    
    return { playRecord: data[0], newPlayCount: updatedCount }
  } catch (error) {
    console.error('Error recording track play:', error)
    throw error
  }
}

// Manual function to update play count (counts ALL plays ≥10s)
export const updateTrackPlayCount = async (trackId: string) => {
  try {
    // Get total play count for this track (ALL plays ≥10s)
    const { data: playData, error: playError } = await supabase
      .from('track_plays')
      .select('id')
      .eq('track_id', trackId)
      .gte('play_duration', 10)

    if (playError) {
      console.error('Error getting play data:', playError)
      return 0
    }

    // Count ALL plays (not unique IPs)
    const playCount = playData?.length || 0

    console.log(`Updating play count for track ${trackId}: ${playCount} total plays`)

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
    
    return playCount
  } catch (error) {
    console.error('Error updating track play count:', error)
    throw error
  }
}

export const getTrackPlayCount = async (trackId: string) => {
  try {
    // Get from database first (most accurate)
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

    // Fallback: count from track_plays table
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
    
    // Count unique IPs across all tracks (for "Total Users" stat)
    const uniqueIPs = new Set(data?.map(play => play.user_ip) || [])
    return uniqueIPs.size
  } catch (error) {
    console.error('Error getting total unique users:', error)
    return 0
  }
}

// Function to fix database trigger
export const fixDatabaseTrigger = async () => {
  try {
    console.log('Fixing database trigger...')
    
    // Execute SQL to recreate the trigger function
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing trigger and function
        DROP TRIGGER IF EXISTS trigger_update_play_count ON track_plays;
        DROP FUNCTION IF EXISTS update_track_play_count();

        -- Create new function that counts ALL plays (not unique IPs)
        CREATE OR REPLACE FUNCTION update_track_play_count()
        RETURNS TRIGGER AS $$
        DECLARE
          total_play_count INTEGER;
        BEGIN
          -- Count ALL plays that are 10+ seconds (not unique IPs)
          SELECT COUNT(*) INTO total_play_count
          FROM track_plays 
          WHERE track_id = NEW.track_id 
          AND play_duration >= 10;
          
          -- Update the tracks table with total play count
          UPDATE tracks 
          SET 
            play_count = total_play_count,
            last_played_at = NEW.played_at,
            updated_at = now()
          WHERE id = NEW.track_id;
          
          -- Log the update for debugging
          RAISE NOTICE 'Updated play count for track % to % (total plays)', NEW.track_id, total_play_count;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create the trigger
        CREATE TRIGGER trigger_update_play_count
          AFTER INSERT ON track_plays
          FOR EACH ROW
          EXECUTE FUNCTION update_track_play_count();
      `
    })

    if (error) {
      console.error('Error fixing trigger:', error)
      return false
    }

    console.log('Database trigger fixed successfully!')
    return true
  } catch (error) {
    console.error('Error fixing database trigger:', error)
    return false
  }
}

// DEBUG FUNCTIONS - For testing purposes
export const debugTrackPlays = async (trackId: string) => {
  try {
    console.log(`=== DEBUG: Track ${trackId} ===`)
    
    // Get all plays for this track
    const { data: plays, error: playsError } = await supabase
      .from('track_plays')
      .select('*')
      .eq('track_id', trackId)
      .order('played_at', { ascending: false })

    if (playsError) {
      console.error('Error getting plays:', playsError)
      return
    }

    console.log('All plays:', plays)
    
    // Get valid plays (10+ seconds)
    const validPlays = plays?.filter(play => play.play_duration >= 10) || []
    const uniqueIPs = new Set(validPlays.map(play => play.user_ip))
    
    console.log('Valid plays (10+ seconds):', validPlays)
    console.log('Total valid plays:', validPlays.length)
    console.log('Unique IPs:', Array.from(uniqueIPs))
    console.log('Expected play count (total plays):', validPlays.length)
    
    // Get current track data
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('play_count')
      .eq('id', trackId)
      .single()

    if (trackError) {
      console.error('Error getting track:', trackError)
      return
    }

    console.log('Current play_count in database:', track?.play_count)
    console.log('=== END DEBUG ===')
    
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

// Force refresh all play counts
export const forceRefreshAllPlayCounts = async () => {
  try {
    console.log('Force refreshing all play counts...')
    
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('id')

    if (error) throw error

    for (const track of tracks || []) {
      await updateTrackPlayCount(track.id)
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('All play counts refreshed!')
    return true
  } catch (error) {
    console.error('Error force refreshing play counts:', error)
    return false
  }
}

// Test function to simulate different users
export const simulatePlayFromDifferentUser = async (trackId: string) => {
  try {
    const randomIp = `192.168.1.${Math.floor(Math.random() * 255)}`
    const randomUserAgent = `TestAgent-${Math.random().toString(36).substring(7)}`
    
    console.log(`Simulating play from IP: ${randomIp}`)
    
    const { data, error } = await supabase
      .from('track_plays')
      .insert([{
        track_id: trackId,
        user_ip: randomIp,
        user_agent: randomUserAgent,
        play_duration: 15, // 15 seconds
        played_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error
    
    console.log('Simulated play recorded:', data[0])
    
    // Wait for trigger and manually update count
    await new Promise(resolve => setTimeout(resolve, 500))
    const newCount = await updateTrackPlayCount(trackId)
    
    return { playRecord: data[0], newPlayCount: newCount }
  } catch (error) {
    console.error('Error simulating play:', error)
    throw error
  }
}