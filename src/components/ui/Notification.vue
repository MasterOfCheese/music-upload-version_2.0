<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup name="notification">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="glass-card p-4 max-w-sm animate-slide-up"
      >
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <CheckCircleIcon v-if="notification.type === 'success'" class="w-6 h-6 text-green-500" />
            <ExclamationTriangleIcon v-else-if="notification.type === 'warning'" class="w-6 h-6 text-yellow-500" />
            <XCircleIcon v-else class="w-6 h-6 text-red-500" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-dark-900">{{ notification.title }}</p>
            <p class="text-xs text-gray-600 dark:text-dark-600">{{ notification.message }}</p>
          </div>
          <Button variant="icon" @click="$emit('remove', notification.id)">
            <XMarkIcon class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import Button from './Button.vue'
import type { Notification } from '../../types/Track'

interface Props {
  notifications: Notification[]
}

interface Emits {
  (e: 'remove', id: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>