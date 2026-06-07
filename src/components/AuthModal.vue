<template>
  <Teleport to="body">
    <div v-if="visible"
         class="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
         @click.self="$emit('close')">

      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <!-- Modal -->
      <div class="relative w-full max-w-[960px] mx-3 sm:mx-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col sm:flex-row animate-scale-in" style="max-height: 90vh;">

        <!-- Left Panel - SoundCloud-style orange gradient -->
        <div class="hidden sm:flex sm:w-[45%] relative bg-gradient-to-br from-[#FF5500] via-[#E64A00] to-[#cc4400] flex-col justify-between p-8 lg:p-10 overflow-hidden">
          <!-- Background pattern -->
          <div class="absolute inset-0 opacity-10">
            <div v-for="i in 20" :key="i" class="absolute rounded-full bg-white"
                 :style="{
                   width: (Math.random() * 80 + 20) + 'px',
                   height: (Math.random() * 80 + 20) + 'px',
                   top: (Math.random() * 100) + '%',
                   left: (Math.random() * 100) + '%',
                 }">
            </div>
          </div>

          <!-- Top: Logo + tagline -->
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-[#FF5500]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="text-white text-2xl font-bold tracking-tight">NamSound</span>
            </div>
            <h2 class="text-white text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
              {{ isLogin ? 'Chào mừng bạn quay lại' : 'Bắt đầu nghe nhạc miễn phí' }}
            </h2>
            <p class="text-white/80 text-base lg:text-lg leading-relaxed">
              {{ isLogin ? 'Đăng nhập để khám phá âm nhạc và kết nối với cộng đồng.' : 'Tham gia cộng đồng âm nhạc lớn nhất. Upload, chia sẻ và khám phá.' }}
            </p>
          </div>

          <!-- Bottom: Floating waveform decoration -->
          <div class="relative z-10 mt-8">
            <div class="flex items-end gap-[3px] h-16">
              <div v-for="(h, i) in waveformBars" :key="i"
                   class="w-2 rounded-full bg-white/40 transition-all duration-300"
                   :style="{ height: h + '%' }">
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile header bar -->
        <div class="sm:hidden bg-gradient-to-r from-[#FF5500] to-[#FF7733] p-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-[#FF5500]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span class="text-white text-lg font-bold">NamSound</span>
          </div>
          <button @click="$emit('close')" class="text-white/80 hover:text-white transition-colors">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Right Panel - Form -->
        <div class="flex-1 bg-white dark:bg-[#111827] overflow-y-auto">
          <div class="p-6 sm:p-8 lg:p-10">
            <!-- Close button (desktop) -->
            <div class="hidden sm:flex justify-end mb-2">
              <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-dark-600 transition-colors">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>

            <!-- Heading -->
            <h3 class="text-2xl sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {{ isLogin ? 'Đăng nhập' : 'Tạo tài khoản' }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-dark-500 mb-6">
              {{ isLogin ? 'Tiếp tục hành trình âm nhạc của bạn' : 'Tham gia NamSound ngay hôm nay' }}
            </p>

            <!-- OAuth Buttons -->
            <div class="space-y-3 mb-6">
              <!-- Google -->
              <button
                @click="handleOAuth('google')"
                :disabled="oauthLoading"
                class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-100 text-gray-700 dark:text-dark-700 font-medium text-sm hover:bg-gray-50 dark:hover:bg-dark-200 hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Tiếp tục với Google
              </button>

              <!-- Facebook -->
              <button
                @click="handleOAuth('facebook')"
                :disabled="oauthLoading"
                class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#1877F2] text-white font-medium text-sm hover:bg-[#166FE5] hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Tiếp tục với Facebook
              </button>

              <!-- GitHub -->
              <button
                @click="handleOAuth('github')"
                :disabled="oauthLoading"
                class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#24292F] text-white font-medium text-sm hover:bg-[#2f363d] hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Tiếp tục với GitHub
              </button>
            </div>

            <!-- Divider -->
            <div class="flex items-center gap-3 mb-6">
              <div class="flex-1 h-px bg-gray-200 dark:bg-dark-300"></div>
              <span class="text-xs font-medium text-gray-400 dark:text-dark-400 uppercase tracking-wider">hoặc</span>
              <div class="flex-1 h-px bg-gray-200 dark:bg-dark-300"></div>
            </div>

            <!-- Email/Password Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Username (signup only) -->
              <div v-if="!isLogin">
                <label class="block text-sm font-semibold text-gray-700 dark:text-dark-700 mb-1.5">Tên người dùng</label>
                <div class="relative">
                  <UserIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-dark-400" />
                  <input
                    v-model="form.username"
                    type="text"
                    required
                    class="auth-input pl-10"
                    placeholder="Chọn tên người dùng"
                    autocomplete="username"
                  />
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-dark-700 mb-1.5">Email</label>
                <div class="relative">
                  <EnvelopeIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-dark-400" />
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="auth-input pl-10"
                    placeholder="email@example.com"
                    autocomplete="email"
                  />
                </div>
              </div>

              <!-- Password -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-dark-700 mb-1.5">Mật khẩu</label>
                <div class="relative">
                  <LockClosedIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-dark-400" />
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    minlength="6"
                    class="auth-input pl-10 pr-10"
                    placeholder="Tối thiểu 6 ký tự"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-600 transition-colors"
                  >
                    <EyeIcon v-if="!showPassword" class="w-[18px] h-[18px]" />
                    <EyeSlashIcon v-else class="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>

              <!-- Error message -->
              <div v-if="error" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p class="text-sm text-red-600 dark:text-red-400 font-medium">{{ error }}</p>
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                :disabled="isSubmitting || !form.email || !form.password || (!isLogin && !form.username)"
                class="w-full py-3.5 rounded-lg bg-[#FF5500] hover:bg-[#E64A00] text-white font-bold text-sm transition-all duration-200 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
                <span v-else>{{ isLogin ? 'Đăng nhập' : 'Tạo tài khoản' }}</span>
              </button>
            </form>

            <!-- Toggle login/signup -->
            <div class="mt-6 pt-4 border-t border-gray-200 dark:border-dark-200 text-center">
              <p class="text-sm text-gray-500 dark:text-dark-500">
                {{ isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?' }}
                <button
                  @click="toggleMode"
                  class="text-[#FF5500] hover:text-[#E64A00] font-semibold ml-1 transition-colors"
                >
                  {{ isLogin ? 'Đăng ký ngay' : 'Đăng nhập' }}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  XMarkIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'
import { useAuth } from '../composables/useAuth'

interface Props {
  visible: boolean
  defaultMode?: 'login' | 'signup'
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  defaultMode: 'login'
})

const emit = defineEmits<Emits>()
const { signIn, signUp, signInWithOAuth } = useAuth()

const isLogin = ref(props.defaultMode === 'login')
const isSubmitting = ref(false)
const oauthLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
  username: ''
})

