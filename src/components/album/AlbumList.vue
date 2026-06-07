<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    <div
      v-for="album in albums"
      :key="album.id"
      class="card group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
      @click="$emit('view-album', album.id)"
    >
      <!-- Cover -->
      <div class="relative aspect-square bg-gradient-to-br from-soundcloud-orange/20 to-orange-100 dark:from-soundcloud-orange/10 dark:to-dark-200 rounded-xl overflow-hidden mb-4">
        <img v-if="album.coverUrl" :src="album.coverUrl" class="w-full h-full object-cover" :alt="album.title" />
        <div v-else class="absolute inset-0 flex items-center justify-center">
          <div class="flex flex-col items-center gap-2">
            <MusicalNoteIcon class="w-12 h-12 text-soundcloud-orange/40" />
            <div class="flex items-end gap-[2px] h-6">
              <div v-for="i in 8" :key="i" class="w-1 rounded-full bg-soundcloud-orange/30" :style="{ height: (Math.random() * 70 + 20) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <PlayIcon class="w-12 h-12 text-white" />
        </div>

        <!-- Track count badge -->
        <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {{ album.trackCount }} bài
        </div>
      </div>

      <!-- Info -->
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-dark-900 text-sm leading-tight line-clamp-2 mb-1">{{ album.title }}</h3>
        <p v-if="album.description" class="text-xs text-gray-500 dark:text-dark-500 line-clamp-1 mb-2">{{ album.description }}</p>
        <p class="text-xs text-gray-400 dark:text-dark-400">
          {{ album.username || 'Người dùng' }} &middot; {{ formatDate(album.createdAt) }}
        </p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="albums.length === 0 && !loading" class="col-span-full text-center py-12">
      <MusicalNoteIcon class="w-12 h-12 text-gray-300 dark:text-dark-300 mx-auto mb-3" />
      <p class="text-gray-500 dark:text-dark-500">Chưa có album nào</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MusicalNoteIcon, PlayIcon } from '@heroicons/vue/24/solid'
import type { Album } from '../../types/Track'

defineProps<{
  albums: Album[]
  loading?: boolean
}>()

defineEmits<{
  (e: 'view-album', albumId: string): void
}>()

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' })
}
</script>
