<template>
  <div v-if="album" class="animate-fade-in">
    <!-- Header -->
    <div class="card p-4 sm:p-6 mb-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <!-- Cover -->
        <div class="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-soundcloud-orange/20 to-orange-100 dark:from-soundcloud-orange/10 dark:to-dark-200 shadow-lg">
          <img v-if="album.cover_url" :src="album.cover_url" class="w-full h-full object-cover" :alt="album.title" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <MusicalNoteIcon class="w-16 h-16 text-soundcloud-orange/40" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-400 dark:text-dark-400 uppercase tracking-wider mb-1">Album</p>
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-900 mb-2 truncate">{{ album.title }}</h2>
          <p v-if="album.description" class="text-sm text-gray-600 dark:text-dark-600 mb-3 max-w-lg">{{ album.description }}</p>
          <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-dark-500">
            <span class="font-medium text-gray-700 dark:text-dark-700">{{ album.username || 'Người dùng' }}</span>
            <span>&middot;</span>
            <span>{{ albumTracks.length }} bài hát</span>
            <span>&middot;</span>
            <span>{{ formatDate(album.created_at) }}</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 mt-4">
            <button
              @click="playAll"
              class="btn btn-primary text-sm px-4 py-2 flex items-center gap-2"
            >
              <PlayIcon class="w-4 h-4" />
              Phát tất cả
            </button>
            <button
              v-if="isOwnAlbum"
              @click="showAddTrackModal = true"
              class="btn btn-secondary text-sm px-4 py-2 flex items-center gap-2"
            >
              <PlusIcon class="w-4 h-4" />
              Thêm bài hát
            </button>
            <button
              v-if="isOwnAlbum"
              @click="showEditModal = true"
              class="btn btn-ghost text-sm px-3 py-2"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
            <button
              v-if="isOwnAlbum"
              @click="handleDeleteAlbum"
              class="btn btn-ghost text-sm px-3 py-2 text-red-500 hover:text-red-600"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Track list -->
    <div class="space-y-2">
      <div
        v-for="(item, index) in albumTracks"
        :key="item.track_id"
        class="card flex items-center gap-3 p-3 group hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
      >
        <!-- Position number -->
        <span class="w-8 text-center text-sm text-gray-400 dark:text-dark-400 flex-shrink-0">{{ index + 1 }}</span>

        <!-- Track info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-dark-900 truncate">{{ item.tracks?.title || 'Unknown' }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-500 truncate">{{ item.tracks?.artist || 'Unknown' }}</p>
        </div>

        <!-- Favorite count -->
        <div class="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-400">
          <HeartIcon class="w-3.5 h-3.5" />
          <span>{{ item.tracks?.favorite_count || 0 }}</span>
        </div>

        <!-- Play count -->
        <div class="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-400">
          <span>{{ item.tracks?.play_count || 0 }} lượt nghe</span>
        </div>

        <!-- Play button -->
        <button
          @click="$emit('play-track', item.track_id)"
          class="btn-icon w-8 h-8 text-gray-400 hover:text-soundcloud-orange"
        >
          <PlayIcon class="w-4 h-4" />
        </button>

        <!-- Remove from album (owner only) -->
        <button
          v-if="isOwnAlbum"
          @click="$emit('remove-track', album.id, item.track_id)"
          class="btn-icon w-8 h-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <div v-if="albumTracks.length === 0" class="text-center py-12">
        <MusicalNoteIcon class="w-10 h-10 text-gray-300 dark:text-dark-300 mx-auto mb-3" />
        <p class="text-sm text-gray-500 dark:text-dark-500">Album trống. Thêm bài hát vào album!</p>
      </div>
    </div>

    <!-- Add Track Modal -->
    <Teleport to="body">
      <div v-if="showAddTrackModal"
           class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
           @click.self="showAddTrackModal = false">
        <div class="glass-card max-w-lg w-full p-6 animate-scale-in max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold gradient-text">Thêm bài hát vào album</h3>
            <button @click="showAddTrackModal = false" class="btn-icon text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Search -->
          <input
            v-model="trackSearch"
            type="text"
            placeholder="Tìm bài hát..."
            class="input-field mb-4 text-sm"
          />

          <!-- Available tracks -->
          <div class="space-y-2">
            <div
              v-for="track in availableTracks"
              :key="track.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-dark-900 truncate">{{ track.title }}</p>
                <p class="text-xs text-gray-500 dark:text-dark-500 truncate">{{ track.artist }}</p>
              </div>
              <button
                @click="$emit('add-track', album.id, track.id); showAddTrackModal = false"
                class="btn-icon w-8 h-8 text-soundcloud-orange hover:bg-soundcloud-orange/10"
              >
                <PlusIcon class="w-4 h-4" />
              </button>
            </div>
            <div v-if="availableTracks.length === 0" class="text-center py-6 text-sm text-gray-500">
              Không tìm thấy bài hát nào
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Album Modal -->
    <Teleport to="body">
      <div v-if="showEditModal"
           class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
           @click.self="showEditModal = false">
        <div class="glass-card max-w-md w-full p-6 animate-scale-in">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold gradient-text">Chỉnh sửa album</h3>
            <button @click="showEditModal = false" class="btn-icon text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleSaveEdit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-dark-700 mb-1">Tên album</label>
              <input v-model="editForm.title" type="text" required class="input-field" placeholder="Tên album" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-dark-700 mb-1">Mô tả</label>
              <textarea v-model="editForm.description" class="input-field resize-none" rows="3" placeholder="Mô tả album..." maxlength="300"></textarea>
            </div>
            <div class="flex gap-3">
              <button type="button" @click="showEditModal = false" class="flex-1 btn btn-secondary">Hủy</button>
              <button type="submit" :disabled="editSaving" class="flex-1 btn btn-primary disabled:opacity-50">
                {{ editSaving ? 'Đang lưu...' : 'Lưu' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- Loading -->
  <div v-else-if="loading" class="flex items-center justify-center py-16">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-soundcloud-orange"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
  MusicalNoteIcon, PlayIcon, PlusIcon, PencilSquareIcon,
  TrashIcon, XMarkIcon, HeartIcon
} from '@heroicons/vue/24/outline'
import { useAuth } from '../../composables/useAuth'
import type { Track } from '../../types/Track'

const props = defineProps<{
  album: any
  albumTracks: any[]
  allTracks: Track[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'play-track', trackId: string): void
  (e: 'play-all', trackIds: string[]): void
  (e: 'add-track', albumId: string, trackId: string): void
  (e: 'remove-track', albumId: string, trackId: string): void
  (e: 'delete-album', albumId: string): void
  (e: 'edit-album', albumId: string, updates: { title?: string; description?: string }): void
}>()

const { user } = useAuth()
const showAddTrackModal = ref(false)
const showEditModal = ref(false)
const trackSearch = ref('')
const editSaving = ref(false)
const editForm = reactive({ title: '', description: '' })

const isOwnAlbum = computed(() => props.album?.user_id === user.value?.id)

const availableTracks = computed(() => {
  const albumTrackIds = new Set(props.albumTracks.map(at => at.track_id))
  let tracks = props.allTracks.filter(t => !albumTrackIds.has(t.id))
  if (trackSearch.value) {
    const q = trackSearch.value.toLowerCase()
    tracks = tracks.filter(t =>
      t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    )
  }
  return tracks
})

const playAll = () => {
  const trackIds = props.albumTracks.map(at => at.track_id)
  if (trackIds.length > 0) {
    emit('play-all', trackIds)
  }
}

const handleDeleteAlbum = () => {
  if (confirm('Bạn có chắc muốn xóa album này?')) {
    emit('delete-album', props.album.id)
  }
}

const handleSaveEdit = () => {
  emit('edit-album', props.album.id, {
    title: editForm.title.trim(),
    description: editForm.description.trim()
  })
  showEditModal.value = false
}

watch(() => props.album, (a) => {
  if (a) {
    editForm.title = a.title || ''
    editForm.description = a.description || ''
  }
}, { immediate: true })

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
