<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Track Info -->
        <div class="flex items-center space-x-4 flex-1 min-w-0">
          <div class="w-12 h-12 bg-gradient-to-br from-soundcloud-orange to-orange-600 rounded-lg flex items-center justify-center">
            <MusicalNoteIcon class="w-6 h-6 text-white" />
          </div>
          <div class="min-w-0">
            <h4 class="text-sm font-medium text-gray-900 truncate">{{ track.title }}</h4>
            <p class="text-xs text-gray-500 truncate">{{ track.artist }}</p>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center space-x-4 mx-8">
          <button
            @click="$emit('previous')"
            class="btn-icon text-gray-600 hover:text-gray-900"
          >
            <BackwardIcon class="w-5 h-5" />
          </button>
          
          <button
            @click="togglePlay"
            class="w-12 h-12 bg-soundcloud-orange text-white rounded-full flex items-center justify-center hover:bg-soundcloud-orange-dark transition-colors duration-200 shadow-lg"
          >
            <PlayIcon v-if="!isPlaying" class="w-6 h-6 ml-1" />
            <PauseIcon v-else class="w-6 h-6" />
          </button>
          
          <button
            @click="$emit('next')"
            class="btn-icon text-gray-600 hover:text-gray-900"
          >
            <ForwardIcon class="w-5 h-5" />
          </button>
          
          <button
            @click="$emit('toggle-repeat')"
            class="btn-icon transition-colors duration-200"
            :class="repeatMode !== 'off' ? 'text-soundcloud-orange' : 'text-gray-600 hover:text-gray-900'"
          >
            <ArrowPathIcon class="w-5 h-5" />
            <span v-if="repeatMode === 'one'" class="absolute -top-1 -right-1 w-3 h-3 bg-soundcloud-orange text-white text-xs rounded-full flex items-center justify-center">1</span>
          </button>
        </div>

        <!-- Progress -->
        <div class="flex items-center space-x-4 flex-1">
          <span class="text-xs text-gray-500 w-10 text-right">{{ formatTime(currentTime) }}</span>
          <div class="flex-1 relative">
            <ProgressBar
              :current-time="currentTime"
              :duration="duration"
              @seek="onSeek"
            />
          </div>
          <span class="text-xs text-gray-500 w-10">{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  MusicalNoteIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/solid'
import ProgressBar from './ProgressBar.vue'
import type { Track } from '../types/Track'

interface Props {
  track: Track
  isPlaying: boolean
  currentTime: number
  duration: number
  repeatMode: 'off' | 'one' | 'all'
}

interface Emits {
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'next'): void
  (e: 'previous'): void
  (e: 'seek', time: number): void
  (e: 'toggle-repeat'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const togglePlay = () => {
  if (props.isPlaying) {
    emit('pause')
  } else {
    emit('play')
  }
}

const onSeek = (time: number) => {
  emit('seek', time)
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>