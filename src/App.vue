<template>
  <div class="min-h-screen transition-colors duration-300" :class="{ 'dark': isDarkMode }">
    <!-- Header -->
    <header class="sticky top-0 z-50 glass-card border-b border-white/20 dark:border-dark-200/20">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-2 sm:space-x-4">
            <div class="flex items-center space-x-2 sm:space-x-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-soundcloud-orange to-soundcloud-orange-light rounded-xl flex items-center justify-center shadow-glow">
                <svg class="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h1 class="text-lg sm:text-xl font-bold gradient-text hidden sm:block">NamSound</h1>
            </div>
          </div>
          
          <!-- Search Bar -->
          <div class="flex-1 max-w-md mx-2 sm:mx-4 lg:mx-8">
            <div class="relative">
              <!-- Search icon - hidden on mobile when focused -->
              <MagnifyingGlassIcon class="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-dark-400 sm:block" :class="{ 'hidden': isMobileSearchFocused }" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="isMobile ? 'Tìm kiếm' : 'Tìm kiếm bài hát, nghệ sĩ...'"
                class="search-input text-sm sm:text-base"
                @focus="handleSearchFocus"
                @blur="handleSearchBlur"
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
            <!-- Theme Toggle -->
            <button @click="toggleTheme" title="Chuyển đổi theme" class="btn-icon w-10 h-10 sm:w-16 sm:h-16">
              <SunIcon v-if="isDarkMode" class="w-5 h-5 sm:w-8 sm:h-8" />
              <MoonIcon v-else class="w-5 h-5 sm:w-8 sm:h-8" />
            </button>
            
            <!-- Upload Button -->
            <button @click="toggleUploadModal" class="btn btn-primary text-sm sm:text-base px-3 py-2 sm:px-4">
              <span class="hidden sm:inline">Upload</span>
              <span class="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8" :class="currentTrack ? 'pb-32 sm:pb-40 lg:pb-28' : 'pb-8'">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-soundcloud-orange"></div>
        <span class="ml-3 text-gray-700 dark:text-dark-700 font-medium">Đang tải dữ liệu...</span>
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <!-- Clickable Total Tracks Card -->
        <div 
          class="card text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group p-3 sm:p-6"
          @click="showAllTracks"
          :class="{ 'ring-2 ring-soundcloud-orange': activeFilter === 'all' }"
        >
          <div class="text-xl sm:text-2xl font-bold gradient-text">{{ tracks.length }}</div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-dark-600 font-medium">Tổng số bài</div>
          <div class="text-xs text-soundcloud-orange mt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            Click để xem tất cả
          </div>
        </div>
        <div class="card text-center p-3 sm:p-6">
          <div class="text-xl sm:text-2xl font-bold gradient-text">{{ totalUsers }}</div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-dark-600 font-medium">Tổng số User</div>
        </div>
        <!-- Clickable Favorites Card - Now shows user-specific count -->
        <div 
          class="card text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group p-3 sm:p-6"
          @click="showFavorites"
          :class="{ 'ring-2 ring-soundcloud-orange': activeFilter === 'favorites' }"
        >
          <div class="text-xl sm:text-2xl font-bold gradient-text">{{ userFavoriteTracks.length }}</div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-dark-600 font-medium">Yêu thích của bạn</div>
          <div class="text-xs text-soundcloud-orange mt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            Click để xem
          </div>
        </div>
        <!-- Clickable Trending Card -->
        <div 
          class="card text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group p-3 sm:p-6"
          @click="showTrending"
          :class="{ 'ring-2 ring-soundcloud-orange': activeFilter === 'trending' }"
        >
          <div class="text-sm sm:text-lg font-bold gradient-text truncate">{{ trendingTrack || 'Chưa có' }}</div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-dark-600 font-medium">Bài hát trending</div>
          <div class="text-xs text-soundcloud-orange mt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            Click để xem
          </div>
        </div>
      </div>

      <!-- Active Filter Display -->
      <div v-if="activeFilter" class="mb-4 sm:mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div class="flex items-center space-x-2">
            <MusicalNoteIcon v-if="activeFilter === 'all'" class="w-4 h-4 sm:w-5 sm:h-5 text-soundcloud-orange" />
            <HeartIcon v-else-if="activeFilter === 'favorites'" class="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            <FireIcon v-else-if="activeFilter === 'trending'" class="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            <span class="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-900">
              {{ getFilterTitle() }}
            </span>
            <span class="text-xs sm:text-sm text-gray-500 dark:text-dark-500">
              ({{ filteredTracks.length }} bài)
            </span>
          </div>
        </div>
        <button
          @click="clearFilter"
          class="btn btn-ghost text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
        >
          <XMarkIcon class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Xóa bộ lọc
        </button>
      </div>

      <!-- Controls -->
      <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div class="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <!-- Shuffle Button - Fixed styling with flex display -->
          <button 
            @click="toggleShuffle" 
            :class="{ 'text-soundcloud-orange': isShuffled }"
            class="btn bg-transparent text-gray-600 dark:text-dark-600 hover:bg-gray-100 dark:hover:bg-dark-200 focus:ring-gray-500 px-3 py-2 sm:px-4 transform hover:scale-105 active:scale-95 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
          >
            <ArrowsRightLeftIcon class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Shuffle</span>
          </button>
          
          <select v-model="sortBy" class="input-field text-sm sm:text-base flex-1 sm:flex-none">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title">Tên A-Z</option>
            <option value="artist">Nghệ sĩ A-Z</option>
            <option value="duration">Thời lượng</option>
            <option value="popular">Phổ biến nhất</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- View Mode Buttons -->
          <button
            @click="viewMode = 'grid'" 
            :class="{ 'text-soundcloud-orange': viewMode === 'grid' }"
            class="btn-icon w-10 h-10 sm:w-16 sm:h-16"
          >
            <Squares2X2Icon class="w-5 h-5 sm:w-8 sm:h-8" />
          </button>
          <button
            @click="viewMode = 'list'" 
            :class="{ 'text-soundcloud-orange': viewMode === 'list' }"
            class="btn-icon w-10 h-10 sm:w-16 sm:h-16"
          >
            <ListBulletIcon class="w-5 h-5 sm:w-8 sm:h-8" />
          </button>
        </div>
      </div>

      <!-- Upload Modal -->
      <Teleport to="body">
        <div v-if="showUploadModal" 
             class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div class="glass-card max-w-md w-full p-4 sm:p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4 sm:mb-6">
              <h2 class="text-lg sm:text-xl font-semibold gradient-text">Upload Bài Hát</h2>
              <button @click="toggleUploadModal" class="btn-icon text-gray-400 hover:text-gray-600">
                <XMarkIcon class="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <UploadComponent @upload-success="handleUploadSuccess" />
          </div>
        </div>
      </Teleport>

      <!-- Delete Confirmation Modal -->
      <Teleport to="body">
        <div v-if="showDeleteModal" 
             class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div class="glass-card max-w-md w-full p-4 sm:p-6 animate-scale-in">
            <div class="text-center mb-4 sm:mb-6">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ExclamationTriangleIcon class="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 class="text-lg sm:text-xl font-semibold text-white mb-2">Xác nhận xóa bài hát</h2>
              <p class="text-sm sm:text-base text-white mb-3 sm:mb-4 font-medium">
                Bạn đang muốn xóa bài hát: <br>
                <span class="font-semibold text-soundcloud-orange">{{ trackToDelete?.title }}</span>
              </p>
              <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p class="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  <strong>Bảo mật:</strong> Để xóa bài hát này, bạn phải nhập Key-check là ngày tháng năm sinh của Phương Nam
                </p>
              </div>
            </div>
            
            <div class="space-y-3 sm:space-y-4">
              <div>
                <label class="block text-sm font-medium text-white mb-2">
                  Nhập Key-check (ddmmyyyy):
                </label>
                <input
                  v-model="deleteKeyCheck"
                  type="text"
                  placeholder="Nhập ngày tháng năm sinh..."
                  class="input-field text-white placeholder-white/70 text-sm sm:text-base"
                  :class="{ 'border-red-500 focus:ring-red-500': deleteKeyError }"
                  @keyup.enter="confirmDelete"
                  @input="deleteKeyError = false"
                />
                <p v-if="deleteKeyError" class="text-red-400 text-xs sm:text-sm mt-1 font-medium">
                  Key-check không đúng! Vui lòng thử lại.
                </p>
              </div>
              
              <div class="flex space-x-3">
                <button
                  @click="cancelDelete"
                  class="flex-1 btn btn-secondary text-sm sm:text-base"
                  :disabled="isDeleting"
                >
                  Hủy
                </button>
                <button
                  @click="confirmDelete"
                  :disabled="!deleteKeyCheck || isDeleting"
                  class="flex-1 btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
        <div v-if="filteredTracks.length === 0" class="text-center py-12 sm:py-16">
          <div class="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-soundcloud-orange/20 to-soundcloud-orange-light/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <MusicalNoteIcon v-if="!activeFilter || activeFilter === 'all'" class="w-8 h-8 sm:w-12 sm:h-12 text-soundcloud-orange" />
            <HeartIcon v-else-if="activeFilter === 'favorites'" class="w-8 h-8 sm:w-12 sm:h-12 text-red-500" />
            <FireIcon v-else-if="activeFilter === 'trending'" class="w-8 h-8 sm:w-12 sm:h-12 text-orange-500" />
          </div>
          <h3 class="text-lg sm:text-xl font-medium text-gray-600 dark:text-dark-600 mb-2">
            {{ getEmptyStateTitle() }}
          </h3>
          <p class="text-sm sm:text-base text-gray-500 dark:text-dark-500 mb-4 sm:mb-6">
            {{ getEmptyStateMessage() }}
          </p>
          <div class="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button v-if="activeFilter" @click="clearFilter" class="btn btn-secondary text-sm sm:text-base">
              Xem tất cả bài hát
            </button>
            <button @click="toggleUploadModal" class="btn btn-primary text-sm sm:text-base">
              Upload Bài Hát
            </button>
          </div>
        </div>
        
        <div v-else>
          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" 
               class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <TrackCard
              v-for="track in displayedTracks"
              :key="track.id"
              :track="track"
              :is-playing="currentTrack?.id === track.id && isPlaying"
              :is-current="currentTrack?.id === track.id"
              :is-favorite="userFavoriteTracks.includes(track.id)"
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
          <div v-else class="space-y-3 sm:space-y-4">
            <TrackItem
              v-for="track in displayedTracks"
              :key="track.id"
              :track="track"
              :is-playing="currentTrack?.id === track.id && isPlaying"
              :is-current="currentTrack?.id === track.id"
              :is-favorite="userFavoriteTracks.includes(track.id)"
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
      :is-favorite="userFavoriteTracks.includes(currentTrack.id)"
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
             class="glass-card p-3 sm:p-4 max-w-sm animate-slide-up">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <div class="flex-shrink-0">
              <CheckCircleIcon v-if="notification.type === 'success'" class="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              <ExclamationTriangleIcon v-else-if="notification.type === 'warning'" class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              <XCircleIcon v-else class="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
            <div class="flex-1">
              <p class="text-xs sm:text-sm font-medium text-gray-900 dark:text-dark-900">{{ notification.title }}</p>
              <p class="text-xs text-gray-600 dark:text-dark-600">{{ notification.message }}</p>
            </div>
            <button @click="removeNotification(notification.id)" class="btn-icon">
              <XMarkIcon class="w-3 h-3 sm:w-4 sm:h-4" />
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
  XCircleIcon,
  HeartIcon,
  FireIcon
} from '@heroicons/vue/24/outline'
import TrackItem from './components/TrackItem.vue'
import TrackCard from './components/TrackCard.vue'
import EnhancedMusicPlayer from './components/EnhancedMusicPlayer.vue'
import UploadComponent from './components/UploadComponent.vue'
import { 
  supabase, 
  getTracksFromDatabase, 
  deleteTrackFromDatabase, 
  deleteAudioFile, 
  getAudioFileUrl,
  getUserFingerprint,
  recordTrackPlay,
  getTotalUniqueUsers,
  updateTrackPlayCount,
  getUserFavorites,
  addToUserFavorites,
  removeFromUserFavorites,
  checkUserFavoritesTableExists
} from './lib/supabase'
import type { Track, Notification } from './types/Track'

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
const userFavoriteTracks = ref<string[]>([]) // Changed from favoriteTracks to userFavoriteTracks
const recentlyPlayed = ref<string[]>([])
const notifications = ref<Notification[]>([])
const isLoading = ref(true)
const isSupabaseConnected = ref(false)

