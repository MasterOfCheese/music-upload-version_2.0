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
          <p class="font-medium">Dung lượng tải bài hát là CÓ HẠN</p>
          <p class="font-bold"> Tối đa 1000MB</p>
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
            <span>Xử lý nhanh</span>
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

    <!-- Processing Progress (Local only) -->
    <div v-if="processingFiles.length > 0" class="mt-6 space-y-3">
      <h4 class="text-sm font-medium text-gray-900 dark:text-dark-900">
        Đang xử lý file...
      </h4>
      <div
        v-for="file in processingFiles"
        :key="file.name"
        class="glass-card p-4"
      >
        <div class="flex items-center space-x-3">
          <MusicalNoteIcon class="w-5 h-5 text-soundcloud-orange flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-dark-900 truncate">{{ file.name }}</p>
            <div class="flex items-center justify-between text-xs text-gray-600 dark:text-dark-600 mt-1">
              <span>{{ formatFileSize(file.size) }}</span>
              <span>{{ file.status }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2 mt-2">
              <div
                class="bg-gradient-to-r from-soundcloud-orange to-soundcloud-orange-light h-2 rounded-full transition-all duration-300"
                :style="{ width: `${file.progress}%` }"
              />
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
              {{ isSupabaseConnected ? 'Sẽ upload khi lưu' : 'Tạm thời (Local)' }}
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
          {{ isSaving ? (isSupabaseConnected ? 'Đang upload & lưu...' : 'Đang lưu...') : 'Lưu bài hát' }}
        </button>
      </div>
    </div>

    <!-- Upload Progress (Only shown during save) -->
    <div v-if="uploadingToSupabase" class="mt-6 space-y-3">
      <h4 class="text-sm font-medium text-gray-900 dark:text-dark-900">
        Đang upload lên Supabase...
      </h4>
      <div class="glass-card p-4">
        <div class="flex items-center space-x-3">
          <MusicalNoteIcon class="w-5 h-5 text-soundcloud-orange flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-dark-900 truncate">{{ uploadProgress.fileName }}</p>
            <div class="flex items-center justify-between text-xs text-gray-600 dark:text-dark-600 mt-1">
              <span>{{ uploadProgress.status }}</span>
              <span>{{ uploadProgress.speed }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2 mt-2">
              <div
                class="bg-gradient-to-r from-soundcloud-orange to-soundcloud-orange-light h-2 rounded-full transition-all duration-300"
                :style="{ width: `${uploadProgress.progress}%` }"
              />
            </div>
          </div>
          <span class="text-xs text-gray-600 dark:text-dark-600 font-medium">{{ uploadProgress.progress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CloudArrowUpIcon, MusicalNoteIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { supabase, uploadAudioFile, getAudioFileUrl, saveTrackToDatabase, checkStorageQuota } from '../lib/supabase'
import type { Track, DatabaseTrack } from '../types/Track'

interface ProcessingFile {
  name: string
  progress: number
  size: number
  status: string
}

interface PendingTrack {
  title: string
  artist: string
  file: File
  localUrl: string
  duration: number
  waveformData: number[]
}

interface UploadProgress {
  fileName: string
  progress: number
  status: string
  speed: string
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
const processingFiles = ref<ProcessingFile[]>([])
const pendingTrack = ref<PendingTrack | null>(null)
const showSizeWarning = ref(false)
const sizeWarningMessage = ref('')
const sizeWarningTitle = ref('')
const isSaving = ref(false)
const isSupabaseConnected = ref(false)
const storageQuota = ref<StorageQuota | null>(null)

// NEW: Upload progress tracking (only during save)
const uploadingToSupabase = ref(false)
const uploadProgress = ref<UploadProgress>({
  fileName: '',
  progress: 0,
  status: '',
  speed: ''
})

// Check Supabase connection and storage quota
const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('tracks').select('count').limit(1)
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

// Cleanup local URLs when component unmounts
onUnmounted(() => {
  if (pendingTrack.value) {
    URL.revokeObjectURL(pendingTrack.value.localUrl)
  }
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
  
  // Process file locally (no upload yet)
  processFileLocally(file)
}

// NEW: Process file locally without uploading to Supabase
const processFileLocally = async (file: File) => {
  const processingFile: ProcessingFile = {
    name: file.name,
    progress: 0,
    size: file.size,
    status: 'Đang chuẩn bị...'
  }
  
  processingFiles.value.push(processingFile)
  
  try {
    // Step 1: Create local URL
    processingFile.status = 'Tạo URL tạm thời...'
    processingFile.progress = 20
    const localUrl = URL.createObjectURL(file)
    
    // Step 2: Get audio duration
    processingFile.status = 'Đang phân tích thời lượng...'
    processingFile.progress = 40
    const duration = await getAudioDuration(file)
    
    // Step 3: Generate waveform
    processingFile.status = 'Tạo waveform...'
    processingFile.progress = 70
    const waveformData = await generateWaveformData(file)
    
    // Step 4: Complete
    processingFile.status = 'Hoàn thành!'
    processingFile.progress = 100
    
    // Create pending track (ready to save)
    pendingTrack.value = {
      title: file.name.split('.').slice(0, -1).join('.'),
      artist: 'Unknown Artist',
      file,
      localUrl,
      duration,
      waveformData
    }
    
    // Remove from processing list
    processingFiles.value = processingFiles.value.filter(f => f !== processingFile)
    
  } catch (error) {
    console.error('Error processing file locally:', error)
    processingFile.status = `Lỗi: ${(error as Error).message}`
    
    setTimeout(() => {
      processingFiles.value = processingFiles.value.filter(f => f !== processingFile)
    }, 5000)
  }
}

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src)
      resolve(audio.duration)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src)
      reject(new Error('Failed to load audio metadata.'))
    }
    audio.src = URL.createObjectURL(file)
  })
}