const waveformBars = computed(() => {
  const bars = []
  for (let i = 0; i < 30; i++) {
    bars.push(Math.random() * 70 + 15)
  }
  return bars
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}

const handleOAuth = async (provider: 'google' | 'github' | 'facebook') => {
  error.value = ''
  oauthLoading.value = true

  try {
    const result = await signInWithOAuth(provider)
    if (!result.success) {
      const msg = result.error || ''
      if (msg.includes('provider is not enabled')) {
        error.value = `${provider.charAt(0).toUpperCase() + provider.slice(1)} chưa được bật. Vui lòng dùng email/password.`
      } else {
        error.value = msg
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Lỗi đăng nhập OAuth'
  } finally {
    oauthLoading.value = false
  }
}

const handleSubmit = async () => {
  error.value = ''
  isSubmitting.value = true

  try {
    let result
    if (isLogin.value) {
      result = await signIn(form.email, form.password)
    } else {
      if (!form.username.trim()) {
        error.value = 'Vui lòng nhập tên người dùng'
        isSubmitting.value = false
        return
      }
      result = await signUp(form.email, form.password, form.username.trim())
    }

    if (result.success) {
      form.email = ''
      form.password = ''
      form.username = ''
      emit('success')
      emit('close')
    } else {
      const msg = result.error || ''
      if (msg.includes('Invalid login credentials')) {
        error.value = 'Email hoặc mật khẩu không đúng'
      } else if (msg.includes('already registered')) {
        error.value = 'Email này đã được đăng ký'
      } else if (msg.includes('Password should be')) {
        error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
      } else if (msg.includes('duplicate key') && msg.includes('username')) {
        error.value = 'Tên người dùng đã được sử dụng'
      } else {
        error.value = msg
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Đã xảy ra lỗi'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.auth-input {
  @apply w-full py-3 pr-4 bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-dark-300 rounded-lg text-sm text-gray-900 dark:text-dark-900 placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-[#FF5500] focus:border-transparent transition-all duration-200;
}
</style>
