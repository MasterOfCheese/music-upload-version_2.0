<template>
  <div class="min-h-screen transition-colors duration-300" :class="{ 'dark': isDarkMode }">
    <!-- Header -->
    <header class="sticky top-0 z-50 glass-card border-b border-white/20 dark:border-dark-200/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light rounded-xl flex items-center justify-center shadow-glow">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h1 class="text-xl font-bold gradient-text hidden sm:block">NamSound</h1>
            </div>
          </div>
          
          <!-- Search Bar -->
          <div class="flex-1 max-w-md mx-4 sm:mx-8">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm bài hát, nghệ sĩ..."
                class="search-input"
                @focus="showSearchSuggestions = true"
                @blur="hideSearchSuggestions"
              />
              
              <!-- Search Suggestions -->
              <div v-if="showSearchSuggestions && searchSuggestions.length" 
                   class="absolute top-full left-0 right-0 mt-2 glass-card border border-white/20 dark:border-dark-200/20 max-h-60 overflow-y-auto z-10">
                <div v-for="suggestion in searchSuggestions" :key="suggestion"
                     class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-200 cursor-pointer transition-colors"
                     @click="searchQuery = suggestion">
                  {{ suggestion }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center space-x-2 sm:space-x-4">
            <!-- Debug Button (only show if Supabase connected) -->
            <div v-if="isSupabaseConnected" class="hidden lg:flex items-center space-x-2">
              <Button variant="ghost" size="sm" @click="debugCurrentTrack">
                Debug
              </Button>
            </div>
            
            <!-- Supabase Status -->
            <div class="hidden sm:flex items-center space-x-2 text-xs">
              <div class="w-2 h-2 rounded-full" :class="isSupabaseConnected ? 'bg-green-500' : 'bg-yellow-500'"></div>
              <span class="text-gray-700 dark:text-dark-700 font-medium">
                {{ isSupabaseConnected ? 'Supabase' : 'Local' }}
              </span>
            </div>
            
            <!-- Theme Toggle -->
            <Button variant="icon" @click="toggleTheme" title="Chuyển đổi theme">
              <SunIcon v-if="isDarkMode" class="w-5 h-5" />
              <MoonIcon v-else class="w-5 h-5" />
            </Button>
            
            <!-- Upload Button -->
            <Button @click="toggleUploadModal">
              <span class="hidden sm:inline">Upload</span>
              <span class="sm:hidden">Upload</span>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" :class="currentTrack ? 'pb-40 lg:pb-28' : 'pb-8'">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-soundcloud-orange"></div>
        <span class="ml-3 text-gray-700 dark:text-dark-700 font-medium">Đang tải dữ liệu...</span>
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="card text-center">
          <div class="text-2xl font-bold gradient-text">{{ tracks.length }}</div>
          <div class="text-sm text-gray-600 dark:text-dark-600 font-medium">Tổng số bài</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold gradient-text">{{ totalUsers }}</div>
          <div class="text-sm text-gray-600 dark:text-dark-600 font-medium">Tổng số User</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold gradient-text">{{ favoriteTracks.length }}</div>
          <div class="text-sm text-gray-600 dark:text-dark-600 font-medium">Yêu thích</div>
        </div>
        <div class="card text-center">
          <div class="text-lg font-bold gradient-text truncate">{{ trendingTrack || 'Chưa có' }}</div>
          <div class="text-sm text-gray-600 dark:text-dark-600 font-medium">Bài hát trending</div>
        </div>
      </div>

      <!-- Controls -->
      <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="flex items-center space-x-4">
          <Button 
            variant="ghost"
            @click="toggleShuffle" 
            :class="{ 'text-soundcloud-orange': isShuffled }"
          >
            <ArrowsRightLeftIcon class="w-5 h-5 mr-2" />
            Shuffle
          </Button>
          
          <select v-model="sortBy" class="input-field">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title">Tên A-Z</option>
            <option value="artist">Nghệ sĩ A-Z</option>
            <option value="duration">Thời lượng</option>
            <option value="popular">Phổ biến nhất</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Test buttons for debugging -->
          <div v-if="isSupabaseConnected && currentTrack" class="hidden lg:flex items-center space-x-2 mr-4">
            <Button variant="ghost" size="sm" @click="simulateNewUser">
              +1 View
            </Button>
          </div>
          
          <Button
            variant="icon"
            @click="viewMode = 'grid'" 
            :class="{ 'text-soundcloud-orange': viewMode === 'grid' }"
          >
            <Squares2X2Icon class="w-5 h-5" />
          </Button>
          <Button
            variant="icon"
            @click="viewMode = 'list'" 
            :class="{ 'text-soundcloud-orange': viewMode === 'list' }"
          >
            <ListBulletIcon class="w-5 h-5" />
          </Button>
        </div>
      </div>

      <!-- Upload Modal -->
      <Modal
        :show="showUploadModal"
        title="Upload Bài Hát"
        @close="toggleUploadModal"
      >
        <UploadComponent @upload-success="handleUploadSuccess" />
      </Modal>

      <!-- Delete Confirmation Modal -->
      <Modal
        :show="showDeleteModal"
        title="Xác nhận xóa bài hát"
        :close-on-backdrop="false"
        @close="cancelDelete"
      >
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon class="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p class="text-white mb-4 font-medium">
            Bạn đang muốn xóa bài hát: <br>
            <span class="font-semibold text-soundcloud-orange">{{ trackToDelete?.title }}</span>
          </p>
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p class="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              <strong>Bảo mật:</strong> Để xóa bài hát này, bạn phải nhập Key-check là ngày tháng năm sinh của Phương Nam
            </p>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Nhập Key-check (ddmmyyyy):
            </label>
            <input
              v-model="deleteKeyCheck"
              type="text"
              placeholder="Nhập ngày tháng năm sinh..."
              class="input-field text-white placeholder-white/70"
              :class="{ 'border-red-500 focus:ring-red-500': deleteKeyError }"
              @keyup.enter="confirmDelete"
              @input="deleteKeyError = false"
            />
            <p v-if="deleteKeyError" class="text-red-400 text-sm mt-1 font-medium">
              Key-check không đúng! Vui lòng thử lại.
            </p>
          </div>
          
          <div class="flex space-x-3">
            <Button
              variant="secondary"
              @click="cancelDelete"
              :disabled="isDeleting"
              class="flex-1"
            >
              Hủy
            </Button>
            <Button
              @click="confirmDelete"
              :disabled="!deleteKeyCheck || isDeleting"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isDeleting ? 'Đang xóa...' : 'Xóa bài hát' }}
            </Button>
          </div>
        </div>
      </Modal>

      <!-- Track List/Grid -->
      <div v-if="!isLoading">
        <div v-if="filteredTracks.length === 0" class="text-center py-16">
          <div class="w-24 h-24 bg-gradient-to-br from-soundcloud-orange/20 to-soundcloud-orange-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MusicalNoteIcon class="w-12 h-12 text-soundcloud-orange" />
          </div>
          <h3 class="text-xl font-medium text-gray-600 dark:text-dark-600 mb-2">Chưa có bài hát nào</h3>
          <p class="text-gray-500 dark:text-dark-500 mb-6">Upload bài hát đầu tiên để bắt đầu!</p>
          <Button @click="toggleUploadModal">
            Upload Bài Hát
          </Button>
        </div>
        
        <div v-else>
          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" 
               class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <TrackCard
              v-for="track in displayedTracks"
              :key="track.id"
              :track="track"
              :is-playing="currentTrack?.id === track.id && isPlaying"
              :is-current="currentTrack?.id === track.id"
              :is-favorite="favoriteTracks.includes(track.id)"
              :current-time="currentTime"
              :duration="duration"
              @play="playTrack"
              @pause="pauseTrack"
              @delete="showDeleteConfirmation"
              @toggle-favorite="toggleFavorite"
              @share="shareTrack"
              @seek="seekTo"
            />
          </div>
          
          <!-- List View -->
          <div v-else class="space-y-4">
            <TrackItem
              v-for="track in displayedTracks"
              :key="track.id"
              :track="track"
              :is-playing="currentTrack?.id === track.id && isPlaying"
              :is-current="currentTrack?.id === track.id"
              :is-favorite="favoriteTracks.includes(track.id)"
              :current-time="currentTime"
              :duration="duration"
              @play="playTrack"
              @pause="pauseTrack"
              @delete="showDeleteConfirmation"
              @seek="seekTo"
              @toggle-favorite="toggleFavorite"
              @share="shareTrack"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Enhanced Music Player -->
    <EnhancedMusicPlayer
      v-if="currentTrack"
      :track="currentTrack"
      :is-playing="isPlaying"
      :current-time="currentTime"
      :duration="duration"
      :volume="volume"
      :repeat-mode="repeatMode"
      :is-shuffled="isShuffled"
      :is-favorite="favoriteTracks.includes(currentTrack.id)"
      @play="playTrack"
      @pause="pauseTrack"
      @next="nextTrack"
      @previous="previousTrack"
      @seek="seekTo"
      @volume-change="setVolume"
      @toggle-repeat="toggleRepeatMode"
      @toggle-shuffle="toggleShuffle"
      @toggle-favorite="toggleFavorite"
      @share="shareTrack"
    />

    <!-- Toast Notifications -->
    <Notification
      :notifications="notifications"
      @remove="removeNotification"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  MagnifyingGlassIcon, 
  MusicalNoteIcon,
  SunIcon,
  MoonIcon,
  ArrowsRightLeftIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import TrackItem from './components/TrackItem.vue'
