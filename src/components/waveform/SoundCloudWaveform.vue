<template>
  <div 
    ref="waveformContainer"
    class="soundcloud-waveform cursor-pointer"
    :class="mini ? 'h-8' : 'h-16'"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @mouseleave="showHover = false"
  >
    <!-- Background bars (unplayed) -->
    <div class="flex items-end justify-start h-full space-x-0.5 py-1">
      <div
        v-for="(amplitude, index) in waveformData"
        :key="`bg-${index}`"
        class="waveform-bar-bg flex-shrink-0 transition-all duration-100"
        :style="{ 
          height: `${Math.max(amplitude * 85, mini ? 8 : 12)}%`,
          minHeight: mini ? '2px' : '3px',
          width: mini ? '2px' : '3px'
        }"
      />
    </div>
    
    <!-- Progress overlay (played portion) -->
    <div
      v-if="isCurrent && progress > 0"
      class="absolute top-0 left-0 h-full overflow-hidden"
      :style="{ width: `${progress}%` }"
    >
      <div class="flex items-end justify-start h-full space-x-0.5 py-1">
        <div
          v-for="(amplitude, index) in waveformData"
          :key="`progress-${index}`"
          class="waveform-bar-progress flex-shrink-0 transition-all duration-100"
          :style="{ 
            height: `${Math.max(amplitude * 85, mini ? 8 : 12)}%`,
            minHeight: mini ? '2px' : '3px',
            width: mini ? '2px' : '3px'
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

<style scoped>
.soundcloud-waveform {
  @apply relative bg-gradient-to-r from-gray-200 to-gray-300 dark:from-dark-300 dark:to-dark-400 rounded-lg overflow-hidden;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.dark .soundcloud-waveform {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
}

.waveform-bar-bg {
  @apply bg-gray-400/60 dark:bg-dark-500/60 rounded-sm;
  background: rgba(156, 163, 175, 0.6);
}

.dark .waveform-bar-bg {
  background: rgba(107, 114, 128, 0.6);
}

.waveform-bar-progress {
  @apply bg-gradient-to-t from-soundcloud-orange to-soundcloud-orange-light rounded-sm;
  background: linear-gradient(to top, #FF5500, #FF7733);
  box-shadow: 0 0 4px rgba(255, 85, 0, 0.3);
}

.waveform-bar-progress:hover {
  filter: brightness(1.1);
}
</style>