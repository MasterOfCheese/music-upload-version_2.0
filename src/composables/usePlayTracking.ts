import { ref } from 'vue'
import { 
  getUserFingerprint, 
  recordTrackPlay, 
  getTotalUniqueUsers,
  updateTrackPlayCount
} from '../lib/supabase'

export function usePlayTracking() {
  const userFingerprint = ref<{ ip: string; userAgent: string; fingerprint: string } | null>(null)
  const trackPlayStartTime = ref<Map<string, number>>(new Map())

  const initializeFingerprint = async () => {
    userFingerprint.value = await getUserFingerprint()
  }

  const startPlayTracking = (trackId: string) => {
    if (!userFingerprint.value) return
    
    trackPlayStartTime.value.set(trackId, Date.now())
    console.log(`Started tracking play for track: ${trackId}`)
  }

  const stopPlayTracking = async (trackId: string) => {
    if (!userFingerprint.value) return
    
    const startTime = trackPlayStartTime.value.get(trackId)
    if (!startTime) return
    
    const playDuration = (Date.now() - startTime) / 1000
    trackPlayStartTime.value.delete(trackId)
    
    console.log(`Play duration for track ${trackId}: ${playDuration} seconds`)
    
    if (playDuration >= 10) {
      try {
        const result = await recordTrackPlay(
          trackId, 
          userFingerprint.value.ip, 
          userFingerprint.value.userAgent, 
          playDuration
        )
        
        if (result) {
          console.log(`Track ${trackId} play count updated to: ${result.newPlayCount}`)
          return result.newPlayCount
        }
      } catch (error) {
        console.error('Error recording play:', error)
      }
    }
    
    return null
  }

  return {
    userFingerprint,
    initializeFingerprint,
    startPlayTracking,
    stopPlayTracking
  }
}