import TrackCard from './components/TrackCard.vue'
import EnhancedMusicPlayer from './components/EnhancedMusicPlayer.vue'
import UploadComponent from './components/UploadComponent.vue'
import Button from './components/ui/Button.vue'
import Modal from './components/ui/Modal.vue'
import Notification from './components/ui/Notification.vue'
import { useAudioPlayer } from './composables/useAudioPlayer'
import { useNotifications } from './composables/useNotifications'
import { usePlayTracking } from './composables/usePlayTracking'
import { 
  supabase, 
  getTracksFromDatabase, 
  deleteTrackFromDatabase, 
  deleteAudioFile, 
  getAudioFileUrl,
  getTotalUniqueUsers,
  debugTrackPlays,
  simulatePlayFromDifferentUser
} from './lib/supabase'
import type { Track } from './types/Track'

// Composables
const { 
  currentTrack, 
  isPlaying, 
  currentTime, 
  duration, 
  volume, 
  loadTrack, 
  play, 
  pause, 
  seekTo: audioSeekTo, 
  setVolume 
} = useAudioPlayer()

const { notifications, showNotification, removeNotification } = useNotifications()
const { initializeFingerprint, startPlayTracking, stopPlayTracking } = usePlayTracking()

// State
const tracks = ref<Track[]>([])
const repeatMode = ref<'off' | 'one' | 'all'>('off')
const isShuffled = ref(false)
const searchQuery = ref('')
const showUploadModal = ref(false)
const showSearchSuggestions = ref(false)
const isDarkMode = ref(false)
const viewMode = ref<'list' | 'grid'>('list')
const sortBy = ref('newest')
const favoriteTracks = ref<string[]>([])
const recentlyPlayed = ref<string[]>([])
const isLoading = ref(true)
const isSupabaseConnected = ref(false)
const totalUsers = ref(0)

