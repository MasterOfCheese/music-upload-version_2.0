<template>
  <div class="flex items-center space-x-2">
    <button
      variant="icon"
      @click="$emit('toggle-favorite', trackId)"
      :class="isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'"
    >
      <HeartIcon :class="isFavorite ? 'fill-current' : ''" class="w-5 h-5" />
    </button>
    
    <button
      variant="icon"
      @click="$emit('share', track)"
      class="text-gray-400 hover:text-blue-500"
    >
      <ShareIcon class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { HeartIcon, ShareIcon } from '@heroicons/vue/24/solid'
import type { Track } from '../../types/Track'

interface Props {
  track: Track
  trackId: string
  isFavorite: boolean
}

interface Emits {
  (e: 'toggle-favorite', trackId: string): void
  (e: 'share', track: Track): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>