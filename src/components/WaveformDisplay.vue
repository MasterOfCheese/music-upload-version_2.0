<template>
  <div 
    ref="waveformContainer"
    :class="[
      'relative bg-gray-100 rounded-md overflow-hidden cursor-pointer transition-all duration-200',
      mini ? 'h-8' : 'h-16 sm:h-20',
      'px-1 py-1'
    ]"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- Waveform bars -->
    <div class="flex items-end justify-center h-full gap-px">
      <div
        v-for="(bar, index) in waveformData"
        :key="index"
        :class="[
          'transition-all duration-75',
          index <= progressIndex ? 'bg-orange-500' : 'bg-gray-300'
        ]"
        :style="{
          height: `${bar}%`,
          width: mini ? '1px' : '2px',
          minHeight: mini ? '2px' : '4px'
        }"
      />
    </div>

    <!-- Progress overlay -->
    <div
      v-if="progress > 0"
      class="absolute top-0 left-0 h-full bg-orange-500 bg-opacity-20 pointer-events-none transition-all duration-100"
      :style="{ width: `${progress * 100}%` }"
    />

    <!-- Hover indicator -->
    <div
      v-if="hoverPosition !== null"
      class="absolute top-0 w-0.5 h-full bg-orange-600 pointer-events-none opacity-75"
      :style="{ left: `${hoverPosition}%` }"
    />

    <!-- Time display on hover -->
    <div
      v-if="hoverTime !== null"
      class="absolute -top-8 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none z-10"
      :style="{ left: `${hoverPosition}%`, transform: 'translateX(-50%)' }"
    >
      {{ formatTime(hoverTime) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  progress?: number
  duration?: number
  mini?: boolean
  waveformData?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  duration: 0,
  mini: false,
  waveformData: () => []
})

const emit = defineEmits<{
  seek: [position: number]
}>()

const waveformContainer = ref<HTMLElement>()
const hoverPosition = ref<number | null>(null)
const hoverTime = ref<number | null>(null)

// Generate waveform data if not provided
const waveformData = computed(() => {
  if (props.waveformData.length > 0) {
    return props.waveformData
  }
  
  // Generate random waveform data
  const barCount = props.mini ? 200 : 400
  return Array.from({ length: barCount }, () => {
    const base = Math.random() * 0.95 + 0.05 // 5% to 100%
    const variation = Math.random() * 0.3 - 0.15 // ±15% variation
    return Math.max(5, Math.min(100, (base + variation) * 100))
  })
})

// Calculate which bar should be highlighted based on progress
const progressIndex = computed(() => {
  return Math.floor(props.progress * waveformData.value.length)
})

const handleClick = (event: MouseEvent) => {
  if (!waveformContainer.value) return
  
  const rect = waveformContainer.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const position = clickX / rect.width
  
  emit('seek', Math.max(0, Math.min(1, position)))
}

const handleMouseMove = (event: MouseEvent) => {
  if (!waveformContainer.value) return
  
  const rect = waveformContainer.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const position = (mouseX / rect.width) * 100
  
  hoverPosition.value = Math.max(0, Math.min(100, position))
  hoverTime.value = (hoverPosition.value / 100) * props.duration
}

const handleMouseLeave = () => {
  hoverPosition.value = null
  hoverTime.value = null
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>