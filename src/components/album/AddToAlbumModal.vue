<template>
  <Teleport to="body">
    <div v-if="visible"
         class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
         @click.self="$emit('close')">
      <div class="glass-card max-w-sm w-full p-6 animate-scale-in">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-semibold gradient-text">Thêm vào album</h3>
          <button @click="$emit('close')" class="btn-icon text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <p class="text-sm text-gray-500 dark:text-dark-500 mb-4">Chọn album để thêm bài hát:</p>

        <div v-if="userAlbums.length === 0" class="text-center py-6">
          <MusicalNoteIcon class="w-10 h-10 text-gray-300 dark:text-dark-300 mx-auto mb-2" />
          <p class="text-sm text-gray-500 dark:text-dark-500 mb-3">Bạn chưa có album nào</p>
          <button @click="$emit('create-album')" class="btn btn-primary text-sm px-4 py-2">
            Tạo album mới
          </button>
        </div>

        <div v-else class="space-y-2 max-h-60 overflow-y-auto">
          <button
            v-for="album in userAlbums"
            :key="album.id"
            @click="$emit('add-to-album', album.id, trackId)"
            class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors text-left"
          >
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-soundcloud-orange/20 to-orange-100 dark:from-soundcloud-orange/10 dark:to-dark-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img v-if="album.coverUrl" :src="album.coverUrl" class="w-full h-full object-cover" />
              <MusicalNoteIcon v-else class="w-5 h-5 text-soundcloud-orange/50" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-dark-900 truncate">{{ album.title }}</p>
              <p class="text-xs text-gray-400 dark:text-dark-400">{{ album.trackCount }} bài hát</p>
            </div>
            <PlusIcon class="w-5 h-5 text-soundcloud-orange flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon, MusicalNoteIcon, PlusIcon } from '@heroicons/vue/24/outline'
import type { Album } from '../../types/Track'

defineProps<{
  visible: boolean
  trackId: string
  userAlbums: Album[]
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'add-to-album', albumId: string, trackId: string): void
  (e: 'create-album'): void
}>()
</script>
