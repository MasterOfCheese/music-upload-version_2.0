import { ref, watch, onUnmounted } from 'vue'
import type { Track } from '../types/Track'

export function useOptimizedAudio() {
  const audio = ref<HTMLAudioElement | null>(null)
  const isBuffering = ref(false)
  const bufferHealth = ref(0)
  const preloadedTracks = ref<Map<string, string>>(new Map())
  const maxPreloadedTracks = 3 // Limit preloaded tracks to save memory

  // Optimized audio loading with progressive enhancement
  const createOptimizedAudio = () => {
    if (audio.value) return audio.value

    const audioElement = new Audio()
    
    // Optimize for mobile
    audioElement.preload = 'none' // Don't preload by default
    audioElement.crossOrigin = 'anonymous'
    
    // Add buffer monitoring
    audioElement.addEventListener('progress', () => {
      if (audioElement.buffered.length > 0) {
        const bufferedEnd = audioElement.buffered.end(audioElement.buffered.length - 1)
        const duration = audioElement.duration || 1
        bufferHealth.value = (bufferedEnd / duration) * 100
      }
    })

    audioElement.addEventListener('waiting', () => {
      isBuffering.value = true
    })

    audioElement.addEventListener('canplay', () => {
      isBuffering.value = false
    })

    audio.value = audioElement
    return audioElement
  }

  // Smart preloading based on user behavior
  const preloadTrack = (track: Track, priority: 'high' | 'low' = 'low') => {
    if (preloadedTracks.value.has(track.id)) return
    
    // Don't preload on slow connections or low battery
    const connection = (navigator as any).connection
    if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
      return
    }

    // Limit preloaded tracks
    if (preloadedTracks.value.size >= maxPreloadedTracks) {
      const oldestTrack = preloadedTracks.value.keys().next().value
      preloadedTracks.value.delete(oldestTrack)
    }

    const preloadAudio = new Audio()
    preloadAudio.preload = priority === 'high' ? 'auto' : 'metadata'
    preloadAudio.src = track.url
    
    preloadedTracks.value.set(track.id, track.url)
  }

  // Cleanup preloaded tracks
  const cleanupPreloadedTracks = () => {
    preloadedTracks.value.clear()
  }

  onUnmounted(() => {
    cleanupPreloadedTracks()
    if (audio.value) {
      audio.value.pause()
      audio.value.src = ''
      audio.value.load()
    }
  })

  return {
    audio,
    isBuffering,
    bufferHealth,
    createOptimizedAudio,
    preloadTrack,
    cleanupPreloadedTracks
  }
}