<template>
  <div class="flex items-center space-x-4">
    <Button
      variant="icon"
      @click="$emit('toggle-shuffle')"
      :class="isShuffled ? 'text-soundcloud-orange' : 'text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900'"
    >
      <ArrowsRightLeftIcon class="w-5 h-5" />
    </Button>
    
    <Button
      variant="icon"
      @click="$emit('previous')"
      class="text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900"
    >
      <BackwardIcon class="w-6 h-6" />
    </Button>
    
    <Button
      @click="togglePlay"
      class="w-12 h-12 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light text-white rounded-full flex items-center justify-center hover:shadow-glow transition-all duration-200 transform hover:scale-110"
    >
      <PlayIcon v-if="!isPlaying" class="w-6 h-6 ml-1" />
      <PauseIcon v-else class="w-6 h-6" />
    </Button>
    
    <Button
      variant="icon"
      @click="$emit('next')"
      class="text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900"
    >
      <ForwardIcon class="w-6 h-6" />
    </Button>
    
    <Button
      variant="icon"
      @click="$emit('toggle-repeat')"
      :class="repeatMode !== 'off' ? 'text-soundcloud-orange' : 'text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900'"
      class="relative"
    >
      <ArrowPathIcon class="w-5 h-5" />
      <span 
        v-if="repeatMode === 'one'" 
        class="absolute -top-1 -right-1 w-3 h-3 bg-soundcloud-orange text-white text-xs rounded-full flex items-center justify-center font-bold"
      >
        1
      </span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon
} from '@heroicons/vue/24/solid'
import Button from '../ui/Button.vue'

interface Props {
  isPlaying: boolean
  repeatMode: 'off' | 'one' | 'all'
  isShuffled: boolean
}

interface Emits {
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'next'): void
  (e: 'previous'): void
  (e: 'toggle-repeat'): void
  (e: 'toggle-shuffle'): void
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
</script>