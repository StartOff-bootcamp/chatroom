import { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const user = useSupabaseUser()
  
  const isAdmin = computed(() => {
    return user.value?.user_metadata?.role === 'admin'
  })

  const isAuthenticated = computed(() => {
    return !!user.value
  })

  return {
    user,
    isAdmin,
    isAuthenticated
  }
} 