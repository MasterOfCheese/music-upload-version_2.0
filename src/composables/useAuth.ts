import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/Profile'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const profile = ref<Profile | null>(null)
const loading = ref(true)

export function useAuth() {
  const isLoggedIn = computed(() => !!user.value)
  const username = computed(() => profile.value?.username ?? '')

  const getSession = async () => {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
      if (user.value) {
        await fetchProfile(user.value.id)
      }
    } catch (error) {
      console.error('Error getting session:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }
      profile.value = data
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email: string, password: string, usernameInput: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: usernameInput,
          }
        }
      })

      if (error) throw error

      user.value = data.user
      if (data.user) {
        await fetchProfile(data.user.id)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error signing up:', error)
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      user.value = data.user
      if (data.user) {
        await fetchProfile(data.user.id)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error signing in:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      user.value = null
      profile.value = null
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates: { username?: string; bio?: string; avatar_url?: string }) => {
    if (!user.value) return { success: false, error: 'Not authenticated' }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)

      if (error) throw error

      if (profile.value) {
        profile.value = { ...profile.value, ...updates }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
  }

  const initAuth = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      ;(async () => {
        if (event === 'SIGNED_IN' && session?.user) {
          user.value = session.user
          await fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          profile.value = null
        }
      })()
    })

    getSession()
  }

  return {
    user,
    profile,
    loading,
    isLoggedIn,
    username,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchProfile,
    initAuth
  }
}