// Delete confirmation modal state
const showDeleteModal = ref(false)
const trackToDelete = ref<Track | null>(null)
const deleteKeyCheck = ref('')
const deleteKeyError = ref(false)
const isDeleting = ref(false)

// Computed
const filteredTracks = computed(() => {
  let filtered = tracks.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(track => 
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query)
    )
  }
  
  // Sort tracks
  switch (sortBy.value) {
    case 'oldest':
      filtered = [...filtered].sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime())
      break
    case 'title':
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'artist':
      filtered = [...filtered].sort((a, b) => a.artist.localeCompare(b.artist))
      break
    case 'duration':
      filtered = [...filtered].sort((a, b) => a.duration - b.duration)
      break
    case 'popular':
      filtered = [...filtered].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      break
    default: // newest
      filtered = [...filtered].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
  }
  
  return filtered
})

const displayedTracks = computed(() => {
  return isShuffled.value ? shuffleArray([...filteredTracks.value]) : filteredTracks.value
})

const searchSuggestions = computed(() => {
  if (!searchQuery.value) return []
  
  const suggestions = new Set<string>()
  tracks.value.forEach(track => {
    if (track.title.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      suggestions.add(track.title)
    }
    if (track.artist.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      suggestions.add(track.artist)
    }
  })
  
  return Array.from(suggestions).slice(0, 5)
})

