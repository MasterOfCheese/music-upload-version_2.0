export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
  // Computed counts (joined or counted separately)
  track_count?: number
  follower_count?: number
  following_count?: number
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  // Joined profile info
  follower_profile?: Profile
  following_profile?: Profile
}
