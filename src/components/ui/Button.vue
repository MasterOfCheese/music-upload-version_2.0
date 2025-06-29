<template>
  <button
    :class="[
      'btn',
      variantClasses[variant],
      sizeClasses[size],
      {
        'opacity-50 cursor-not-allowed': disabled,
        'transform hover:scale-105 active:scale-95': !disabled && variant !== 'icon'
      }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

const emit = defineEmits<Emits>()

const variantClasses = {
  primary: 'bg-gradient-to-r from-soundcloud-orange to-soundcloud-orange-light text-white hover:shadow-glow focus:ring-soundcloud-orange',
  secondary: 'bg-white dark:bg-dark-100 text-gray-700 dark:text-dark-700 border border-gray-300 dark:border-dark-300 hover:bg-gray-50 dark:hover:bg-dark-200 focus:ring-blue-500',
  ghost: 'bg-transparent text-gray-600 dark:text-dark-600 hover:bg-gray-100 dark:hover:bg-dark-200 focus:ring-gray-500',
  icon: 'flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-dark-200 transform hover:scale-110'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
}
</script>