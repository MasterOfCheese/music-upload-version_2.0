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
            <!-- Supabase Status -->
            <div class="hidden sm:flex items-center space-x-2 text-xs">
              <div class="w-2 h-2 rounded-full" :class="isSupabaseConnected ? 'bg-green-500' : 'bg-yellow-500'"></div>
              <span class="text-gray-700 dark:text-dark-700 font-medium">
                {{ isSupabaseConnected ? 'Supabase' : 'Local' }}
              </span>
            </div>
            
            <!-- Theme Toggle -->
            <button @click="toggleTheme" class="btn-icon" title="Chuyển đổi theme">
              <SunIcon v-if="isDarkMode" class="w-5 h-5" />
              <MoonIcon v-else class="w-5 h-5" />
            </button>
            
            <!-- Upload Button -->
            <button @click="toggleUploadModal" class="btn btn-primary">
              <span class="hidden sm:inline">Upload</span>
              <span class="sm:hidden">Upload</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content với padding bottom động để tránh bị che bởi player -->
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
          <div class="text-2xl font-bold gradient-text">{{ totalDuration }}</div>
          <div class="text-sm text-gray-600 dark:text-dark-600 font-medium">Tổng thời lượng</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold gradient-text">{{ favoriteTracks.length }}</div>
          <div class="text-sm text-gray-600 dark:text-dark-600 font-medium">Yêu thích</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold gradient-text">{{ recentlyPlayed.length }}</div>
          <div class="text-sm text-gray-600 dark:text-dark-600 font-medium">Nghe gần đây</div>
        </div>
      </div>

      <!-- Controls -->
      <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="flex items-center space-x-4">
          <button @click="toggleShuffle" 
                  class="btn btn-ghost"
                  :class="{ 'text-soundcloud-orange': isShuffled }">
            <ArrowsRightLeftIcon class="w-5 h-5 mr-2" />
            Shuffle
          </button>
          
          <select v-model="sortBy" class="input-field">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title">Tên A-Z</option>
            <option value="artist">Nghệ sĩ A-Z</option>
            <option value="duration">Thời lượng</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <button @click="viewMode = 'grid'" 
                  class="btn-icon"
                  :class="{ 'text-soundcloud-orange': viewMode === 'grid' }">
            <Squares2X2Icon class="w-5 h-5" />
          </button>
          <button @click="viewMode = 'list'" 
                  class="btn-icon"
                  :class="{ 'text-soundcloud-orange': viewMode === 'list' }">
            <ListBulletIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Upload Modal -->
      <Teleport to="body">
        <div v-if="showUploadModal" 
             class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div class="glass-card max-w-md w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold gradient-text">Upload Bài Hát</h2>
              <button @click="toggleUploadModal" class="btn-icon text-gray-400 hover:text-gray-600">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
            <UploadComponent @upload-success="handleUploadSuccess" />
          </div>
        </div>
      </Teleport>

      <!-- Delete Confirmation Modal -->
      <Teleport to="body">
        <div v-if="showDeleteModal" 
             class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div class="glass-card max-w-md w-full p-6 animate-scale-in">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon class="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 class="text-xl font-semibold text-white mb-2">Xác nhận xóa bài hát</h2>
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
                <button
                  @click="cancelDelete"
                  class="flex-1 btn btn-secondary"
                  :disabled="isDeleting"
                >
                  Hủy
                </button>
                <button
                  @click="confirmDelete"
                  :disabled="!deleteKeyCheck || isDeleting"
                  class="flex-1 btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isDeleting ? 'Đang xóa...' : 'Xóa bài hát' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Track List/Grid -->
      <div v-if="!isLoading">
        <div v-if="filteredTracks.length === 0" class="text-center py-16">
          <div class="w-24 h-24 bg-gradient-to-br from-soundcloud-orange/20 to-soundcloud-orange-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MusicalNoteIcon class="w-12 h-12 text-soundcloud-orange" />
          </div>
          <h3 class="text-xl font-medium text-gray-600 dark:text-dark-600 mb-2">Chưa có bài hát nào</h3>
          <p class="text-gray-500 dark:text-dark-500 mb-6">Upload bài hát đầu tiên để bắt đầu!</p>
          <button @click="toggleUploadModal" class="btn btn-primary">
            Upload Bài Hát
          </button>
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
              @play="playTrack"
              @pause="pauseTrack"
              @delete="showDeleteConfirmation"
              @toggle-favorite="toggleFavorite"
              @share="shareTrack"
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

    <!-- Enhanced Music Player - Fixed positioning -->
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
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="notification">
        <div v-for="notification in notifications" :key="notification.id"
             class="glass-card p-4 max-w-sm animate-slide-up">
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
            <button @click="removeNotification(notification.id)" class="btn-icon">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  MusicalNoteIcon,
  SunIcon,
  MoonIcon,
  ArrowsRightLeftIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import TrackItem from './components/TrackItem.vue'
import TrackCard from './components/TrackCard.vue'
import EnhancedMusicPlayer from './components/EnhancedMusicPlayer.vue'
import UploadComponent from './components/UploadComponent.vue'
import { supabase, getTracksFromDatabase, deleteTrackFromDatabase, deleteAudioFile, getAudioFileUrl } from './lib/supabase'
import type { Track, Notification, DatabaseTrack } from './types/Track'

