import { ref, onMounted } from 'vue'
import type { Track } from '../types/Track'

export function useAudioPlayer() {
  const audio = ref<HTMLAudioElement | null>(null)
  const currentTrack = ref<Track | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)

  const setupAudioEvents = () => {
    if (!audio.value) return
    
    audio.value.addEventListener('timeupdate', () => {
      currentTime.value = audio.value!.currentTime
    })
    
    audio.value.addEventListener('loadedmetadata', () => {
      duration.value = audio.value!.duration
    })
    
    audio.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
  }

  const loadTrack = (track: Track) => {
    if (audio.value) {
      audio.value.src = track.url
      audio.value.volume = volume.value
      audio.value.load()
    }
  }

  const play = () => {
    if (audio.value) {
      audio.value.play()
      isPlaying.value = true
    }
  }

  const pause = () => {
    if (audio.value) {
      audio.value.pause()
      isPlaying.value = false
    }
  }

  const seekTo = (time: number) => {
    if (audio.value) {
      audio.value.currentTime = time
      currentTime.value = time
    }
  }

  const setVolume = (newVolume: number) => {
    volume.value = newVolume
    if (audio.value) {
      audio.value.volume = newVolume
    }
  }

  onMounted(() => {
    audio.value = new Audio()
    setupAudioEvents()
  })

  return {
    audio,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    loadTrack,
    play,
    pause,
    seekTo,
    setVolume
  }
}