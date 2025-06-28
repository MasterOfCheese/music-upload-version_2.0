<template>
  <div>
    <!-- Supabase Connection Status -->
    <div v-if="!isSupabaseConnected" class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div class="flex items-center space-x-2">
        <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <div class="text-sm text-yellow-800 dark:text-yellow-200">
          <p class="font-medium">Chưa kết nối Supabase</p>
          <p>Vui lòng kết nối Supabase để lưu trữ file nhạc vĩnh viễn. File upload sẽ chỉ tồn tại trong phiên hiện tại.</p>
        </div>
      </div>
    </div>

    <!-- File Size Info -->
    <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-center space-x-2">
        <InformationCircleIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div class="text-sm text-blue-800 dark:text-blue-200">
          <p class="font-medium">Giới hạn kích thước file</p>
          <p>
            <span class="font-semibold">Supabase:</span> Tối đa {{ supabaseMaxSizeMB }}MB (Free tier) | 
            <span class="font-semibold">Local:</span> Tối đa {{ localMaxSizeMB }}MB
          </p>
          <p class="text-xs mt-1 font-medium">
            <strong>Lưu ý:</strong> Cấm tuyệt đối ae up nhạc quá dài, sập server không có cái mà dùng:)))
          </p>
          <div v-if="storageQuota" class="text-xs mt-2 p-2 bg-blue-100 dark:bg-blue-800 rounded">
            <div class="flex justify-between">
              <span>Đã sử dụng:</span>
              <span class="font-medium">{{ storageQuota.used }}MB / {{ storageQuota.limit }}MB</span>
            </div>
            <div class="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-1 mt-1">
              <div 
                class="bg-blue-600 h-1 rounded-full" 
                :style="{ width: `${(storageQuota.used / storageQuota.limit) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Zone -->
    <div
      ref="uploadZone"
      class="upload-zone"
      :class="{ 'dragover': isDragOver }"
      @click="triggerFileInput"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="audio/mp3,audio/mpeg,audio/wav,audio/flac,audio/m4a,audio/aac,audio/ogg"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
      
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-gradient-to-br from-soundcloud-orange/20 to-soundcloud-orange-light/20 rounded-full flex items-center justify-center mb-4">
          <CloudArrowUpIcon class="w-8 h-8 text-soundcloud-orange" />
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 dark:text-dark-900 mb-2">
          {{ isDragOver ? 'Thả file vào đây' : 'Upload File Nhạc' }}
        </h3>
        
        <p class="text-sm text-gray-600 dark:text-dark-600 mb-4 text-center font-medium">
          Kéo thả file hoặc click để chọn<br>
          <span class="text-xs">Hỗ trợ MP3, WAV, FLAC, M4A, AAC, OGG</span>
        </p>
        
        <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-dark-500">
          <div class="flex items-center space-x-1">
            <div class="w-2 h-2 rounded-full" :class="isSupabaseConnected ? 'bg-green-500' : 'bg-yellow-500'"></div>
            <span>{{ isSupabaseConnected ? 'Lưu trữ vĩnh viễn' : 'Lưu trữ tạm thời' }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Upload nhanh</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Tự động tạo waveform</span>
          </div>
        </div>
      </div>
    </div>

    <!-- File Size Warning -->
    <div v-if="showSizeWarning" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-center space-x-2">
        <ExclamationTriangleIcon class="w-5 h-5 text-red-600 dark:text-red-400" />
        <div class="text-sm text-red-800 dark:text-red-200">
          <p class="font-medium">{{ sizeWarningTitle }}</p>
          <p>{{ sizeWarningMessage }}</p>
          <div class="mt-2 text-xs">
            <p><strong>Gợi ý giảm kích thước:</strong></p>
            <ul class="list-disc list-inside space-y-1">
              <li>Chuyển từ FLAC/WAV sang MP3 (giảm 70-80% kích thước)</li>
              <li>Giảm bitrate: 320kbps → 256kbps → 192kbps → 128kbps</li>
              <li>Cắt bớt phần im lặng đầu/cuối bài</li>
              <li>Sử dụng công cụ nén: 
                <a href='https://www.freeconvert.com/audio-compressor' target="_blank" class="text-blue-600 underline">FreeConvert</a>, 
                <a href='https://www.media.io/audio-compressor.html' target="_blank" class="text-blue-600 underline">Media.io</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploadingFiles.length > 0" class="mt-6 space-y-3">
      <h4 class="text-sm font-medium text-gray-900 dark:text-dark-900">
        {{ isSupabaseConnected ? 'Đang upload lên Supabase...' : 'Đang xử lý file...' }}
      </h4>
      <div
        v-for="file in uploadingFiles"
        :key="file.name"
        class="glass-card p-4"
      >
        <div class="flex items-center space-x-3">
          <MusicalNoteIcon class="w-5 h-5 text-soundcloud-orange flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-dark-900 truncate">{{ file.name }}</p>
            <div class="flex items-center justify-between text-xs text-gray-600 dark:text-dark-600 mt-1">
              <span>{{ formatFileSize(file.size) }}</span>
              <span>{{ file.speed }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2 mt-2">
              <div
                class="bg-gradient-to-r from-soundcloud-orange to-soundcloud-orange-light h-2 rounded-full transition-all duration-300"
                :style="{ width: `${file.progress}%` }"
              />
            </div>
            <div v-if="file.status" class="text-xs mt-1" :class="file.error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-dark-700'">
              {{ file.status }}
            </div>
          </div>
          <span class="text-xs text-gray-600 dark:text-dark-600 font-medium">{{ file.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- Track Info Form -->
    <div v-if="pendingTrack" class="mt-6 space-y-4">
      <h4 class="text-sm font-medium text-gray-900 dark:text-dark-900">Thông tin bài hát</h4>
      
      <div>
        <label class="block text-sm font-medium text-gray-800 dark:text-dark-800 mb-2">Tên bài hát *</label>
        <input
          v-model="pendingTrack.title"
          type="text"
          required
          class="input-field"
          placeholder="Nhập tên bài hát"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-800 dark:text-dark-800 mb-2">Nghệ sĩ *</label>
        <input
          v-model="pendingTrack.artist"
          type="text"
          required
          class="input-field"
          placeholder="Nhập tên nghệ sĩ"
        />
      </div>

      <!-- File Info Display -->
      <div class="bg-gray-50 dark:bg-dark-200 rounded-lg p-3">
        <div class="text-xs text-gray-700 dark:text-dark-700 space-y-1">
          <div class="flex justify-between">
            <span>Kích thước:</span>
            <span>{{ formatFileSize(pendingTrack.file.size) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Thời lượng:</span>
            <span>{{ formatDuration(pendingTrack.duration) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Định dạng:</span>
            <span>{{ getFileFormat(pendingTrack.file.name) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Lưu trữ:</span>
            <span class="font-medium" :class="isSupabaseConnected ? 'text-green-600' : 'text-yellow-600'">
              {{ isSupabaseConnected ? 'Vĩnh viễn (Supabase)' : 'Tạm thời (Local)' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="cancelUpload"
          class="flex-1 btn btn-secondary"
          :disabled="isSaving"
        >
          Hủy
        </button>
        <button
          @click="saveTrack"
          :disabled="!pendingTrack.title || !pendingTrack.artist || isSaving"
          class="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSaving ? 'Đang lưu...' : 'Lưu bài hát' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CloudArrowUpIcon, MusicalNoteIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { supabase, uploadAudioFile, getAudioFileUrl, saveTrackToDatabase, checkStorageQuota } from '../lib/supabase'
import type { Track, DatabaseTrack } from '../types/Track'

interface UploadingFile {
  name: string
  progress: number
  size: number
  speed: string
  status?: string
  error?: boolean
}

interface PendingTrack {
  title: string
  artist: string
  file: File
  url: string
  duration: number
  fileName?: string
}

interface StorageQuota {
  used: number
  limit: number
  remaining: number
}

interface Emits {
  (e: 'upload-success', track: Track): void
}

const emit = defineEmits<Emits>()

// Cập nhật giới hạn kích thước file theo thực tế của Supabase
const supabaseMaxSizeMB = ref(50) // Supabase Free tier limit: 50MB per file
const localMaxSizeMB = ref(200) // Local storage limit: 200MB
const supabaseMaxSizeBytes = supabaseMaxSizeMB.value * 1024 * 1024
const localMaxSizeBytes = localMaxSizeMB.value * 1024 * 1024

const fileInput = ref<HTMLInputElement>()
const uploadZone = ref<HTMLElement>()
const isDragOver = ref(false)
const uploadingFiles = ref<UploadingFile[]>([])
const pendingTrack = ref<PendingTrack | null>(null)
const showSizeWarning = ref(false)
const sizeWarningMessage = ref('')
const sizeWarningTitle = ref('')
const isSaving = ref(false)
const isSupabaseConnected = ref(false)
const storageQuota = ref<StorageQuota | null>(null)

// Check Supabase connection and storage quota
const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('tracks').select('count').limit(1)
    isSupabaseConnected.value = !error
    
    if (isSupabaseConnected.value) {
      storageQuota.value = await checkStorageQuota()
    }
  } catch (error) {
    isSupabaseConnected.value = false
  }
}

onMounted(() => {
  checkSupabaseConnection()
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  if (!uploadZone.value?.contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  handleFiles(files)
}

const handleFileSelect = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  handleFiles(files)
}

const handleFiles = (files: File[]) => {
  showSizeWarning.value = false
  
  const audioFiles = files.filter(file => 
    file.type.startsWith('audio/') || 
    /\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file.name)
  )
  
  if (audioFiles.length === 0) {
    alert('Vui lòng chọn file nhạc hợp lệ.')
    return
  }
  
  if (audioFiles.length > 1) {
    alert('Vui lòng upload từng file một.')
    return
  }
  
  const file = audioFiles[0]
  const fileSizeMB = Math.round(file.size / (1024 * 1024))
  
  // Kiểm tra giới hạn kích thước dựa trên loại storage
  const maxSize = isSupabaseConnected.value ? supabaseMaxSizeBytes : localMaxSizeBytes
  const maxSizeMB = isSupabaseConnected.value ? supabaseMaxSizeMB.value : localMaxSizeMB.value
  
  if (file.size > maxSize) {
    showSizeWarning.value = true
    sizeWarningTitle.value = 'File quá lớn!'
    
    if (isSupabaseConnected.value) {
      sizeWarningMessage.value = `Supabase Free tier chỉ hỗ trợ file tối đa ${maxSizeMB}MB. File của bạn: ${fileSizeMB}MB. Vui lòng nén file hoặc nâng cấp Supabase plan.`
    } else {
      sizeWarningMessage.value = `Kích thước tối đa cho phép: ${maxSizeMB}MB. File của bạn: ${fileSizeMB}MB.`
    }
    return
  }
  
  // Kiểm tra storage quota nếu dùng Supabase
  if (isSupabaseConnected.value && storageQuota.value) {
    const fileWillExceedQuota = (storageQuota.value.used + fileSizeMB) > storageQuota.value.limit
    if (fileWillExceedQuota) {
      showSizeWarning.value = true
      sizeWarningTitle.value = 'Không đủ dung lượng!'
      sizeWarningMessage.value = `File ${fileSizeMB}MB sẽ vượt quá giới hạn storage. Đã sử dụng: ${storageQuota.value.used}MB/${storageQuota.value.limit}MB.`
      return
    }
  }
  
  uploadFile(file)
}

const uploadFile = async (file: File) => {
  const uploadingFile: UploadingFile = {
    name: file.name,
    progress: 0,
    size: file.size,
    speed: 'Đang chuẩn bị...',
    status: 'Đang xử lý file...',
    error: false
  }
  
  uploadingFiles.value.push(uploadingFile)
  
  try {
    const startTime = Date.now()
    
    // Get audio duration first
    uploadingFile.status = 'Đang phân tích file...'
    const duration = await getAudioDuration(file)
    uploadingFile.progress = 20
    
    let url: string
    let fileName: string | undefined
    
    if (isSupabaseConnected.value) {
      // Upload to Supabase Storage
      uploadingFile.status = 'Đang upload lên Supabase...'
      fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        if (uploadingFile.progress < 90) {
          uploadingFile.progress += Math.random() * 10 + 5
          const elapsed = (Date.now() - startTime) / 1000
          const bytesUploaded = (uploadingFile.progress / 100) * file.size
          const speed = bytesUploaded / elapsed
          uploadingFile.speed = `${formatSpeed(speed)}/s`
        }
      }, 300)
      
      try {
        await uploadAudioFile(file, fileName)
        url = await getAudioFileUrl(fileName)
        clearInterval(uploadInterval)
        uploadingFile.progress = 100
        uploadingFile.status = 'Upload hoàn thành!'
        
        // Refresh storage quota
        storageQuota.value = await checkStorageQuota()
      } catch (error) {
        clearInterval(uploadInterval)
        uploadingFile.error = true
        uploadingFile.status = (error as Error).message
        uploadingFile.speed = 'Thất bại'
        
        // Remove failed upload after 10 seconds
        setTimeout(() => {
          uploadingFiles.value = uploadingFiles.value.filter(f => f !== uploadingFile)
        }, 10000)
        return
      }
    } else {
      // Use local object URL
      uploadingFile.status = 'Tạo URL tạm thời...'
      url = URL.createObjectURL(file)
      
      // Simulate processing time
      const processInterval = setInterval(() => {
        uploadingFile.progress += Math.random() * 15 + 10
        if (uploadingFile.progress >= 100) {
          uploadingFile.progress = 100
          uploadingFile.status = 'Xử lý hoàn thành!'
          clearInterval(processInterval)
        }
      }, 200)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Remove from uploading list
    uploadingFiles.value = uploadingFiles.value.filter(f => f !== uploadingFile)
    
    // Create pending track
    pendingTrack.value = {
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: 'Nghệ sĩ chưa xác định',
      file,
      url,
      duration,
      fileName
    }
    
  } catch (error) {
    console.error('Upload error:', error)
    uploadingFile.error = true
    uploadingFile.status = 'Lỗi: ' + (error as Error).message
    uploadingFile.speed = 'Thất bại'
    
    // Remove failed upload after 10 seconds
    setTimeout(() => {
      uploadingFiles.value = uploadingFiles.value.filter(f => f !== uploadingFile)
    }, 10000)
  }
}

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
      URL.revokeObjectURL(audio.src)
    })
    audio.addEventListener('error', () => {
      reject(new Error('Không thể đọc file audio'))
    })
    audio.src = URL.createObjectURL(file)
  })
}

const saveTrack = async () => {
  if (!pendingTrack.value) return;

  isSaving.value = true;

  try {
    const trackData: Track = {
      id: Date.now().toString(),
      title: pendingTrack.value.title,
      artist: pendingTrack.value.artist,
      url: pendingTrack.value.url,
      duration: Math.floor(pendingTrack.value.duration), // Làm tròn xuống để đảm bảo số nguyên
      uploadedAt: new Date(),
      waveformData: generateWaveformData(),
      fileName: pendingTrack.value.fileName,
      fileSize: Math.floor(pendingTrack.value.file.size) // Đảm bảo fileSize là số nguyên
    };

    if (isSupabaseConnected.value && pendingTrack.value.fileName) {
      const dbTrack: Omit<DatabaseTrack, 'created_at' | 'updated_at'> = {
        id: trackData.id,
        title: trackData.title,
        artist: trackData.artist,
        file_name: pendingTrack.value.fileName,
        duration: Math.floor(trackData.duration), // Đảm bảo số nguyên
        file_size: Math.floor(trackData.fileSize || 0), // Đảm bảo số nguyên
        waveform_data: trackData.waveformData,
        uploaded_at: trackData.uploadedAt.toISOString()
      };

      await saveTrackToDatabase(dbTrack);
    }

    emit('upload-success', trackData);
    pendingTrack.value = null;
  } catch (error) {
    console.error('Error saving track:', error);
    alert('Lỗi khi lưu bài hát: ' + (error as Error).message);
  } finally {
    isSaving.value = false;
  }
}

const cancelUpload = () => {
  if (pendingTrack.value) {
    if (!isSupabaseConnected.value) {
      URL.revokeObjectURL(pendingTrack.value.url)
    }
    pendingTrack.value = null
  }
  showSizeWarning.value = false
  isSaving.value = false
}

const generateWaveformData = (): number[] => {
  const data = []
  for (let i = 0; i < 100; i++) {
    const base = Math.sin(i * 0.1) * 0.5 + 0.5
    const noise = Math.random() * 0.3
    data.push(Math.max(0.1, Math.min(1, base + noise)))
  }
  return data
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getFileFormat = (filename: string): string => {
  const extension = filename.split('.').pop()?.toUpperCase()
  return extension || 'Unknown'
}
</script>