// Mobile search state
const isMobile = ref(false)
const isMobileSearchFocused = ref(false)

// User tracking for play counts and favorites
const userFingerprint = ref<{ ip: string; userAgent: string; fingerprint: string } | null>(null)
const trackPlayStartTime = ref<Map<string, number>>(new Map())
const totalUsers = ref(0)

// Delete confirmation modal state
const showDeleteModal = ref(false)
const trackToDelete = ref<Track | null>(null)
const deleteKeyCheck = ref('')
const deleteKeyError = ref(false)
const isDeleting = ref(false)

// Filter state - Updated to include 'all'
const activeFilter = ref<'all' | 'favorites' | 'trending' | null>(null)

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

// Mobile search handlers
const handleSearchFocus = () => {
  if (isMobile.value) {
    isMobileSearchFocused.value = true
  }
  showSearchSuggestions.value = true
}

const handleSearchBlur = () => {
  isMobileSearchFocused.value = false
  hideSearchSuggestions()
}

// Filter methods - Updated
const showAllTracks = () => {
  activeFilter.value = 'all'
  searchQuery.value = '' // Clear search when filtering
}

const showFavorites = () => {
  activeFilter.value = 'favorites'
  searchQuery.value = '' // Clear search when filtering
}

const showTrending = () => {
  activeFilter.value = 'trending'
  searchQuery.value = '' // Clear search when filtering
}

