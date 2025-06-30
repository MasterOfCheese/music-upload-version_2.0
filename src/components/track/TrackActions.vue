<template>
  <div class="flex items-center space-x-2">
    <button
      @click.stop="handleToggleFavorite"
      :class="isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'"
      class="btn-icon p-2 min-w-[40px] min-h-[40px]"
    >
      <HeartIcon :class="isFavorite ? 'fill-current' : ''" class="w-5 h-5" />
    </button>
    
    <button
      @click.stop="handleShare"
      class="btn-icon p-2 min-w-[40px] min-h-[40px] text-gray-400 hover:text-blue-500"
    >
      <ShareIcon class="w-5 h-5" />
    </button>
    
    <button
      @click.stop="handleDelete"
      class="btn-icon p-2 min-w-[40px] min-h-[40px] text-gray-400 hover:text-red-500"
    >
      <TrashIcon class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { HeartIcon, ShareIcon, TrashIcon } from '@heroicons/vue/24/solid'
import type { Track } from '../../types/Track'

interface Props {
  track: Track
  trackId: string
  isFavorite: boolean
}

interface Emits {
  (e: 'toggle-favorite', trackId: string): void
  (e: 'share', track: Track): void
  (e: 'delete', trackId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// FIXED: Add proper event handlers with console logging for debugging
const handleToggleFavorite = () => {
  console.log('❤️ TrackActions: Toggle favorite clicked for track:', props.trackId)
  emit('toggle-favorite', props.trackId)
}

const handleShare = () => {
  console.log('📤 TrackActions: Share clicked for track:', props.track.title)
  emit('share', props.track)
}

const handleDelete = () => {
  console.log('🗑️ TrackActions: Delete clicked for track:', props.trackId, props.track.title)
  emit('delete', props.trackId)
}
</script>