const trendingTrack = computed(() => {
  if (tracks.value.length === 0) return null
  
  const sortedByPlays = [...tracks.value].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
  const topTrack = sortedByPlays[0]
  
  return (topTrack?.playCount || 0) > 0 ? topTrack.title : null
})

// Methods
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('tracks').select('count').limit(1)
    isSupabaseConnected.value = !error
  } catch (error) {
    isSupabaseConnected.value = false
  }
}

const loadTracksFromSupabase = async () => {
  try {
    const dbTracks = await getTracksFromDatabase()
    const supabaseTracks: Track[] = []
    
    for (const dbTrack of dbTracks) {
      try {
        const url = await getAudioFileUrl(dbTrack.file_name)
        supabaseTracks.push({
          id: dbTrack.id,
          title: dbTrack.title,
          artist: dbTrack.artist,
          url,
          duration: dbTrack.duration,
          uploadedAt: new Date(dbTrack.uploaded_at),
          waveformData: dbTrack.waveform_data,
          fileName: dbTrack.file_name,
          fileSize: dbTrack.file_size,
          playCount: dbTrack.play_count || 0
        })
      } catch (error) {
        console.error(`Error loading track ${dbTrack.title}:`, error)
      }
    }
    
    return supabaseTracks
  } catch (error) {
    console.error('Error loading tracks from Supabase:', error)
    return []
  }
}

const loadTracksFromLocalStorage = (): Track[] => {
  try {
    const savedTracks = localStorage.getItem('tracks')
    if (savedTracks) {
      const parsed = JSON.parse(savedTracks)
      return parsed.map((track: any) => ({
        ...track,
        uploadedAt: new Date(track.uploadedAt),
        playCount: track.playCount || 0
      }))
    }
  } catch (error) {
    console.error('Error loading tracks from localStorage:', error)
  }
  return []
}

const saveTracksToLocalStorage = () => {
  try {
    const localTracks = tracks.value.filter(track => !track.fileName)
    localStorage.setItem('tracks', JSON.stringify(localTracks))
  } catch (error) {
    console.error('Error saving tracks to localStorage:', error)
  }
}

const loadTracks = async () => {
  isLoading.value = true
  
  try {
    await checkSupabaseConnection()
    
    let allTracks: Track[] = []
    
    if (isSupabaseConnected.value) {
      const supabaseTracks = await loadTracksFromSupabase()
      allTracks = [...allTracks, ...supabaseTracks]
      showNotification('success', 'Kết nối Supabase thành công', `Đã tải ${supabaseTracks.length} bài hát từ cloud`)
      
      totalUsers.value = await getTotalUniqueUsers()
    }
    
    const localTracks = loadTracksFromLocalStorage()
    allTracks = [...allTracks, ...localTracks]
    
    tracks.value = allTracks
    
  } catch (error) {
    console.error('Error loading tracks:', error)
    showNotification('error', 'Lỗi tải dữ liệu', 'Không thể tải danh sách bài hát')
  } finally {
    isLoading.value = false
  }
}

