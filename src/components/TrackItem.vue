<template>
  <div class="card track-item">
    <div class="flex items-center space-x-4">
      <!-- Play Button -->
      <button
        @click="togglePlay"
        class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light text-white rounded-full flex items-center justify-center hover:shadow-glow transition-all duration-200 transform hover:scale-110"
      >
        <PlayIcon v-if="!isPlaying" class="w-6 h-6 ml-1" />
        <PauseIcon v-else class="w-6 h-6" />
      </button>

      <!-- Track Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-3">
          <div class="min-w-0 flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-900 truncate">{{ track.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-dark-500 truncate">{{ track.artist }}</p>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <span class="text-sm text-gray-400 dark:text-dark-400">{{ formatDuration(track.duration) }}</span>
            
            <!-- Action Buttons -->
            <button
              @click="$emit('toggle-favorite', track.id)"
              class="btn-icon"
              :class="isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'"
            >
              <HeartIcon :class="isFavorite ? 'fill-current' : ''" class="w-5 h-5" />
            </button>
            
            <button
              @click="$emit('share', track)"
              class="btn-icon text-gray-400 hover:text-blue-500"
            >
              <ShareIcon class="w-5 h-5" />
            </button>
            
            <button
              @click="$emit('delete', track.id)"
              class="btn-icon text-gray-400 hover:text-red-500"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Waveform -->
        <div class="relative">
          <WaveformDisplay
            :waveform-data="track.waveformData"
            :is-current="isCurrent"
            :progress="isCurrent ? (currentTime / duration) * 100 : 0"
            @seek="onSeek"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon, PauseIcon, TrashIcon, HeartIcon, ShareIcon } from '@heroicons/vue/24/solid'
import WaveformDisplay from './WaveformDisplay.vue'
import type { Track } from '../types/Track'

interface Props {
  track: Track
  isPlaying: boolean
  isCurrent: boolean
  isFavorite: boolean
  currentTime?: number
  duration?: number
}

interface Emits {
  (e: 'play', track: Track): void
  (e: 'pause'): void
  (e: 'delete', trackId: string): void
  (e: 'seek', time: number): void
  (e: 'toggle-favorite', trackId: string): void
  (e: 'share', track: Track): void
}

const props = withDefaults(defineProps<Props>(), {
  currentTime: 0,
  duration: 1
})

const emit = defineEmits<Emits>()

const togglePlay = () => {
  if (props.isPlaying && props.isCurrent) {
    emit('pause')
  } else {
    emit('play', props.track)
  }
}

const onSeek = (percentage: number) => {
  if (props.isCurrent) {
    const time = (percentage / 100) * props.duration
    emit('seek', time)
  }
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>