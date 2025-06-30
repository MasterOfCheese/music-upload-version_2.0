<template>
  <div class="floating-player">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Desktop Player -->
      <div class="desktop-player items-center justify-between h-20">
        <!-- Track Info -->
        <div class="flex items-center space-x-4 flex-1 min-w-0">
          
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-dark-900 truncate">{{ track.title }}</h4>
            <p class="text-xs text-gray-500 dark:text-dark-500 truncate">{{ track.artist }}</p>
          </div>
          <TrackActions
            :track="track"
            :track-id="track.id"
            :is-favorite="isFavorite"
            @share="$emit('share', track)"
            @toggle-favorite="$emit('toggle-favorite', track.id)"
            class="hidden sm:flex"
          />
        </div>

        <!-- Controls -->
        <div class="flex flex-col items-center space-y-2 mx-8">
          <PlayerControls
            :is-playing="isPlaying"
            :repeat-mode="repeatMode"
            :is-shuffled="isShuffled"
            @play="$emit('play')"
            @pause="$emit('pause')"
            @next="$emit('next')"
            @previous="$emit('previous')"
            @toggle-repeat="$emit('toggle-repeat')"
            @toggle-shuffle="$emit('toggle-shuffle')"
          />
          
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
          <VolumeControl
            :volume="volume"
            @volume-change="onVolumeChange"
          />
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
          
          <TrackActions
            :track="track"
            :track-id="track.id"
            :is-favorite="isFavorite"
            @share="$emit('share', track)"
            @toggle-favorite="$emit('toggle-favorite', track.id)"
            class="sm:hidden"
          />
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
            <PlayerControls
              :is-playing="isPlaying"
              :repeat-mode="repeatMode"
              :is-shuffled="isShuffled"
              @play="$emit('play')"
              @pause="$emit('pause')"
              @next="$emit('next')"
              @previous="$emit('previous')"
              @toggle-repeat="$emit('toggle-repeat')"
              @toggle-shuffle="$emit('toggle-shuffle')"
              class="flex items-center space-x-4"
            />
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MusicalNoteIcon } from '@heroicons/vue/24/solid'
import ProgressBar from './ProgressBar.vue'
import PlayerControls from './player/PlayerControls.vue'
import VolumeControl from './player/VolumeControl.vue'
import TrackActions from './track/TrackActions.vue'
import { formatTime } from '../utils/formatters'
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

const onSeek = (time: number) => {
  emit('seek', time)
}

const onVolumeChange = (volume: number) => {
  emit('volume-change', volume)
}
</script>