<template>
  <div class="card track-item">
    <div class="flex items-center space-x-3 sm:space-x-4">
      <!-- Play Button -->
      <Button
        @click="togglePlay"
        class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light text-white rounded-full flex items-center justify-center hover:shadow-glow transition-all duration-200 transform hover:scale-110"
      >
        <PlayIcon v-if="!isPlaying" class="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
        <PauseIcon v-else class="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>

      <!-- Track Info -->
      <div class="flex-1 min-w-0">
        <!-- Mobile Layout -->
        <div class="sm:hidden">
          <div class="flex flex-col space-y-2 mb-3">
            <div class="flex items-start justify-between">
              <div class="min-w-0 flex-1 pr-2">
                <h3 class="text-base font-semibold text-gray-900 dark:text-dark-900 leading-tight">
                  {{ track.title }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-dark-500 mt-1">
                  {{ track.artist }}
                </p>
                <div class="flex items-center space-x-3 mt-1 text-xs text-gray-400 dark:text-dark-400">
                  <span>{{ formatDuration(track.duration) }}</span>
                  <span>•</span>
                  <span>{{ track.playCount || 0 }} lượt play</span>
                </div>
              </div>
              
              <!-- Mobile Action Buttons -->
              <TrackActions
                :track="track"
                :track-id="track.id"
                :is-favorite="isFavorite"
                @share="$emit('share', track)"
                @delete="$emit('delete', track.id)"
                @toggle-favorite="$emit('toggle-favorite', track.id)"
                class="flex-shrink-0"
              />
            </div>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden sm:block">
          <div class="flex items-center justify-between mb-3">
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-900 truncate">{{ track.title }}</h3>
              <div class="flex items-center space-x-4 mt-1">
                <p class="text-sm text-gray-500 dark:text-dark-500 truncate">{{ track.artist }}</p>
                <span class="text-xs text-gray-400 dark:text-dark-400">{{ track.playCount || 0 }} lượt play</span>
              </div>
            </div>
            <div class="flex items-center space-x-2 ml-4">
              <span class="text-sm text-gray-400 dark:text-dark-400">{{ formatDuration(track.duration) }}</span>
              
              <!-- Desktop Action Buttons -->
              <TrackActions
                :track="track"
                :track-id="track.id"
                :is-favorite="isFavorite"
                @share="$emit('share', track)"
                @delete="$emit('delete', track.id)"
                @toggle-favorite="$emit('toggle-favorite', track.id)"
              />
            </div>
          </div>
        </div>

        <!-- SoundCloud Waveform -->
        <div class="relative">
          <SoundCloudWaveform
            :waveform-data="track.waveformData"
            :is-current="isCurrent"
            :progress="isCurrent ? (currentTime / duration) * 100 : 0"
            :is-playing="isPlaying && isCurrent"
            @seek="onSeek"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon, PauseIcon } from '@heroicons/vue/24/solid'
import SoundCloudWaveform from './waveform/SoundCloudWaveform.vue'
import TrackActions from './track/TrackActions.vue'
import Button from './ui/Button.vue'
import { formatDuration } from '../utils/formatters'
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
</script>