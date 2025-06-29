<template>
  <div class="flex items-center space-x-2">
    <SpeakerWaveIcon class="w-5 h-5 text-gray-500 dark:text-dark-500" />
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="volume"
      @input="onVolumeChange"
      class="volume-slider w-20"
    />
  </div>
</template>

<script setup lang="ts">
import { SpeakerWaveIcon } from '@heroicons/vue/24/solid'

interface Props {
  volume: number
}

interface Emits {
  (e: 'volume-change', volume: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const onVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('volume-change', parseFloat(target.value))
}
</script>