<template>
  <div 
    ref="waveformContainer"
    class="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
    :class="mini ? 'h-8' : 'h-16'"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @mouseleave="showHover = false"
  >
    <!-- Waveform bars -->
    <div class="flex items-end justify-start h-full px-1 py-1">
      <div
        v-for="(amplitude, index) in displayWaveformData"
        :key="index"
        class="waveform-bar flex-shrink-0 transition-all duration-100 rounded-sm"
        :class="[
          index <= progressIndex ? 'bg-soundcloud-orange' : 'bg-gray-300 dark:bg-gray-600',
          { 'playing': isPlaying && isCurrent && index <= progressIndex }
        ]"
        :style="{ 
          height: `${Math.max(amplitude * 85, mini ? 8 : 12)}%`,
          width: mini ? '1px' : '2px',
          marginRight: '1px'
        }"
      />
    </div>
    
    <!-- Hover indicator -->
    <div
      v-if="showHover"
      class="absolute top-0 h-full w-0.5 bg-soundcloud-orange-light pointer-events-none"
      :style="{ left: `${hoverPosition}%` }"
    />
    
    <!-- Progress indicator -->
    <div
      v-if="isCurrent && progress > 0"
      class="absolute top-0 h-full w-0.5 bg-white pointer-events-none shadow-lg"
      :style="{ left: `${progress}%` }"
    />
    
    <!-- Time display -->
    <div v-if="!mini && duration > 0" class="absolute bottom-1 right-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
      {{ formatTime(duration) }}
    </div>
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
  duration?: number
}

interface Emits {
  (e: 'seek', percentage: number): void
}

const props = withDefaults(defineProps<Props>(), {
  mini: false,
  isPlaying: false,
  duration: 0
})

const emit = defineEmits<Emits>()

const waveformContainer = ref<HTMLElement>()
const showHover = ref(false)
const hoverPosition = ref(0)

// Generate detailed waveform data
const displayWaveformData = computed(() => {
  const originalData = props.waveformData
  if (!originalData || originalData.length === 0) {
    // Generate default waveform if no data
    const barCount = props.mini ? 100 : 200
    return Array.from({ length: barCount }, () => Math.random() * 0.8 + 0.2)
  }
  
  const targetLength = props.mini ? 100 : 200
  const sampledData: number[] = []
  
  for (let i = 0; i < targetLength; i++) {
    const originalIndex = Math.floor((i / targetLength) * originalData.length)
    const amplitude = originalData[originalIndex] || 0.3
    sampledData.push(amplitude)
  }
  
  return sampledData
})

// Calculate progress index
const progressIndex = computed(() => {
  return Math.floor((props.progress / 100) * displayWaveformData.value.length)
})

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

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.waveform-bar.playing {
  animation: waveform-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes waveform-pulse {
  0% { transform: scaleY(1); }
  100% { transform: scaleY(1.1); }
}
</style>
</template>