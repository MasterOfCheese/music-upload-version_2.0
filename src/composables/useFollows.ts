import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/Profile'

export function useFollows() {
  const followingIds = ref<string[]>([])
  const loading = ref(false)

  const fetchFollowing = async (userId: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)

      if (error) {
        console.error('Error fetching following:', error)
        return
      }
      followingIds.value = (data || []).map(f => f.following_id)
    } catch (error) {
      console.error('Error fetching following:', error)
    } finally {
      loading.value = false
    }
  }

  const follow = async (followingId: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { success: false, error: 'Not authenticated' }

    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: currentUser.id, following_id: followingId })

      if (error) throw error

      if (!followingIds.value.includes(followingId)) {
        followingIds.value.push(followingId)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error following:', error)
      return { success: false, error: error.message }
    }
  }

  const unfollow = async (followingId: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { success: false, error: 'Not authenticated' }

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', followingId)

      if (error) throw error

      followingIds.value = followingIds.value.filter(id => id !== followingId)

      return { success: true }
    } catch (error: any) {
      console.error('Error unfollowing:', error)
      return { success: false, error: error.message }
    }
  }

  const isFollowing = (userId: string) => {
    return followingIds.value.includes(userId)
  }

  const getFollowerCount = async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting follower count:', error)
      return 0
    }
  }

  const getFollowingCount = async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting following count:', error)
      return 0
    }
  }

  const getFollowers = async (userId: string): Promise<Profile[]> => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id, profiles!follows_follower_id_fkey(*)')
        .eq('following_id', userId)

      if (error) throw error
      return (data || []).map((f: any) => f.profiles)
    } catch (error) {
      console.error('Error getting followers:', error)
      return []
    }
  }

  const getFollowing = async (userId: string): Promise<Profile[]> => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id, profiles!follows_following_id_fkey(*)')
        .eq('follower_id', userId)

      if (error) throw error
      return (data || []).map((f: any) => f.profiles)
    } catch (error) {
      console.error('Error getting following:', error)
      return []
    }
  }

  return {
    followingIds,
    loading,
    fetchFollowing,
    follow,
    unfollow,
    isFollowing,
    getFollowerCount,
    getFollowingCount,
    getFollowers,
    getFollowing
  }
}
