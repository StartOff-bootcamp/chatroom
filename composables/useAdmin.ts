export const useAdmin = () => {
  const { isAdmin } = useAuth()
  const error = ref(null)
  const loading = ref(false)

  const setUserRole = async (userId: string, role: 'admin' | 'user') => {
    if (!isAdmin.value) {
      error.value = 'Je hebt geen toegang tot deze functie'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/admin/set-role', {
        method: 'POST',
        body: { userId, role }
      })
      return response.success
    } catch (err: any) {
      error.value = err.message || 'Er is een fout opgetreden'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    setUserRole,
    error,
    loading
  }
} 