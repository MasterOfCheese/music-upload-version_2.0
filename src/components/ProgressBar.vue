<template>
  <div 
    ref="progressContainer"
    class="relative h-2 bg-gray-200 dark:bg-dark-300 rounded-full cursor-pointer group"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @mouseleave="showHover = false"
  >
    <!-- Progress Fill -->
    <div
      class="absolute top-0 left-0 h-full bg-gradient-to-r from-soundcloud-orange to-soundcloud-orange-light rounded-full transition-all duration-100"
      :style="{ width: `${progressPercentage}%` }"
    />
    
    <!-- Hover Indicator -->
    <div
      v-if="showHover"
      class="absolute top-0 h-full w-0.5 bg-soundcloud-orange-light"
      :style="{ left: `${hoverPosition}%` }"
    />
    
    <!-- Progress Handle -->
    <div
      class="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-soundcloud-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
      :style="{ left: `calc(${progressPercentage}% - 6px)` }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  currentTime: number
  duration: number
}

interface Emits {
  (e: 'seek', time: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const progressContainer = ref<HTMLElement>()
const showHover = ref(false)
const hoverPosition = ref(0)

const progressPercentage = computed(() => {
  if (!props.duration || props.duration === 0) return 0
  return (props.currentTime / props.duration) * 100
})

const handleClick = (event: MouseEvent) => {
  if (!progressContainer.value) return
  
  const rect = progressContainer.value.getBoundingClientRect()
  const percentage = (event.clientX - rect.left) / rect.width
  const time = percentage * props.duration
  emit('seek', Math.max(0, Math.min(props.duration, time)))
}

const handleMouseMove = (event: MouseEvent) => {
  if (!progressContainer.value) return
  
  const rect = progressContainer.value.getBoundingClientRect()
  hoverPosition.value = ((event.clientX - rect.left) / rect.width) * 100
  showHover.value = true
}
</script>