// State
const tracks = ref<Track[]>([])
const currentTrack = ref<Track | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const repeatMode = ref<'off' | 'one' | 'all'>('off')
const isShuffled = ref(false)
const searchQuery = ref('')
const showUploadModal = ref(false)
const showSearchSuggestions = ref(false)
const isDarkMode = ref(false)
const viewMode = ref<'list' | 'grid'>('list')
const sortBy = ref('newest')
const audio = ref<HTMLAudioElement | null>(null)
const favoriteTracks = ref<string[]>([])
const recentlyPlayed = ref<string[]>([])
const notifications = ref<Notification[]>([])
const isLoading = ref(true)
const isSupabaseConnected = ref(false)

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

const totalDuration = computed(() => {
  const total = tracks.value.reduce((sum, track) => sum + track.duration, 0)
  return formatTime(total)
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
    const { data, error } = await supabase.from('tracks').select('count').limit(1)
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
          fileSize: dbTrack.file_size
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
        uploadedAt: new Date(track.uploadedAt)
      }))
    }
  } catch (error) {
    console.error('Error loading tracks from localStorage:', error)
  }
  return []
}

const saveTracksToLocalStorage = () => {
  try {
    const localTracks = tracks.value.filter(track => !track.fileName) // Only save local tracks
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
      // Load from Supabase
      const supabaseTracks = await loadTracksFromSupabase()
      allTracks = [...allTracks, ...supabaseTracks]
      showNotification('success', 'Kết nối Supabase thành công', `Đã tải ${supabaseTracks.length} bài hát từ cloud`)
    }
    
    // Load from localStorage (for local tracks)
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
  
  // Save to localStorage if it's a local track
  if (!newTrack.fileName) {
    saveTracksToLocalStorage()
  }
  
  showNotification('success', 'Upload thành công', `${newTrack.title} đã được thêm!`)
}

const playTrack = (track?: Track) => {
  if (track) {
    if (currentTrack.value?.id !== track.id) {
      currentTrack.value = track
      loadTrack(track)
      addToRecentlyPlayed(track.id)
    }
  }
  
  if (audio.value) {
    audio.value.play()
    isPlaying.value = true
  }
}

const pauseTrack = () => {
  if (audio.value) {
    audio.value.pause()
    isPlaying.value = false
  }
}

const loadTrack = (track: Track) => {
  if (audio.value) {
    audio.value.src = track.url
    audio.value.volume = volume.value
    audio.value.load()
  }
}

const nextTrack = () => {
  if (!currentTrack.value) return
  
  const currentList = displayedTracks.value
  const currentIndex = currentList.findIndex(t => t.id === currentTrack.value!.id)
  const nextIndex = currentIndex + 1
  
  if (nextIndex < currentList.length) {
    playTrack(currentList[nextIndex])
  } else if (repeatMode.value === 'all') {
    playTrack(currentList[0])
  }
}

const previousTrack = () => {
  if (!currentTrack.value) return
  
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
  if (audio.value) {
    audio.value.currentTime = time
    currentTime.value = time
  }
}

const setVolume = (newVolume: number) => {
  volume.value = newVolume
  if (audio.value) {
    audio.value.volume = newVolume
  }
  localStorage.setItem('volume', newVolume.toString())
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

// Delete confirmation methods
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
  
  // Check key-check (Phương Nam's birthday: 24082003)
  if (deleteKeyCheck.value !== '24082003') {
    deleteKeyError.value = true
    return
  }
  
  isDeleting.value = true
  
  try {
    const track = trackToDelete.value
    
    if (track.fileName && isSupabaseConnected.value) {
      // Delete from Supabase
      await deleteAudioFile(track.fileName)
      await deleteTrackFromDatabase(track.id)
    }
    
    // Remove from local state
    tracks.value = tracks.value.filter(t => t.id !== track.id)
    
    // Update localStorage for local tracks
    saveTracksToLocalStorage()
    
    if (currentTrack.value?.id === track.id) {
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

const showNotification = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
  const notification: Notification = {
    id: Date.now().toString(),
    type,
    title,
    message
  }
  notifications.value.push(notification)
  
  setTimeout(() => {
    removeNotification(notification.id)
  }, 5000)
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Audio event handlers
const setupAudioEvents = () => {
  if (!audio.value) return
  
  audio.value.addEventListener('timeupdate', () => {
    currentTime.value = audio.value!.currentTime
  })
  
  audio.value.addEventListener('loadedmetadata', () => {
    duration.value = audio.value!.duration
  })
  
  audio.value.addEventListener('ended', () => {
    if (repeatMode.value === 'one') {
      audio.value!.currentTime = 0
      audio.value!.play()
    } else {
      nextTrack()
    }
  })
}

// Load saved preferences
const loadPreferences = () => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode) {
    isDarkMode.value = savedDarkMode === 'true'
  }
  
  const savedVolume = localStorage.getItem('volume')
  if (savedVolume) {
    volume.value = parseFloat(savedVolume)
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
  audio.value = new Audio()
  setupAudioEvents()
  loadPreferences()
  await loadTracks()
})

// Watch for theme changes
watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

// Watch for tracks changes to save to localStorage
watch(tracks, () => {
  saveTracksToLocalStorage()
}, { deep: true })
</script>