const clearFilter = () => {
  activeFilter.value = null
}

// Helper functions for filter display
const getFilterTitle = () => {
  switch (activeFilter.value) {
    case 'all':
      return 'Tất cả bài hát'
    case 'favorites':
      return 'Bài hát yêu thích của bạn'
    case 'trending':
      return 'Bài hát trending'
    default:
      return ''
  }
}

// Empty state helpers - Updated
const getEmptyStateTitle = () => {
  if (activeFilter.value === 'all') {
    return 'Chưa có bài hát nào'
  } else if (activeFilter.value === 'favorites') {
    return 'Chưa có bài hát yêu thích'
  } else if (activeFilter.value === 'trending') {
    return 'Chưa có bài hát trending'
  } else if (searchQuery.value) {
    return 'Không tìm thấy bài hát'
  }
  return 'Chưa có bài hát nào'
}

const getEmptyStateMessage = () => {
  if (activeFilter.value === 'all') {
    return 'Upload bài hát đầu tiên để bắt đầu!'
  } else if (activeFilter.value === 'favorites') {
    return 'Hãy thêm bài hát vào danh sách yêu thích bằng cách nhấn vào icon trái tim!'
  } else if (activeFilter.value === 'trending') {
    return 'Chưa có bài hát nào có đủ lượt nghe để trở thành trending.'
  } else if (searchQuery.value) {
    return `Không tìm thấy kết quả cho "${searchQuery.value}". Thử tìm kiếm với từ khóa khác.`
  }
  return 'Upload bài hát đầu tiên để bắt đầu!'
}