const playTrack = async (track?: Track) => {
  if (currentTrack.value && currentTrack.value.id !== track?.id) {
    const newPlayCount = await stopPlayTracking(currentTrack.value.id)
    if (newPlayCount !== null) {
      updateTrackPlayCount(currentTrack.value.id, newPlayCount)
    }
  }
  
  if (track) {
    if (currentTrack.value?.id !== track.id) {
      currentTrack.value = track
      loadTrack(track)
      addToRecentlyPlayed(track.id)
      startPlayTracking(track.id)
    }
  }
  
  play()
}

const pauseTrack = () => {
  pause()
}

const nextTrack = async () => {
  if (!currentTrack.value) return
  
  const newPlayCount = await stopPlayTracking(currentTrack.value.id)
  if (newPlayCount !== null) {
    updateTrackPlayCount(currentTrack.value.id, newPlayCount)
  }
  
  const currentList = displayedTracks.value
  const currentIndex = currentList.findIndex(t => t.id === currentTrack.value!.id)
  const nextIndex = currentIndex + 1
  
  if (nextIndex < currentList.length) {
    playTrack(currentList[nextIndex])
  } else if (repeatMode.value === 'all') {
    playTrack(currentList[0])
  }
}

const previousTrack = async () => {
  if (!currentTrack.value) return
  
  const newPlayCount = await stopPlayTracking(currentTrack.value.id)
  if (newPlayCount !== null) {
    updateTrackPlayCount(currentTrack.value.id, newPlayCount)
  }
  
  const currentList = displayedTracks.value
  const currentIndex = currentList.findIndex(t => t.id === currentTrack.value!.id)
  const prevIndex = currentIndex - 1
  
  if (prevIndex >= 0) {
    playTrack(currentList[prevIndex])
  } else if (repeatMode.value === 'all') {
    playTrack(currentList[currentList.length - 1])
  }
}

const seekTo = (time: number) => {
  audioSeekTo(time)
}

const toggleRepeatMode = () => {
  const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all']
  const currentIndex = modes.indexOf(repeatMode.value)
  repeatMode.value = modes[(currentIndex + 1) % modes.length]
}

const toggleShuffle = () => {
  isShuffled.value = !isShuffled.value
}

const toggleFavorite = (trackId: string) => {
  const index = favoriteTracks.value.indexOf(trackId)
  if (index > -1) {
    favoriteTracks.value.splice(index, 1)
    showNotification('success', 'Đã xóa khỏi yêu thích', '')
  } else {
    favoriteTracks.value.push(trackId)
    showNotification('success', 'Đã thêm vào yêu thích', '')
  }
  localStorage.setItem('favorites', JSON.stringify(favoriteTracks.value))
}

