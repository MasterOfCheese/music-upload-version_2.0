<template>
  <div class="card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group">
    <div class="flex items-center space-x-3 sm:space-x-4">
      <!-- Play Button -->
      <button
        @click="togglePlay"
        class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light rounded-full flex items-center justify-center text-white shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <PauseIcon v-if="isPlaying" class="w-5 h-5 sm:w-6 sm:h-6" />
        <PlayIcon v-else class="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
      </button>
      
      <!-- Track Info & Waveform -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between mb-2 sm:mb-3">
          <div class="min-w-0 flex-1">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-900 truncate group-hover:text-soundcloud-orange transition-colors">
              {{ track.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-dark-600 truncate">
              {{ track.artist }} • {{ formatDate(track.uploadedAt) }}
            </p>
          </div>
          
          <!-- Duration -->
          <div class="flex-shrink-0 ml-3 text-sm text-gray-500 dark:text-dark-500 font-mono">
            {{ formatDuration(track.duration) }}
          </div>
        </div>
        
        <!-- Waveform -->
        <div class="mb-3">
          <WaveformDisplay
            :waveform-data="track.waveformData || []"
            :is-current="isCurrent"
            :progress="progress"
            :is-playing="isPlaying"
            :duration="track.duration"
            @seek="handleSeek"
          />
        </div>
        
        <!-- Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <!-- Play Count -->
            <div v-if="track.playCount && track.playCount > 0" class="flex items-center space-x-1 text-xs text-gray-500 dark:text-dark-500">
              <PlayIcon class="w-3 h-3" />
              <span>{{ track.playCount }}</span>
            </div>
            
            <!-- Upload Info -->
            <div class="text-xs text-gray-400 dark:text-dark-400">
              {{ track.fileName ? 'Cloud' : 'Local' }}
            </div>
          </div>
          
          <div class="flex items-center space-x-1 sm:space-x-2">
            <!-- Favorite Button -->
            <button
              @click="$emit('toggle-favorite', track.id)"
              class="btn-icon w-8 h-8 sm:w-10 sm:h-10"
              :class="{ 'text-red-500': isFavorite }"
            >
              <HeartIcon class="w-4 h-4 sm:w-5 sm:h-5" :class="{ 'fill-current': isFavorite }" />
            </button>
            
            <!-- Share Button -->
            <button
              @click="$emit('share', track)"
              class="btn-icon w-8 h-8 sm:w-10 sm:h-10"
            >
              <ShareIcon class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <!-- Delete Button -->
            <button
              @click="$emit('delete', track.id)"
              class="btn-icon w-8 h-8 sm:w-10 sm:h-10 text-red-500 hover:text-red-600"
            >
              <TrashIcon class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  PlayIcon, 
  PauseIcon, 
  HeartIcon, 
  ShareIcon, 
  TrashIcon 
} from '@heroicons/vue/24/outline'
import WaveformDisplay from './WaveformDisplay.vue'
import type { Track } from '../types/Track'

interface Props {
  track: Track
  isPlaying: boolean
  isCurrent: boolean
  isFavorite: boolean
  currentTime: number
  duration: number
}

interface Emits {
  (e: 'play', track: Track): void
  (e: 'pause'): void
  (e: 'delete', trackId: string): void
  (e: 'seek', time: number): void
  (e: 'toggle-favorite', trackId: string): void
  (e: 'share', track: Track): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const progress = computed(() => {
  if (!props.isCurrent || props.duration === 0) return 0
  return (props.currentTime / props.duration) * 100
})

const togglePlay = () => {
  if (props.isPlaying && props.isCurrent) {
    emit('pause')
  } else {
    emit('play', props.track)
  }
}

const handleSeek = (percentage: number) => {
  const time = (percentage / 100) * props.track.duration
  emit('seek', time)
}

const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>