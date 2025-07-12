<template>
  <div 
    ref="waveformContainer"
    class="soundcloud-waveform cursor-pointer relative"
    :class="mini ? 'h-12' : 'h-24'"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @mouseleave="showHover = false"
  >
    <!-- Background bars (unplayed) -->
    <div class="flex items-end justify-start h-full w-full px-2 py-2">
      <div
        v-for="(amplitude, index) in detailedWaveformData"
        :key="`bg-${index}`"
        class="waveform-bar-bg flex-shrink-0"
        :style="{ 
          height: `${Math.max(amplitude * 85, 8)}%`,
          width: '1px',
          marginRight: '1px'
        }"
      />
    </div>
    
    <!-- Progress overlay (played portion) -->
    <div
      v-if="isCurrent && progress > 0"
      class="absolute top-0 left-0 h-full overflow-hidden"
      :style="{ width: `${Math.min(progress, 100)}%` }"
    >
      <div class="flex items-end justify-start h-full px-2 py-2">
        <div
          v-for="(amplitude, index) in detailedWaveformData"
          :key="`progress-${index}`"
          class="waveform-bar-progress flex-shrink-0"
          :style="{ 
            height: `${Math.max(amplitude * 85, 8)}%`,
            width: '1px',
            marginRight: '1px'
          }"
        />
      </div>
    </div>
    
    <!-- Hover indicator -->
    <div
      v-if="showHover && !mini"
      class="absolute top-0 h-full w-0.5 bg-gray-600 pointer-events-none"
      :style="{ left: `${hoverPosition}%` }"
    />
    
    <!-- Current time indicator -->
    <div
      v-if="isCurrent && isPlaying"
      class="absolute top-0 h-full w-0.5 bg-soundcloud-orange pointer-events-none"
      :style="{ left: `${progress}%` }"
    />
    
    <!-- Time display overlay -->
    <div v-if="!mini" class="absolute bottom-1 right-3 text-xs text-gray-500 font-mono">
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

// Generate detailed waveform data like SoundCloud
const detailedWaveformData = computed(() => {
  const originalData = props.waveformData
  // Nhiều thanh hơn để giống SoundCloud
  const targetLength = props.mini ? 200 : 500
  const detailedData: number[] = []
  
  for (let i = 0; i < targetLength; i++) {
    const originalIndex = Math.floor((i / targetLength) * originalData.length)
    const baseAmplitude = originalData[originalIndex] || 0.1
    
    // Tạo variation tự nhiên
    const variation = (Math.random() - 0.5) * 0.2
    const amplitude = Math.max(0.1, Math.min(1, baseAmplitude + variation))
    
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
.soundcloud-waveform {
  @apply relative rounded-lg overflow-hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.dark .soundcloud-waveform {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.waveform-bar-bg {
  background: #e5e7eb;
  border-radius: 0.5px;
}

.dark .waveform-bar-bg {
  background: #6b7280;
}

.waveform-bar-progress {
  background: #ff5500;
  border-radius: 0.5px;
}

.soundcloud-waveform:hover .waveform-bar-bg {
  background: #d1d5db;
}

.dark .soundcloud-waveform:hover .waveform-bar-bg {
  background: #9ca3af;
}
</style>