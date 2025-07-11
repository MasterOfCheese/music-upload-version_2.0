<template>
  <div 
    ref="waveformContainer"
    class="soundcloud-waveform cursor-pointer"
    :class="mini ? 'h-12' : 'h-20 sm:h-24'"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @mouseleave="showHover = false"
  >
    <!-- Background bars (unplayed) - FULL WIDTH -->
    <div class="flex items-end justify-start h-full w-full px-2 py-2">
      <div
        v-for="(amplitude, index) in detailedWaveformData"
        :key="`bg-${index}`"
        class="waveform-bar-bg flex-shrink-0 transition-all duration-100"
        :style="{ 
          height: `${Math.max(amplitude * 90, mini ? 15 : 20)}%`,
          minHeight: mini ? '4px' : '6px',
          width: mini ? '2px' : '3px',
          marginRight: mini ? '1px' : '1.5px'
        }"
      />
    </div>
    
    <!-- Progress overlay (played portion) - FULL WIDTH CALCULATION -->
    <div
      v-if="isCurrent && progress > 0"
      class="absolute top-0 left-0 h-full overflow-hidden"
      :style="{ width: `${progress}%` }"
    >
      <div class="flex items-end justify-start h-full w-full px-2 py-2">
        <div
          v-for="(amplitude, index) in detailedWaveformData"
          :key="`progress-${index}`"
          class="waveform-bar-progress flex-shrink-0 transition-all duration-100"
          :style="{ 
            height: `${Math.max(amplitude * 90, mini ? 15 : 20)}%`,
            minHeight: mini ? '4px' : '6px',
            width: mini ? '2px' : '3px',
            marginRight: mini ? '1px' : '1.5px'
          }"
        />
      </div>
    </div>
    
    <!-- Hover indicator - FULL WIDTH CALCULATION -->
    <div
      v-if="showHover && !mini"
      class="absolute top-0 h-full w-0.5 bg-white/80 pointer-events-none rounded-full shadow-lg"
      :style="{ left: `${hoverPosition}%` }"
    />
    
    <!-- Current time indicator - FULL WIDTH CALCULATION -->
    <div
      v-if="isCurrent && isPlaying"
      class="absolute top-0 h-full w-0.5 bg-white pointer-events-none rounded-full shadow-lg animate-pulse"
      :style="{ left: `${progress}%` }"
    />
    
    <!-- Time display overlay for desktop only -->
    <div v-if="!mini && !isMobile" class="absolute bottom-1 right-2 text-xs text-gray-500 dark:text-dark-500 font-mono">
      {{ formatTime(duration) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
const isMobile = ref(false)

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

// Generate more detailed waveform data that spans FULL WIDTH
const detailedWaveformData = computed(() => {
  const originalData = props.waveformData
  // Increase bar count to fill the entire width properly
  let targetLength: number
  
  if (props.mini) {
    targetLength = isMobile.value ? 80 : 120 // Fewer bars but thicker for mini
  } else {
    targetLength = isMobile.value ? 150 : 250 // Fewer bars but thicker for desktop
  }
  
  const detailedData: number[] = []
  
  for (let i = 0; i < targetLength; i++) {
    const originalIndex = Math.floor((i / targetLength) * originalData.length)
    const baseAmplitude = originalData[originalIndex] || 0.1
    
    // Add some variation to make it look more realistic
    const variation = (Math.random() - 0.5) * 0.2
    const amplitude = Math.max(0.05, Math.min(1, baseAmplitude + variation))
    
    detailedData.push(amplitude)
  }
  
  return detailedData
})

const handleClick = (event: MouseEvent) => {
  if (!waveformContainer.value) return
  
  const rect = waveformContainer.value.getBoundingClientRect()
  // FIXED: Now calculates percentage based on FULL container width
  const percentage = ((event.clientX - rect.left) / rect.width) * 100
  emit('seek', Math.max(0, Math.min(100, percentage)))
}

const handleMouseMove = (event: MouseEvent) => {
  if (!waveformContainer.value || props.mini || isMobile.value) return
  
  const rect = waveformContainer.value.getBoundingClientRect()
  // FIXED: Now calculates hover position based on FULL container width
  hoverPosition.value = ((event.clientX - rect.left) / rect.width) * 100
  showHover.value = true
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.soundcloud-waveform {
  @apply relative rounded-lg overflow-hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  /* ENSURE FULL WIDTH */
  width: 100% !important;
}

.dark .soundcloud-waveform {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.waveform-bar-bg {
  @apply rounded-sm shadow-sm;
  background: rgba(156, 163, 175, 0.4);
  border: 0.5px solid rgba(156, 163, 175, 0.2);
}

.dark .waveform-bar-bg {
  background: rgba(107, 114, 128, 0.4);
  border: 0.5px solid rgba(107, 114, 128, 0.2);
}

.waveform-bar-progress {
  @apply rounded-sm shadow-md;
  background: linear-gradient(to top, #FF5500, #FF7733);
  box-shadow: 0 0 4px rgba(255, 85, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2);
  border: 0.5px solid rgba(255, 85, 0, 0.3);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .soundcloud-waveform {
    @apply rounded-lg;
    /* ENSURE FULL WIDTH ON MOBILE TOO */
    width: 100% !important;
    min-height: 48px;
  }
  
  .waveform-bar-bg,
  .waveform-bar-progress {
    @apply rounded-sm;
  }
}

/* Hover effects for desktop only */
@media (min-width: 641px) {
  .soundcloud-waveform:hover .waveform-bar-bg {
    background: rgba(156, 163, 175, 0.5);
  }

  .dark .soundcloud-waveform:hover .waveform-bar-bg {
    background: rgba(107, 114, 128, 0.5);
  }
  
  .waveform-bar-progress:hover {
    filter: brightness(1.1);
  }
}
</style>