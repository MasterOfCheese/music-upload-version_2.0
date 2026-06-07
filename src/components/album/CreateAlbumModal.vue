<template>
  <Teleport to="body">
    <div v-if="visible"
         class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
         @click.self="$emit('close')">
      <div class="glass-card max-w-md w-full p-6 animate-scale-in">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold gradient-text">Tạo album mới</h3>
          <button @click="$emit('close')" class="btn-icon text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-dark-700 mb-1.5">Tên album *</label>
            <input
              v-model="form.title"
              type="text"
              required
              maxlength="100"
              class="input-field"
              placeholder="Nhập tên album..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-dark-700 mb-1.5">Mô tả</label>
            <textarea
              v-model="form.description"
              class="input-field resize-none"
              rows="3"
              placeholder="Mô tả về album..."
              maxlength="300"
            ></textarea>
            <p class="text-xs text-gray-400 mt-1">{{ form.description.length }}/300</p>
          </div>

          <!-- Add existing tracks -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-dark-700 mb-1.5">Thêm bài hát</label>
            <div class="max-h-40 overflow-y-auto border border-gray-200 dark:border-dark-300 rounded-lg divide-y divide-gray-100 dark:divide-dark-200">
              <div
                v-for="track in allTracks"
                :key="track.id"
                class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-200 cursor-pointer transition-colors"
                @click="toggleTrack(track.id)"
              >
                <div
                  class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  :class="selectedTrackIds.includes(track.id)
                    ? 'bg-soundcloud-orange border-soundcloud-orange'
                    : 'border-gray-300 dark:border-dark-400'"
                >
                  <CheckIcon v-if="selectedTrackIds.includes(track.id)" class="w-3 h-3 text-white" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium text-gray-900 dark:text-dark-900 truncate">{{ track.title }}</p>
                  <p class="text-xs text-gray-400 dark:text-dark-400 truncate">{{ track.artist }}</p>
                </div>
              </div>
              <div v-if="allTracks.length === 0" class="px-3 py-4 text-center text-xs text-gray-400">
                Chưa có bài hát nào
              </div>
            </div>
            <p v-if="selectedTrackIds.length > 0" class="text-xs text-soundcloud-orange mt-1">
              Đã chọn {{ selectedTrackIds.length }} bài hát
            </p>
          </div>

          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="flex-1 btn btn-secondary">Hủy</button>
            <button type="submit" :disabled="!form.title.trim() || isSubmitting" class="flex-1 btn btn-primary disabled:opacity-50">
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Đang tạo...
              </span>
              <span v-else>Tạo album</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'
import type { Track } from '../../types/Track'

defineProps<{
  visible: boolean
  allTracks: Track[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', title: string, description: string, trackIds: string[]): void
}>()

const form = reactive({ title: '', description: '' })
const selectedTrackIds = ref<string[]>([])
const isSubmitting = ref(false)
const error = ref('')

const toggleTrack = (trackId: string) => {
  const idx = selectedTrackIds.value.indexOf(trackId)
  if (idx === -1) {
    selectedTrackIds.value.push(trackId)
  } else {
    selectedTrackIds.value.splice(idx, 1)
  }
}

const handleSubmit = async () => {
  if (!form.title.trim()) return
  error.value = ''
  isSubmitting.value = true

  try {
    emit('create', form.title.trim(), form.description.trim(), [...selectedTrackIds.value])
    form.title = ''
    form.description = ''
    selectedTrackIds.value = []
  } catch (e: any) {
    error.value = e.message || 'Lỗi khi tạo album'
  } finally {
    isSubmitting.value = false
  }
}
</script>
