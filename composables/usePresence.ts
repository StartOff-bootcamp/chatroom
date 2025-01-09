import { type RealtimePresenceState } from '@supabase/supabase-js'

interface Profile {
  id: string;
  name?: string;
  avatar_url?: string;
  status?: string;
}

interface UserMetadata {
  avatar_url?: string;
  picture?: string;
  full_name?: string;
}

interface PresenceUser {
  user_id: string;
  email: string;
  name?: string;
  avatar_url?: string | null;
  status?: string;
  user_metadata?: UserMetadata;
  online_at?: string;
}

export const usePresence = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const onlineUsers = ref<PresenceUser[]>([])
  const presenceChannel = ref()

  // Get user's avatar URL
  const getUserAvatarUrl = (userData: { user_metadata?: UserMetadata; avatar_url?: string }) => {
    // Try Google picture first
    if (userData.user_metadata?.picture) {
      return userData.user_metadata.picture
    }
    // Then try avatar_url from metadata
    if (userData.user_metadata?.avatar_url) {
      return userData.user_metadata.avatar_url
    }
    // Then try profile avatar
    if (userData.avatar_url) {
      return userData.avatar_url
    }
    return null
  }

  // Track online users
  const trackPresence = async () => {
    if (!user.value) return

    // Get user's profile including status
    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single() as { data: Profile | null }

    // Join the presence channel
    presenceChannel.value = client.channel('online-users', {
      config: {
        presence: {
          key: user.value.id,
        },
      },
    })

    // Handle presence state changes
    presenceChannel.value.on('presence', { event: 'sync' }, async () => {
      const state = presenceChannel.value.presenceState() as RealtimePresenceState
      const newOnlineUsers: PresenceUser[] = []

      // Get all user IDs from presence state
      const userIds = Object.values(state).flatMap(presence => 
        presence.length > 0 ? [(presence[0] as any).user_id] : []
      )

      // Fetch profiles for all online users
      const { data: profiles } = await client
        .from('profiles')
        .select('*')
        .in('id', userIds) as { data: Profile[] | null }

      // Create a map of profiles by user ID
      const profileMap = new Map(
        (profiles || []).map(profile => [profile.id, profile])
      )

      // Convert presence state to array of users
      for (const presence of Object.values(state)) {
        if (presence.length > 0) {
          const userData = presence[0] as any
          const userProfile = profileMap.get(userData.user_id)
          
          newOnlineUsers.push({
            user_id: userData.user_id,
            email: userData.email,
            name: userProfile?.name || userData.name || userData.email?.split('@')[0],
            avatar_url: getUserAvatarUrl({ 
              user_metadata: userData.user_metadata,
              avatar_url: userProfile?.avatar_url 
            }),
            status: userProfile?.status,
            user_metadata: userData.user_metadata
          })
        }
      }

      onlineUsers.value = newOnlineUsers
    })

    // Track the current user's presence
    await presenceChannel.value.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED' && user.value) {
        await presenceChannel.value.track({
          user_id: user.value.id,
          email: user.value.email,
          name: profile?.name || user.value.user_metadata?.full_name,
          avatar_url: getUserAvatarUrl({ 
            user_metadata: user.value.user_metadata as UserMetadata,
            avatar_url: profile?.avatar_url 
          }),
          user_metadata: user.value.user_metadata,
          online_at: new Date().toISOString(),
        })
      }
    })
  }

  // Clean up presence tracking
  const cleanupPresence = async () => {
    if (presenceChannel.value) {
      await presenceChannel.value.unsubscribe()
      presenceChannel.value = null
    }
  }

  // Watch for user changes
  watch(user, async (newUser, oldUser) => {
    if (oldUser) {
      await cleanupPresence()
    }
    if (newUser) {
      await trackPresence()
    }
  }, { immediate: true })

  // Clean up on component unmount
  onUnmounted(async () => {
    await cleanupPresence()
  })

  return {
    onlineUsers,
  }
} 