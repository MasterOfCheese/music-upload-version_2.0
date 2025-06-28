<template>
  <div class="card track-item group">
    <!-- Cover Art -->
    <div class="relative mb-4 aspect-square bg-gradient-to-br from-soundcloud-orange/20 to-soundcloud-orange-light/20 rounded-xl overflow-hidden">
      <div class="absolute inset-0 flex items-center justify-center">
        <MusicalNoteIcon class="w-16 h-16 text-soundcloud-orange/50" />
      </div>
      
      <!-- Play Overlay -->
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <button
          @click="togglePlay"
          class="w-16 h-16 bg-white text-soundcloud-orange rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg"
        >
          <PlayIcon v-if="!isPlaying" class="w-8 h-8 ml-1" />
          <PauseIcon v-else class="w-8 h-8" />
        </button>
      </div>
      
      <!-- Favorite Button -->
      <button
        @click="$emit('toggle-favorite', track.id)"
        class="absolute top-3 right-3 btn-icon bg-white/20 backdrop-blur-sm"
        :class="isFavorite ? 'text-red-500' : 'text-white hover:text-red-500'"
      >
        <HeartIcon :class="isFavorite ? 'fill-current' : ''" class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Track Info -->
    <div class="space-y-2">
      <h3 class="font-semibold text-gray-900 dark:text-dark-900 truncate">{{ track.title }}</h3>
      <p class="text-sm text-gray-500 dark:text-dark-500 truncate">{{ track.artist }}</p>
      
      <!-- Mini Waveform -->
      <div class="h-8">
        <WaveformDisplay
          :waveform-data="track.waveformData"
          :is-current="isCurrent"
          :progress="isCurrent ? (currentTime / duration) * 100 : 0"
          @seek="onSeek"
          :mini="true"
        />
      </div>
      
      <!-- Actions -->
      <div class="flex items-center justify-between pt-2">
        <span class="text-xs text-gray-400 dark:text-dark-400">{{ formatDuration(track.duration) }}</span>
        
        <div class="flex items-center space-x-1">
          <button
            @click="$emit('share', track)"
            class="btn-icon text-gray-400 hover:text-blue-500"
          >
            <ShareIcon class="w-4 h-4" />
          </button>
          
          <button
            @click="$emit('delete', track.id)"
            class="btn-icon text-gray-400 hover:text-red-500"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon, PauseIcon, TrashIcon, HeartIcon, ShareIcon, MusicalNoteIcon } from '@heroicons/vue/24/solid'
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