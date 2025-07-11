<template>
  <div 
    ref="waveformContainer"
    class="soundcloud-waveform cursor-pointer w-full"
    :class="mini ? 'h-8' : 'h-16 sm:h-20'"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @mouseleave="showHover = false"
  >
    <!-- Background bars (unplayed) -->
    <div class="flex items-end justify-start h-full w-full px-1 py-1">
      <div
        v-for="(amplitude, index) in detailedWaveformData"
        :key="`bg-${index}`"
        class="waveform-bar-bg flex-shrink-0 transition-all duration-100"
        :style="{ 
          height: `${Math.max(amplitude * 95, mini ? 8 : 12)}%`,
          minHeight: mini ? '2px' : '3px',
          width: mini ? '1px' : '2px',
          marginRight: '1px'
        }"
      />
    </div>
    
    <!-- Progress overlay (played portion) -->
    <div
      v-if="isCurrent && progress > 0"
      class="absolute top-0 left-0 h-full overflow-hidden"
      :style="{ width: `${progress}%` }"
    >
      <div class="flex items-end justify-start h-full w-full px-1 py-1">
        <div
          v-for="(amplitude, index) in detailedWaveformData"
          :key="`progress-${index}`"
          class="waveform-bar-progress flex-shrink-0 transition-all duration-100"
          :style="{ 
            height: `${Math.max(amplitude * 95, mini ? 8 : 12)}%`,
            minHeight: mini ? '2px' : '3px',
            width: mini ? '1px' : '2px',
            marginRight: '1px'
          }"
        />
      </div>
    </div>
    
    <!-- Hover indicator -->
    <div
      v-if="showHover && !mini"
      class="absolute top-0 h-full w-0.5 bg-white/80 pointer-events-none rounded-full shadow-lg"
      :style="{ left: `${hoverPosition}%` }"
    />
    
    <!-- Current time indicator -->
    <div
      v-if="isCurrent && isPlaying"
      class="absolute top-0 h-full w-0.5 bg-white pointer-events-none rounded-full shadow-lg animate-pulse"
      :style="{ left: `${progress}%` }"
    />
    
    <!-- Time display overlay -->
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
  // Tăng số lượng thanh để giống SoundCloud
  const targetLength = props.mini ? 200 : 400
  
  const detailedData: number[] = []
  
  for (let i = 0; i < targetLength; i++) {
    const originalIndex = Math.floor((i / targetLength) * originalData.length)
    const baseAmplitude = originalData[originalIndex] || 0.1
    
    // Add some variation to make it look more realistic
    const variation = (Math.random() - 0.5) * 0.3
    const amplitude = Math.max(0.05, Math.min(1, baseAmplitude + variation))
    
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
  if (!waveformContainer.value || props.mini || isMobile.value) return
  
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
}

.dark .soundcloud-waveform {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.waveform-bar-bg {
  @apply rounded-sm;
  background: rgba(156, 163, 175, 0.4);
}

.dark .waveform-bar-bg {
  background: rgba(107, 114, 128, 0.4);
}

.waveform-bar-progress {
  @apply rounded-sm;
  background: linear-gradient(to top, #FF5500, #FF7733);
  box-shadow: 0 0 4px rgba(255, 85, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2);
}

.soundcloud-waveform:hover .waveform-bar-bg {
  background: rgba(156, 163, 175, 0.6);
}

.dark .soundcloud-waveform:hover .waveform-bar-bg {
  background: rgba(107, 114, 128, 0.6);
}
</style>