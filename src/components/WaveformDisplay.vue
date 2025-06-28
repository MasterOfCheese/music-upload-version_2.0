<template>
  <div 
    ref="waveformContainer"
    class="waveform-container cursor-pointer"
    :class="mini ? 'h-8' : 'h-16'"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @mouseleave="showHover = false"
  >
    <div class="flex items-end justify-center h-full px-2 space-x-0.5 py-1">
      <div
        v-for="(amplitude, index) in waveformData"
        :key="index"
        class="waveform-bar flex-1 min-w-0 transition-all duration-100 rounded-sm"
        :class="[
          getBarClass(index),
          { 'playing': isCurrent && isPlaying && index < progressIndex }
        ]"
        :style="{ 
          height: `${Math.max(amplitude * 85, mini ? 8 : 12)}%`,
          minHeight: mini ? '4px' : '6px'
        }"
      />
    </div>
    
    <!-- Progress Overlay -->
    <div
      v-if="isCurrent && progress > 0"
      class="absolute top-0 left-0 h-full bg-gradient-to-r from-soundcloud-orange/30 to-soundcloud-orange-light/30 pointer-events-none transition-all duration-100 rounded-lg"
      :style="{ width: `${progress}%` }"
    />
    
    <!-- Hover Indicator -->
    <div
      v-if="showHover && !mini"
      class="absolute top-0 h-full w-0.5 bg-soundcloud-orange pointer-events-none rounded-full"
      :style="{ left: `${hoverPosition}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  waveformData: number[]
  isCurrent: boolean
  progress: number
  mini?: boolean
  isPlaying?: boolean
}

interface Emits {
  (e: 'seek', percentage: number): void
}

const props = withDefaults(defineProps<Props>(), {
  mini: false,
  isPlaying: false
})

const emit = defineEmits<Emits>()

const waveformContainer = ref<HTMLElement>()
const showHover = ref(false)
const hoverPosition = ref(0)

const progressIndex = computed(() => {
  return (props.progress / 100) * props.waveformData.length
})

const getBarClass = (index: number) => {
  if (props.isCurrent && index < progressIndex.value) {
    return 'bg-gradient-to-t from-soundcloud-orange to-soundcloud-orange-light'
  }
  return 'bg-gray-300 dark:bg-dark-300 hover:bg-gray-400 dark:hover:bg-dark-400'
}

const handleClick = (event: MouseEvent) => {
  if (!waveformContainer.value) return
  
  const rect = waveformContainer.value.getBoundingClientRect()
  const percentage = ((event.clientX - rect.left) / rect.width) * 100
  emit('seek', Math.max(0, Math.min(100, percentage)))
}

const handleMouseMove = (event: MouseEvent) => {
  if (!waveformContainer.value || props.mini) return
  
  const rect = waveformContainer.value.getBoundingClientRect()
  hoverPosition.value = ((event.clientX - rect.left) / rect.width) * 100
  showHover.value = true
}
</script>