const shareTrack = (track: Track) => {
  if (navigator.share) {
    navigator.share({
      title: track.title,
      text: `Nghe "${track.title}" của ${track.artist}`,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(`${track.title} - ${track.artist} | ${window.location.href}`)
    showNotification('success', 'Đã sao chép link', 'Link bài hát đã được sao chép!')
  }
}

const updateTrackPlayCount = (trackId: string, newCount: number) => {
  const trackIndex = tracks.value.findIndex(t => t.id === trackId)
  if (trackIndex !== -1) {
    tracks.value[trackIndex].playCount = newCount
    tracks.value = [...tracks.value]
    showNotification('success', 'View đã được cộng!', `+1 view cho "${tracks.value[trackIndex].title}"`)
  }
}

const debugCurrentTrack = async () => {
  if (!currentTrack.value || !isSupabaseConnected.value) {
    showNotification('warning', 'Debug không khả dụng', 'Cần có bài hát đang phát và kết nối Supabase')
    return
  }
  
  const debugInfo = await debugTrackPlays(currentTrack.value.id)
  console.log('Debug info:', debugInfo)
  
  showNotification('success', 'Debug hoàn thành', `Check console để xem chi tiết track ${currentTrack.value.title}`)
}

const simulateNewUser = async () => {
  if (!currentTrack.value || !isSupabaseConnected.value) {
    showNotification('warning', 'Simulate không khả dụng', 'Cần có bài hát đang phát và kết nối Supabase')
    return
  }
  
  try {
    const result = await simulatePlayFromDifferentUser(currentTrack.value.id)
    
    if (result) {
      updateTrackPlayCount(currentTrack.value.id, result.newPlayCount)
      totalUsers.value = await getTotalUniqueUsers()
    }
    
  } catch (error) {
    console.error('Error simulating new user:', error)
    showNotification('error', 'Simulate thất bại', 'Không thể thêm view')
  }
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

const toggleUploadModal = () => {
  showUploadModal.value = !showUploadModal.value
}

const hideSearchSuggestions = () => {
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 200)
}

const handleUploadSuccess = (newTrack: Track) => {
  tracks.value.unshift(newTrack)
  showUploadModal.value = false
  
  if (!newTrack.fileName) {
    saveTracksToLocalStorage()
  }
  
  showNotification('success', 'Upload thành công', `${newTrack.title} đã được thêm!`)
}

const showDeleteConfirmation = (trackId: string) => {
  const track = tracks.value.find(t => t.id === trackId)
  if (!track) return
  
  trackToDelete.value = track
  showDeleteModal.value = true
  deleteKeyCheck.value = ''
  deleteKeyError.value = false
}

const cancelDelete = () => {
  showDeleteModal.value = false
  trackToDelete.value = null
  deleteKeyCheck.value = ''
  deleteKeyError.value = false
  isDeleting.value = false
}

const confirmDelete = async () => {
  if (!trackToDelete.value) return
  
  if (deleteKeyCheck.value !== '24082003') {
    deleteKeyError.value = true
    return
  }
  
  isDeleting.value = true
  
  try {
    const track = trackToDelete.value
    
    if (track.fileName && isSupabaseConnected.value) {
      await deleteAudioFile(track.fileName)
      await deleteTrackFromDatabase(track.id)
    }
    
    tracks.value = tracks.value.filter(t => t.id !== track.id)
    saveTracksToLocalStorage()
    
    if (currentTrack.value?.id === track.id) {
      await stopPlayTracking(track.id)
      currentTrack.value = null
      isPlaying.value = false
    }
    
    showNotification('success', 'Đã xóa bài hát', `${track.title} đã được xóa`)
    cancelDelete()
    
  } catch (error) {
    console.error('Error deleting track:', error)
    showNotification('error', 'Lỗi xóa bài hát', 'Không thể xóa bài hát')
    isDeleting.value = false
  }
}

const addToRecentlyPlayed = (trackId: string) => {
  const index = recentlyPlayed.value.indexOf(trackId)
  if (index > -1) {
    recentlyPlayed.value.splice(index, 1)
  }
  recentlyPlayed.value.unshift(trackId)
  recentlyPlayed.value = recentlyPlayed.value.slice(0, 10)
  localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed.value))
}

const loadPreferences = () => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode) {
    isDarkMode.value = savedDarkMode === 'true'
  }
  
  const savedVolume = localStorage.getItem('volume')
  if (savedVolume) {
    setVolume(parseFloat(savedVolume))
  }
  
  const savedFavorites = localStorage.getItem('favorites')
  if (savedFavorites) {
    favoriteTracks.value = JSON.parse(savedFavorites)
  }
  
  const savedRecentlyPlayed = localStorage.getItem('recentlyPlayed')
  if (savedRecentlyPlayed) {
    recentlyPlayed.value = JSON.parse(savedRecentlyPlayed)
  }
}

onMounted(async () => {
  loadPreferences()
  await initializeFingerprint()
  await loadTracks()
})

watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

watch(tracks, () => {
  saveTracksToLocalStorage()
}, { deep: true })

window.addEventListener('beforeunload', async () => {
  if (currentTrack.value) {
    await stopPlayTracking(currentTrack.value.id)
  }
})
</script>