// Computed - Updated filtering logic
const filteredTracks = computed(() => {
  let filtered = tracks.value
  
  // Apply active filter first
  if (activeFilter.value === 'all') {
    // Show all tracks (no filtering)
    filtered = tracks.value
  } else if (activeFilter.value === 'favorites') {
    // FIXED: Now filters based on user-specific favorites
    filtered = filtered.filter(track => userFavoriteTracks.value.includes(track.id))
  } else if (activeFilter.value === 'trending') {
    // FIXED: Show only THE TOP trending track (not all tracks with plays > 0)
    const tracksWithPlays = filtered.filter(track => (track.playCount || 0) > 0)
    if (tracksWithPlays.length > 0) {
      // Sort by play count and take only the top 1
      const topTrack = tracksWithPlays.sort((a, b) => (b.playCount || 0) - (a.playCount || 0))[0]
      filtered = [topTrack] // Only show the single top track
    } else {
      filtered = [] // No tracks with plays
    }
  }
  
  // Then apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(track => 
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query)
    )
  }
  
  // Finally apply sorting (unless it's trending filter which has its own sorting)
  if (activeFilter.value !== 'trending') {
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
    
    // Also check if user_favorites table exists
    if (isSupabaseConnected.value) {
      const favoritesTableExists = await checkUserFavoritesTableExists()
      if (!favoritesTableExists) {
        console.warn('user_favorites table does not exist. Favorites will use localStorage fallback.')
        showNotification('warning', 'Favorites table missing', 'Please run the database migration for full functionality.')
      }
    }
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
    const localTracks = tracks.value.filter(track => !track.fileName) // Only save local tracks
    localStorage.setItem('tracks', JSON.stringify(localTracks))
  } catch (error) {
    console.error('Error saving tracks to localStorage:', error)
  }
}

