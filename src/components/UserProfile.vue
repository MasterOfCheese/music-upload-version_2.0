<template>
  <div class="animate-fade-in">
    <!-- Profile Header -->
    <div class="card p-6 sm:p-8 mb-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <!-- Avatar -->
        <div class="relative group">
          <div class="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gradient-to-br from-soundcloud-orange/30 to-soundcloud-orange-light/30 flex items-center justify-center shadow-lg">
            <img v-if="profileData?.avatar_url" :src="profileData.avatar_url" :alt="profileData.username" class="w-full h-full object-cover" />
            <UserIcon v-else class="w-10 h-10 sm:w-14 sm:h-14 text-soundcloud-orange/60" />
          </div>
          <!-- Edit avatar button (own profile only) -->
          <button
            v-if="isOwnProfile"
            @click="triggerAvatarUpload"
            class="absolute bottom-0 right-0 w-8 h-8 bg-soundcloud-orange text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <CameraIcon class="w-4 h-4" />
          </button>
          <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-1">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-900 truncate">{{ profileData?.username || 'Người dùng' }}</h2>
            <!-- Edit button (own profile) -->
            <button v-if="isOwnProfile" @click="showEditModal = true" class="btn btn-ghost text-sm px-3 py-1">
              <PencilSquareIcon class="w-4 h-4 mr-1" />
              Chỉnh sửa
            </button>
          </div>

          <p v-if="profileData?.bio" class="text-sm text-gray-600 dark:text-dark-600 mb-3 max-w-lg">{{ profileData.bio }}</p>
          <p v-else-if="isOwnProfile" class="text-sm text-gray-400 dark:text-dark-400 mb-3 italic">Chưa có bio. Nhấn "Chỉnh sửa" để thêm.</p>

          <!-- Stats -->
          <div class="flex items-center gap-4 sm:gap-6 text-sm">
            <div class="flex items-center gap-1">
              <MusicalNoteIcon class="w-4 h-4 text-soundcloud-orange" />
              <span class="font-semibold text-gray-900 dark:text-dark-900">{{ trackCount }}</span>
              <span class="text-gray-500 dark:text-dark-500">bài hát</span>
            </div>
            <div class="flex items-center gap-1 cursor-pointer hover:text-soundcloud-orange transition-colors" @click="activeTab = 'followers'">
              <UserGroupIcon class="w-4 h-4 text-soundcloud-orange" />
              <span class="font-semibold text-gray-900 dark:text-dark-900">{{ followerCount }}</span>
              <span class="text-gray-500 dark:text-dark-500">người theo dõi</span>
            </div>
            <div class="flex items-center gap-1 cursor-pointer hover:text-soundcloud-orange transition-colors" @click="activeTab = 'following'">
              <UserPlusIcon class="w-4 h-4 text-soundcloud-orange" />
              <span class="font-semibold text-gray-900 dark:text-dark-900">{{ followingCount }}</span>
              <span class="text-gray-500 dark:text-dark-500">đang theo dõi</span>
            </div>
          </div>

          <!-- Follow button (other profiles) -->
          <div v-if="!isOwnProfile && currentUserId" class="mt-3">
            <button
              @click="handleFollowToggle"
              :class="isFollowingUser ? 'btn btn-secondary' : 'btn btn-primary'"
              :disabled="followLoading"
              class="text-sm px-4 py-2"
            >
              <UserMinusIcon v-if="isFollowingUser" class="w-4 h-4 mr-1" />
              <UserPlusIcon v-else class="w-4 h-4 mr-1" />
              {{ isFollowingUser ? 'Bỏ theo dõi' : 'Theo dõi' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 mb-4 border-b border-gray-200 dark:border-dark-200">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-3 text-sm font-medium transition-all relative"
        :class="activeTab === tab.key
          ? 'text-soundcloud-orange'
          : 'text-gray-500 dark:text-dark-500 hover:text-gray-700 dark:hover:text-dark-700'"
      >
        {{ tab.label }}
        <span v-if="activeTab === tab.key" class="absolute bottom-0 left-0 right-0 h-0.5 bg-soundcloud-orange rounded-full"></span>
      </button>
    </div>

    <!-- Tab Content -->
    <div>
      <!-- Tracks tab -->
      <div v-if="activeTab === 'tracks'">
        <div v-if="userTracks.length === 0" class="text-center py-12">
          <MusicalNoteIcon class="w-12 h-12 text-gray-300 dark:text-dark-300 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-dark-500">
            {{ isOwnProfile ? 'Bạn chưa upload bài hát nào' : 'Chưa có bài hát nào' }}
          </p>
        </div>
        <div v-else class="space-y-3 sm:space-y-4">
          <TrackItem
            v-for="track in userTracks"
            :key="track.id"
            :track="track"
            :is-playing="isPlaying && currentTrackId === track.id"
            :is-current="currentTrackId === track.id"
            :is-favorite="favoriteTrackIds.includes(track.id)"
            :current-time="currentTrackId === track.id ? currentTime : 0"
            :duration="track.duration"
            @play="$emit('play', track)"
            @pause="$emit('pause')"
            @delete="$emit('delete', track.id)"
            @seek="(t: number) => $emit('seek', t)"
            @toggle-favorite="$emit('toggle-favorite', track.id)"
            @share="$emit('share', track)"
          />
        </div>
      </div>

      <!-- Favorites tab -->
      <div v-if="activeTab === 'favorites'">
        <div v-if="favoriteTracks.length === 0" class="text-center py-12">
          <HeartIcon class="w-12 h-12 text-gray-300 dark:text-dark-300 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-dark-500">
            {{ isOwnProfile ? 'Chưa có bài hát yêu thích nào' : 'Chưa có bài hát yêu thích' }}
          </p>
        </div>
        <div v-else class="space-y-3 sm:space-y-4">
          <TrackItem
            v-for="track in favoriteTracks"
            :key="track.id"
            :track="track"
            :is-playing="isPlaying && currentTrackId === track.id"
            :is-current="currentTrackId === track.id"
            :is-favorite="true"
            :current-time="currentTrackId === track.id ? currentTime : 0"
            :duration="track.duration"
            @play="$emit('play', track)"
            @pause="$emit('pause')"
            @delete="$emit('delete', track.id)"
            @seek="(t: number) => $emit('seek', t)"
            @toggle-favorite="$emit('toggle-favorite', track.id)"
            @share="$emit('share', track)"
          />
        </div>
      </div>

      <!-- Followers tab -->
      <div v-if="activeTab === 'followers'">
        <div v-if="followersList.length === 0" class="text-center py-12">
          <UserGroupIcon class="w-12 h-12 text-gray-300 dark:text-dark-300 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-dark-500">Chưa có người theo dõi nào</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="follower in followersList"
            :key="follower.id"
            class="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all"
            @click="$emit('view-profile', follower.id)"
          >
            <div class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-soundcloud-orange/30 to-soundcloud-orange-light/30 flex items-center justify-center flex-shrink-0">
              <img v-if="follower.avatar_url" :src="follower.avatar_url" class="w-full h-full object-cover" />
              <UserIcon v-else class="w-5 h-5 text-soundcloud-orange/60" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-gray-900 dark:text-dark-900 truncate">{{ follower.username }}</p>
              <p v-if="follower.bio" class="text-xs text-gray-500 dark:text-dark-500 truncate">{{ follower.bio }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Following tab -->
      <div v-if="activeTab === 'following'">
        <div v-if="followingList.length === 0" class="text-center py-12">
          <UserPlusIcon class="w-12 h-12 text-gray-300 dark:text-dark-300 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-dark-500">Chưa theo dõi ai</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="followed in followingList"
            :key="followed.id"
            class="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all"
            @click="$emit('view-profile', followed.id)"
          >
            <div class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-soundcloud-orange/30 to-soundcloud-orange-light/30 flex items-center justify-center flex-shrink-0">
              <img v-if="followed.avatar_url" :src="followed.avatar_url" class="w-full h-full object-cover" />
              <UserIcon v-else class="w-5 h-5 text-soundcloud-orange/60" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-gray-900 dark:text-dark-900 truncate">{{ followed.username }}</p>
              <p v-if="followed.bio" class="text-xs text-gray-500 dark:text-dark-500 truncate">{{ followed.bio }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <div v-if="showEditModal"
           class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in"
           @click.self="showEditModal = false">
        <div class="glass-card max-w-md w-full p-4 sm:p-6 animate-scale-in">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold gradient-text">Chỉnh sửa hồ sơ</h3>
            <button @click="showEditModal = false" class="btn-icon text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleSaveProfile" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-800 dark:text-dark-800 mb-2">Tên người dùng</label>
              <input v-model="editForm.username" type="text" required class="input-field" placeholder="Tên người dùng" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-800 dark:text-dark-800 mb-2">Bio</label>
              <textarea v-model="editForm.bio" class="input-field resize-none" rows="3" placeholder="Viết một chút về bạn..." maxlength="200"></textarea>
              <p class="text-xs text-gray-400 mt-1">{{ editForm.bio.length }}/200</p>
            </div>

            <div v-if="editError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ editError }}</p>
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
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import {
  XMarkIcon, UserIcon, MusicalNoteIcon, HeartIcon,
  PencilSquareIcon, CameraIcon, UserGroupIcon, UserPlusIcon, UserMinusIcon
} from '@heroicons/vue/24/outline'
import TrackItem from './TrackItem.vue'
import { useAuth } from '../composables/useAuth'
import { useFollows } from '../composables/useFollows'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/Profile'
import type { Track } from '../types/Track'

interface Props {
  userId: string
  tracks: Track[]
  favoriteTrackIds: string[]
  isPlaying: boolean
  currentTrackId: string | null
  currentTime: number
}

interface Emits {
  (e: 'play', track: Track): void
  (e: 'pause'): void
  (e: 'delete', trackId: string): void
  (e: 'seek', time: number): void
  (e: 'toggle-favorite', trackId: string): void
  (e: 'share', track: Track): void
  (e: 'view-profile', userId: string): void
  (e: 'profile-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { user: currentUser, updateProfile } = useAuth()
const { isFollowing, follow, unfollow, getFollowerCount, getFollowingCount, getFollowers, getFollowing, fetchFollowing } = useFollows()

const profileData = ref<Profile | null>(null)
const trackCount = ref(0)
const followerCount = ref(0)
const followingCount = ref(0)
const followersList = ref<Profile[]>([])
const followingList = ref<Profile[]>([])
const activeTab = ref('tracks')
const followLoading = ref(false)

// Edit profile
const showEditModal = ref(false)
const editSaving = ref(false)
const editError = ref('')
const editForm = reactive({ username: '', bio: '' })
const avatarInput = ref<HTMLInputElement>()

const isOwnProfile = computed(() => currentUser.value?.id === props.userId)
const currentUserId = computed(() => currentUser.value?.id ?? null)
const isFollowingUser = computed(() => isFollowing(props.userId))

const tabs = computed(() => {
  const t = [{ key: 'tracks', label: 'Bài hát' }]
  if (isOwnProfile.value) {
    t.push({ key: 'favorites', label: 'Yêu thích' })
  }
  t.push({ key: 'followers', label: 'Người theo dõi' })
  t.push({ key: 'following', label: 'Đang theo dõi' })
  return t
})

const userTracks = computed(() => props.tracks.filter(t => {
  const dbTrack = t as any
  return dbTrack.userId === props.userId
}))

const favoriteTracks = computed(() => {
  return props.tracks.filter(t => props.favoriteTrackIds.includes(t.id))
})

const loadProfile = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', props.userId)
      .maybeSingle()

    if (error) throw error
    profileData.value = data

    if (data) {
      editForm.username = data.username
      editForm.bio = data.bio || ''
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

const loadCounts = async () => {
  trackCount.value = userTracks.value.length
  followerCount.value = await getFollowerCount(props.userId)
  followingCount.value = await getFollowingCount(props.userId)
}

const loadFollowLists = async () => {
  followersList.value = await getFollowers(props.userId)
  followingList.value = await getFollowing(props.userId)
}

const handleFollowToggle = async () => {
  if (!currentUser.value) return
  followLoading.value = true
  try {
    if (isFollowingUser.value) {
      await unfollow(props.userId)
    } else {
      await follow(props.userId)
    }
    followerCount.value = await getFollowerCount(props.userId)
  } catch (error) {
    console.error('Error toggling follow:', error)
  } finally {
    followLoading.value = false
  }
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !currentUser.value) return

  try {
    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${currentUser.value.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath)

    const result = await updateProfile({ avatar_url: publicUrl + '?t=' + Date.now() })
    if (result.success) {
      await loadProfile()
      emit('profile-updated')
    }
  } catch (error) {
    console.error('Error uploading avatar:', error)
  }
}

const handleSaveProfile = async () => {
  editError.value = ''
  editSaving.value = true

  try {
    const result = await updateProfile({
      username: editForm.username.trim(),
      bio: editForm.bio.trim() || undefined
    })

    if (result.success) {
      await loadProfile()
      showEditModal.value = false
      emit('profile-updated')
    } else {
      const msg = result.error || ''
      if (msg.includes('duplicate key') || msg.includes('username')) {
        editError.value = 'Tên người dùng đã được sử dụng'
      } else {
        editError.value = msg
      }
    }
  } catch (error: any) {
    editError.value = error.message || 'Lỗi khi lưu'
  } finally {
    editSaving.value = false
  }
}

watch(() => props.userId, () => {
  activeTab.value = 'tracks'
  loadProfile()
  loadCounts()
  loadFollowLists()
  if (currentUser.value) {
    fetchFollowing(currentUser.value.id)
  }
})

watch(activeTab, (tab) => {
  if (tab === 'followers' || tab === 'following') {
    loadFollowLists()
  }
})

onMounted(() => {
  loadProfile()
  loadCounts()
  if (currentUser.value) {
    fetchFollowing(currentUser.value.id)
  }
})
</script>
