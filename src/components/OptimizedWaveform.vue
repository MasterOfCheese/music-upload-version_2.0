<template>
  <div 
    ref="waveformContainer"
    class="optimized-waveform cursor-pointer"
    :class="[
      mini ? 'h-8' : 'h-16 sm:h-20',
      { 'low-quality': isLowPowerMode || connectionType === 'slow' }
    ]"
    @click="handleClick"
    @mousemove="!isMobile ? handleMouseMove : undefined"
    @mouseleave="showHover = false"
  >
    <!-- Simplified waveform for low-power devices -->
    <div v-if="useSimplifiedWaveform" class="simple-waveform">
      <div class="flex items-end justify-start h-full w-full px-1 py-1">
        <div
          v-for="(amplitude, index) in simplifiedWaveformData"
          :key="`simple-${index}`"
          class="waveform-bar-simple flex-shrink-0"
          :style="{ 
            height: `${Math.max(amplitude * 80, 8)}%`,
            width: '3px',
            marginRight: '2px'
          }"
        />
      </div>
      
      <!-- Progress overlay for simple waveform -->
      <div
        v-if="isCurrent && progress > 0"
        class="absolute top-0 left-0 h-full overflow-hidden bg-soundcloud-orange opacity-60"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <!-- Full quality waveform for good connections -->
    <div v-else class="full-waveform">
      <!-- Background bars -->
      <div class="flex items-end justify-start h-full w-full px-1 py-1">
        <div
          v-for="(amplitude, index) in optimizedWaveformData"
          :key="`bg-${index}`"
          class="waveform-bar-bg flex-shrink-0 transition-all duration-100"
          :style="{ 
            height: `${Math.max(amplitude * 85, mini ? 8 : 12)}%`,
            minHeight: mini ? '2px' : '3px',
            width: mini ? '1px' : '1.5px',
            marginRight: mini ? '0.5px' : '1px'
          }"
        />
      </div>
      
      <!-- Progress overlay -->
      <div
        v-if="isCurrent && progress > 0"
        class="absolute top-0 left-0 h-full overflow-hidden"
        :style="{ width: `${progress}%` }"
      >
        <div class="flex items-end justify-start h-full w-full px-1 py-1">
          <div
            v-for="(amplitude, index) in optimizedWaveformData"
            :key="`progress-${index}`"
            class="waveform-bar-progress flex-shrink-0 transition-all duration-100"
            :style="{ 
              height: `${Math.max(amplitude * 85, mini ? 8 : 12)}%`,
              minHeight: mini ? '2px' : '3px',
              width: mini ? '1px' : '1.5px',
              marginRight: mini ? '0.5px' : '1px'
            }"
          />
        </div>
      </div>
    </div>
    
    <!-- Hover indicator (desktop only) -->
    <div
      v-if="showHover && !mini && !isMobile"
      class="absolute top-0 h-full w-0.5 bg-white/80 pointer-events-none rounded-full shadow-lg"
      :style="{ left: `${hoverPosition}%` }"
    />
    
    <!-- Current time indicator -->
    <div
      v-if="isCurrent && isPlaying && !isLowPowerMode"
      class="absolute top-0 h-full w-0.5 bg-white pointer-events-none rounded-full shadow-lg animate-pulse"
      :style="{ left: `${progress}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePerformanceOptimization } from '../composables/usePerformanceOptimization'

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

const { isLowPowerMode, connectionType, isVisible } = usePerformanceOptimization()

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

// Use simplified waveform for low-power devices or slow connections
const useSimplifiedWaveform = computed(() => {
  return isLowPowerMode.value || connectionType.value === 'slow' || isMobile.value
})

// Simplified waveform with fewer bars
const simplifiedWaveformData = computed(() => {
  const originalData = props.waveformData
  const targetLength = props.mini ? 20 : 40 // Much fewer bars
  const simplifiedData: number[] = []
  
  for (let i = 0; i < targetLength; i++) {
    const originalIndex = Math.floor((i / targetLength) * originalData.length)
    const amplitude = originalData[originalIndex] || 0.3
    simplifiedData.push(amplitude)
  }
  
  return simplifiedData
})

// Optimized waveform data
const optimizedWaveformData = computed(() => {
  const originalData = props.waveformData
  let targetLength: number
  
  if (props.mini) {
    targetLength = isMobile.value ? 60 : 120
  } else {
    targetLength = isMobile.value ? 120 : 200 // Reduced from 400
  }
  
  const detailedData: number[] = []
  
  for (let i = 0; i < targetLength; i++) {
    const originalIndex = Math.floor((i / targetLength) * originalData.length)
    const baseAmplitude = originalData[originalIndex] || 0.1
    
    // Reduce variation calculation for better performance
    const amplitude = Math.max(0.05, Math.min(1, baseAmplitude))
    detailedData.push(amplitude)
  }
  
  return detailedData
})

const handleClick = (event: MouseEvent) => {
  if (!waveformContainer.value) return
  
  const rect = waveformContainer.value.getBoundingClientRect()
  const percentage = ((event.clientX - rect.left) / rect.width) * 100
  emit('seek', Math.max(0, Math.min(100, percentage)))
}

const handleMouseMove = (event: MouseEvent) => {
  if (!waveformContainer.value || props.mini || isMobile.value || isLowPowerMode.value) return
  
  const rect = waveformContainer.value.getBoundingClientRect()
  hoverPosition.value = ((event.clientX - rect.left) / rect.width) * 100
  showHover.value = true
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
.optimized-waveform {
  @apply relative rounded-lg overflow-hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  width: 100% !important;
}

.dark .optimized-waveform {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.low-quality {
  @apply rounded-md;
}

.waveform-bar-bg {
  @apply rounded-sm;
  background: rgba(156, 163, 175, 0.3);
}

.dark .waveform-bar-bg {
  background: rgba(107, 114, 128, 0.3);
}

.waveform-bar-progress {
  @apply rounded-sm;
  background: linear-gradient(to top, #FF5500, #FF7733);
}

.waveform-bar-simple {
  background: rgba(156, 163, 175, 0.4);
  @apply rounded-sm;
}

.dark .waveform-bar-simple {
  background: rgba(107, 114, 128, 0.4);
}

/* Disable animations on low-power devices */
.low-quality .waveform-bar-bg,
.low-quality .waveform-bar-progress {
  transition: none !important;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .optimized-waveform {
    @apply rounded-md;
    width: 100% !important;
  }
  
  .waveform-bar-bg,
  .waveform-bar-progress,
  .waveform-bar-simple {
    @apply rounded-none;
  }
}

/* Reduce GPU usage on low-power devices */
@media (prefers-reduced-motion: reduce) {
  .optimized-waveform * {
    animation: none !important;
    transition: none !important;
  }
}
</style>