// IMPROVED: Load user-specific favorites with better error handling
const loadUserFavorites = async () => {
  if (!userFingerprint.value) {
    console.log('No user fingerprint available yet')
    return
  }

  try {
    if (isSupabaseConnected.value) {
      // Try to load from Supabase first
      const favorites = await getUserFavorites(userFingerprint.value.ip, userFingerprint.value.userAgent)
      userFavoriteTracks.value = favorites
      console.log(`Loaded ${favorites.length} favorites from Supabase for user ${userFingerprint.value.ip}`)
      
      // Save to localStorage as backup
      localStorage.setItem(`favorites_${userFingerprint.value.fingerprint}`, JSON.stringify(favorites))
    } else {
      // Fallback to localStorage
      const savedFavorites = localStorage.getItem(`favorites_${userFingerprint.value.fingerprint}`)
      if (savedFavorites) {
        userFavoriteTracks.value = JSON.parse(savedFavorites)
        console.log(`Loaded ${userFavoriteTracks.value.length} favorites from localStorage`)
      }
    }
  } catch (error) {
    console.error('Error loading user favorites:', error)
    
    // Always fallback to localStorage if Supabase fails
    try {
      const savedFavorites = localStorage.getItem(`favorites_${userFingerprint.value.fingerprint}`)
      if (savedFavorites) {
        userFavoriteTracks.value = JSON.parse(savedFavorites)
        console.log(`Fallback: Loaded ${userFavoriteTracks.value.length} favorites from localStorage`)
      }
    } catch (localError) {
      console.error('Error loading favorites from localStorage:', localError)
      userFavoriteTracks.value = []
    }
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
      
      // Load total users count
      totalUsers.value = await getTotalUniqueUsers()
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

const startPlayTracking = (trackId: string) => {
  if (!userFingerprint.value || !isSupabaseConnected.value) return
  
  // Record the start time
  trackPlayStartTime.value.set(trackId, Date.now())
  
  console.log(`Started tracking play for track: ${trackId}`)
}

const stopPlayTracking = async (trackId: string) => {
  if (!userFingerprint.value || !isSupabaseConnected.value) return
  
  const startTime = trackPlayStartTime.value.get(trackId)
  if (!startTime) return
  
  const playDuration = (Date.now() - startTime) / 1000 // Convert to seconds
  trackPlayStartTime.value.delete(trackId)
  
  console.log(`Play duration for track ${trackId}: ${playDuration} seconds`)
  
  // Only record if played for at least 10 seconds
  if (playDuration >= 10) {
    try {
      const result = await recordTrackPlay(
        trackId, 
        userFingerprint.value.ip, 
        userFingerprint.value.userAgent, 
        playDuration
      )
      
      if (result) {
        // Update the track in our local state immediately
        const trackIndex = tracks.value.findIndex(t => t.id === trackId)
        if (trackIndex !== -1) {
          tracks.value[trackIndex].playCount = result.newPlayCount
          // Force reactivity
          tracks.value = [...tracks.value]
          
          console.log(`UI updated: Track ${trackId} now has ${result.newPlayCount} plays`)
        }
        
        // Update total users count
        totalUsers.value = await getTotalUniqueUsers()
      }
      
    } catch (error) {
      console.error('Error recording play:', error)
    }
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
  // Stop tracking previous track if any
  if (currentTrack.value && currentTrack.value.id !== track?.id) {
    stopPlayTracking(currentTrack.value.id)
  }
  
  if (track) {
    if (currentTrack.value?.id !== track.id) {
      currentTrack.value = track
      loadTrack(track)
      addToRecentlyPlayed(track.id)
      startPlayTracking(track.id) // Start tracking new track
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
  
  // Don't stop tracking on pause, only on track change or stop
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
  
  // Stop tracking current track
  stopPlayTracking(currentTrack.value.id)
  
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
  
  // Stop tracking current track
  stopPlayTracking(currentTrack.value.id)
  
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

// IMPROVED: Updated toggleFavorite with better error handling and fallbacks
const toggleFavorite = async (trackId: string) => {
  if (!userFingerprint.value) {
    showNotification('warning', 'Không thể thêm yêu thích', 'Đang tải thông tin user...')
    return
  }
  
  const isFavorited = userFavoriteTracks.value.includes(trackId)
  
  try {
    if (isFavorited) {
      // Remove from favorites
      if (isSupabaseConnected.value) {
        try {
          await removeFromUserFavorites(trackId, userFingerprint.value.ip)
        } catch (supabaseError) {
          console.warn('Supabase remove failed, using localStorage only:', supabaseError)
        }
      }
      
      // Always update local state
      userFavoriteTracks.value = userFavoriteTracks.value.filter(id => id !== trackId)
      showNotification('success', 'Đã xóa khỏi yêu thích', '')
    } else {
      // Add to favorites
      if (isSupabaseConnected.value) {
        try {
          await addToUserFavorites(trackId, userFingerprint.value.ip, userFingerprint.value.userAgent)
        } catch (supabaseError) {
          console.warn('Supabase add failed, using localStorage only:', supabaseError)
        }
      }
      
      // Always update local state
      userFavoriteTracks.value.push(trackId)
      showNotification('success', 'Đã thêm vào yêu thích', '')
    }
    
    // Always save to localStorage as backup
    localStorage.setItem(`favorites_${userFingerprint.value.fingerprint}`, JSON.stringify(userFavoriteTracks.value))
    
  } catch (error) {
    console.error('Error toggling favorite:', error)
    showNotification('error', 'Lỗi', 'Không thể cập nhật yêu thích. Đã lưu vào bộ nhớ local.')
    
    // Even if there's an error, try to update localStorage
    try {
      if (isFavorited) {
        userFavoriteTracks.value = userFavoriteTracks.value.filter(id => id !== trackId)
      } else {
        userFavoriteTracks.value.push(trackId)
      }
      localStorage.setItem(`favorites_${userFingerprint.value.fingerprint}`, JSON.stringify(userFavoriteTracks.value))
    } catch (localError) {
      console.error('Even localStorage failed:', localError)
    }
  }
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
      // Stop tracking if deleting current track
      stopPlayTracking(track.id)
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
    // Stop tracking when track ends
    if (currentTrack.value) {
      stopPlayTracking(currentTrack.value.id)
    }
    
    if (repeatMode.value === 'one') {
      audio.value!.currentTime = 0
      audio.value!.play()
      // Restart tracking for repeat
      if (currentTrack.value) {
        startPlayTracking(currentTrack.value.id)
      }
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
  
  const savedRecentlyPlayed = localStorage.getItem('recentlyPlayed')
  if (savedRecentlyPlayed) {
    recentlyPlayed.value = JSON.parse(savedRecentlyPlayed)
  }
}

onMounted(async () => {
  audio.value = new Audio()
  setupAudioEvents()
  loadPreferences()
  checkMobile()
  
  // Get user fingerprint for play tracking and favorites
  userFingerprint.value = await getUserFingerprint()
  
  await loadTracks()
  
  // Load user-specific favorites after getting fingerprint and tracks
  await loadUserFavorites()
  
  // Listen for window resize
  window.addEventListener('resize', checkMobile)
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

// Clear filter when search is used
watch(searchQuery, (newValue) => {
  if (newValue && activeFilter.value) {
    activeFilter.value = null
  }
})

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (currentTrack.value) {
    stopPlayTracking(currentTrack.value.id)
  }
})
</script>