<template>
  <div class="waveform-container" :class="{ 'mobile': isMobile }">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      class="waveform-canvas"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { usePerformanceOptimization } from '@/composables/usePerformanceOptimization'

interface Props {
  waveformData: number[]
  currentTime: number
  duration: number
  isPlaying: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  seek: [time: number]
}>()

const canvasRef = ref<HTMLCanvasElement>()
const { isMobile, isLowPowerMode } = usePerformanceOptimization()

// Responsive canvas dimensions
const canvasWidth = computed(() => isMobile.value ? 300 : 600)
const canvasHeight = computed(() => isMobile.value ? 60 : 80)

// Optimized bar count based on device capabilities
const barCount = computed(() => {
  if (isLowPowerMode.value) return 50
  if (isMobile.value) return 100
  return 200
})

const drawWaveform = () => {
  const canvas = canvasRef.value
  if (!canvas || !props.waveformData.length) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const barWidth = canvas.width / barCount.value
  const centerY = canvas.height / 2

  // Sample waveform data to match bar count
  const sampledData = sampleWaveformData(props.waveformData, barCount.value)
  
  // Calculate progress
  const progress = props.duration > 0 ? props.currentTime / props.duration : 0

  sampledData.forEach((amplitude, index) => {
    const x = index * barWidth
    const barHeight = Math.max(2, amplitude * canvas.height * 0.8)
    const y = centerY - barHeight / 2

    // Color based on progress
    const isPlayed = index / barCount.value <= progress
    ctx.fillStyle = isPlayed ? '#3b82f6' : '#e5e7eb'
    
    // Draw bar
    ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight)
  })

  // Draw progress indicator if playing
  if (props.isPlaying && progress > 0) {
    const progressX = progress * canvas.width
    ctx.strokeStyle = '#1d4ed8'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(progressX, 0)
    ctx.lineTo(progressX, canvas.height)
    ctx.stroke()
  }
}

const sampleWaveformData = (data: number[], targetLength: number): number[] => {
  if (data.length <= targetLength) return data
  
  const step = data.length / targetLength
  const sampled: number[] = []
  
  for (let i = 0; i < targetLength; i++) {
    const start = Math.floor(i * step)
    const end = Math.floor((i + 1) * step)
    
    // Take the maximum value in the range for better visual representation
    let max = 0
    for (let j = start; j < end && j < data.length; j++) {
      max = Math.max(max, data[j])
    }
    sampled.push(max)
  }
  
  return sampled
}

const handleClick = (event: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas || props.duration <= 0) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const progress = x / canvas.width
  const seekTime = progress * props.duration

  emit('seek', Math.max(0, Math.min(seekTime, props.duration)))
}

// Watch for changes and redraw
watch([
  () => props.waveformData,
  () => props.currentTime,
  () => props.isPlaying,
  canvasWidth,
  canvasHeight,
  barCount
], drawWaveform, { deep: true })

onMounted(() => {
  drawWaveform()
})
</script>

<style scoped>
.waveform-container {
  @apply w-full flex justify-center items-center;
}

.waveform-container.mobile {
  @apply px-2;
}

.waveform-canvas {
  @apply cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800;
  transition: background-color 0.2s ease;
}

.waveform-canvas:hover {
  @apply bg-gray-100 dark:bg-gray-700;
}
</style>