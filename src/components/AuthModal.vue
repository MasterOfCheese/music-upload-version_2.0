<template>
  <Teleport to="body">
    <div v-if="visible"
         class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in"
         @click.self="$emit('close')">
      <div class="glass-card max-w-md w-full p-4 sm:p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg sm:text-xl font-semibold gradient-text">
            {{ isLogin ? 'Đăng nhập' : 'Đăng ký' }}
          </h2>
          <button @click="$emit('close')" class="btn-icon text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Username (signup only) -->
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-gray-800 dark:text-dark-800 mb-2">Tên người dùng</label>
            <input
              v-model="form.username"
              type="text"
              required
              class="input-field"
              placeholder="Chọn tên người dùng"
              autocomplete="username"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-800 dark:text-dark-800 mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="Nhập email của bạn"
              autocomplete="email"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-800 dark:text-dark-800 mb-2">Mật khẩu</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="input-field"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              autocomplete="current-password"
            />
          </div>

          <!-- Error message -->
          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400 font-medium">{{ error }}</p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="isSubmitting || !form.email || !form.password || (!isLogin && !form.username)"
            class="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký') }}
          </button>
        </form>

        <!-- Toggle login/signup -->
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-600 dark:text-dark-600">
            {{ isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?' }}
            <button
              @click="toggleMode"
              class="text-soundcloud-orange hover:text-soundcloud-orange-dark font-medium ml-1"
            >
              {{ isLogin ? 'Đăng ký' : 'Đăng nhập' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
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
const { signIn, signUp } = useAuth()

const isLogin = ref(props.defaultMode === 'login')
const isSubmitting = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  username: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
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
      // Translate common error messages
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
