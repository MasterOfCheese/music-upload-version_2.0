<template>
  <div class="floating-player">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Desktop Player -->
      <div class="desktop-player items-center justify-between h-20">
        <!-- Track Info -->
        <div class="flex items-center space-x-4 flex-1 min-w-0">
          <div class="w-14 h-14 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light rounded-xl flex items-center justify-center shadow-glow">
            <MusicalNoteIcon class="w-7 h-7 text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-dark-900 truncate">{{ track.title }}</h4>
            <p class="text-xs text-gray-500 dark:text-dark-500 truncate">{{ track.artist }}</p>
          </div>
          <div class="flex items-center space-x-2">
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
          </div>
        </div>

        <!-- Controls -->
        <div class="flex flex-col items-center space-y-2 mx-8">
          <div class="flex items-center space-x-4">
            <button
              @click="$emit('toggle-shuffle')"
              class="btn-icon transition-colors duration-200"
              :class="isShuffled ? 'text-soundcloud-orange' : 'text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900'"
            >
              <ArrowsRightLeftIcon class="w-5 h-5" />
            </button>
            
            <button
              @click="$emit('previous')"
              class="btn-icon text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900"
            >
              <BackwardIcon class="w-6 h-6" />
            </button>
            
            <button
              @click="togglePlay"
              class="w-12 h-12 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light text-white rounded-full flex items-center justify-center hover:shadow-glow transition-all duration-200 transform hover:scale-110"
            >
              <PlayIcon v-if="!isPlaying" class="w-6 h-6 ml-1" />
              <PauseIcon v-else class="w-6 h-6" />
            </button>
            
            <button
              @click="$emit('next')"
              class="btn-icon text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900"
            >
              <ForwardIcon class="w-6 h-6" />
            </button>
            
            <button
              @click="$emit('toggle-repeat')"
              class="btn-icon transition-colors duration-200 relative"
              :class="repeatMode !== 'off' ? 'text-soundcloud-orange' : 'text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900'"
            >
              <ArrowPathIcon class="w-5 h-5" />
              <span v-if="repeatMode === 'one'" class="absolute -top-1 -right-1 w-3 h-3 bg-soundcloud-orange text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
            </button>
          </div>
          
          <!-- Progress Bar -->
          <div class="flex items-center space-x-3 w-96">
            <span class="text-xs text-gray-500 dark:text-dark-500 w-10 text-right">{{ formatTime(currentTime) }}</span>
            <div class="flex-1">
              <ProgressBar
                :current-time="currentTime"
                :duration="duration"
                @seek="onSeek"
              />
            </div>
            <span class="text-xs text-gray-500 dark:text-dark-500 w-10">{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- Volume & Settings -->
        <div class="flex items-center space-x-4 flex-1 justify-end">
          <div class="flex items-center space-x-2">
            <SpeakerWaveIcon class="w-5 h-5 text-gray-500 dark:text-dark-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="volume"
              @input="onVolumeChange"
              class="volume-slider w-20"
            />
          </div>
        </div>
      </div>

      <!-- Mobile Player -->
      <div class="mobile-player">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <div class="w-12 h-12 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light rounded-lg flex items-center justify-center">
              <MusicalNoteIcon class="w-6 h-6 text-white" />
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-medium text-gray-900 dark:text-dark-900 truncate">{{ track.title }}</h4>
              <p class="text-xs text-gray-500 dark:text-dark-500 truncate">{{ track.artist }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="$emit('toggle-favorite', track.id)"
              class="btn-icon"
              :class="isFavorite ? 'text-red-500' : 'text-gray-400'"
            >
              <HeartIcon :class="isFavorite ? 'fill-current' : ''" class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Mobile Progress -->
        <div class="space-y-2">
          <ProgressBar
            :current-time="currentTime"
            :duration="duration"
            @seek="onSeek"
          />
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-dark-500">
            <span>{{ formatTime(currentTime) }}</span>
            <div class="flex items-center space-x-4">
              <button @click="$emit('previous')" class="btn-icon">
                <BackwardIcon class="w-4 h-4" />
              </button>
              
              <!-- Stop/Play Button -->
              <button
                @click="togglePlay"
                class="w-10 h-10 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light text-white rounded-full flex items-center justify-center"
              >
                <PlayIcon v-if="!isPlaying" class="w-5 h-5 ml-0.5" />
                <PauseIcon v-else class="w-5 h-5" />
              </button>
              
              <button @click="$emit('next')" class="btn-icon">
                <ForwardIcon class="w-4 h-4" />
              </button>
              
              <!-- Repeat Button for Mobile -->
              <button
                @click="$emit('toggle-repeat')"
                class="btn-icon transition-colors duration-200 relative"
                :class="repeatMode !== 'off' ? 'text-soundcloud-orange' : 'text-gray-600 dark:text-dark-600'"
                :title="repeatMode === 'off' ? 'Repeat Off' : repeatMode === 'one' ? 'Repeat One' : 'Repeat All'"
              >
                <ArrowPathIcon class="w-4 h-4" />
                <span v-if="repeatMode === 'one'" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-soundcloud-orange text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">1</span>
              </button>
            </div>
            <span>{{ formatTime(duration) }}</span>
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
  ForwardIcon, 
  BackwardIcon,
  MusicalNoteIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  HeartIcon,
  ShareIcon,
  SpeakerWaveIcon
} from '@heroicons/vue/24/solid'
import ProgressBar from './ProgressBar.vue'
import type { Track } from '../types/Track'

interface Props {
  track: Track
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  repeatMode: 'off' | 'one' | 'all'
  isShuffled: boolean
  isFavorite: boolean
}

interface Emits {
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'next'): void
  (e: 'previous'): void
  (e: 'seek', time: number): void
  (e: 'volume-change', volume: number): void
  (e: 'toggle-repeat'): void
  (e: 'toggle-shuffle'): void
  (e: 'toggle-favorite', trackId: string): void
  (e: 'share', track: Track): void
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

const onVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('volume-change', parseFloat(target.value))
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>