const generateWaveformData = async (file: File): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const audioBuffer = await audioContext.decodeAudioData(e.target?.result as ArrayBuffer)
        const rawData = audioBuffer.getChannelData(0)
        const samples = 100
        const blockSize = Math.floor(rawData.length / samples)
        const filteredData: number[] = []

        for (let i = 0; i < samples; i++) {
          let sum = 0
          const start = i * blockSize
          const end = (i + 1) * blockSize
          for (let j = start; j < end; j++) {
            sum += Math.abs(rawData[j])
          }
          filteredData.push(sum / blockSize)
        }
        resolve(filteredData)
      } catch (error) {
        reject(new Error('Error decoding audio data for waveform.'))
      }
    }
    reader.onerror = () => reject(new Error('Error reading file for waveform.'))
    reader.readAsArrayBuffer(file)
  })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getFileFormat = (fileName: string): string => {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.pop()!.toUpperCase() : 'N/A'
}

// UPDATED: Save track - now uploads to Supabase during save
const saveTrack = async () => {
  if (!pendingTrack.value) return
  
  isSaving.value = true
  
  try {
    let finalUrl = pendingTrack.value.localUrl
    let fileName: string | undefined
    
    // Upload to Supabase if connected
    if (isSupabaseConnected.value) {
      uploadingToSupabase.value = true
      fileName = `${Date.now()}-${pendingTrack.value.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      uploadProgress.value = {
        fileName: pendingTrack.value.file.name,
        progress: 0,
        status: 'Đang upload lên Supabase...',
        speed: ''
      }
      
      const startTime = Date.now()
      
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        if (uploadProgress.value.progress < 90) {
          uploadProgress.value.progress += Math.random() * 10 + 5
          const elapsed = (Date.now() - startTime) / 1000
          const bytesUploaded = (uploadProgress.value.progress / 100) * pendingTrack.value!.file.size
          const speed = bytesUploaded / elapsed
          uploadProgress.value.speed = `${formatSpeed(speed)}/s`
        }
      }, 300)
      
      try {
        await uploadAudioFile(pendingTrack.value.file, fileName)
        finalUrl = await getAudioFileUrl(fileName)
        
        clearInterval(uploadInterval)
        uploadProgress.value.progress = 100
        uploadProgress.value.status = 'Upload hoàn thành!'
        
        // Refresh storage quota
        storageQuota.value = await checkStorageQuota()
      } catch (error) {
        clearInterval(uploadInterval)
        uploadingToSupabase.value = false
        throw error
      }
    }
    
    // Save to database - Round duration to nearest integer
    const trackData: DatabaseTrack = {
      id: Date.now().toString(),
      title: pendingTrack.value.title,
      artist: pendingTrack.value.artist,
      file_name: fileName || '',
      duration: Math.round(pendingTrack.value.duration), // Fix: Round to integer
      file_size: pendingTrack.value.file.size,
      waveform_data: pendingTrack.value.waveformData,
      uploaded_at: new Date().toISOString(),
      play_count: 0
    }
    
    let savedTrack: Track
    
    if (isSupabaseConnected.value && fileName) {
      const dbTrack = await saveTrackToDatabase(trackData)
      savedTrack = {
        id: dbTrack.id,
        title: dbTrack.title,
        artist: dbTrack.artist,
        url: finalUrl,
        duration: dbTrack.duration,
        uploadedAt: new Date(dbTrack.uploaded_at),
        waveformData: dbTrack.waveform_data,
        fileName: dbTrack.file_name,
        fileSize: dbTrack.file_size,
        playCount: dbTrack.play_count || 0
      }
    } else {
      // For local storage
      savedTrack = {
        id: trackData.id,
        title: trackData.title,
        artist: trackData.artist,
        url: finalUrl,
        duration: trackData.duration,
        uploadedAt: new Date(trackData.uploaded_at),
        waveformData: trackData.waveform_data,
        fileSize: trackData.file_size,
        playCount: 0
      }
    }
    
    emit('upload-success', savedTrack)
    
    // Cleanup
    URL.revokeObjectURL(pendingTrack.value.localUrl)
    pendingTrack.value = null
    uploadingToSupabase.value = false
    
  } catch (error) {
    console.error('Error saving track:', error)
    alert('Có lỗi xảy ra khi lưu bài hát. Vui lòng thử lại.')
    uploadingToSupabase.value = false
  } finally {
    isSaving.value = false
  }
}

const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 1024) return `${Math.round(bytesPerSecond)} B`
  if (bytesPerSecond < 1024 * 1024) return `${Math.round(bytesPerSecond / 1024)} KB`
  return `${Math.round(bytesPerSecond / (1024 * 1024))} MB`
}

// UPDATED: Cancel upload - just cleanup local resources
const cancelUpload = () => {
  if (pendingTrack.value) {
    URL.revokeObjectURL(pendingTrack.value.localUrl)
    pendingTrack.value = null
  }
}
</script>

<style scoped>
.upload-zone {
  @apply border-2 border-dashed border-gray-300 dark:border-dark-300 rounded-2xl p-8 text-center transition-all duration-300 hover:border-soundcloud-orange hover:bg-orange-50/50 dark:hover:bg-soundcloud-orange/10 transform hover:scale-[1.02];
}

.upload-zone.dragover {
  @apply border-soundcloud-orange bg-orange-50 dark:bg-soundcloud-orange/20 scale-[1.02] shadow-glow;
}

.glass-card {
  @apply bg-white/80 dark:bg-dark-100/80 backdrop-blur-sm border border-gray-200/50 dark:border-dark-300/50 rounded-lg;
}

.input-field {
  @apply w-full px-4 py-3 bg-white/50 dark:bg-dark-100/50 border border-gray-300 dark:border-dark-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-soundcloud-orange focus:border-transparent transition-all duration-200 backdrop-blur-sm;
}

.btn {
  @apply px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-gradient-to-r from-soundcloud-orange to-soundcloud-orange-light text-white hover:shadow-glow focus:ring-soundcloud-orange;
}

.btn-secondary {
  @apply bg-white dark:bg-dark-100 text-gray-700 dark:text-dark-700 border border-gray-300 dark:border-dark-300 hover:bg-gray-50 dark:hover:bg-dark-200 focus:ring-blue-500;
}
</style>