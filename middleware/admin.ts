export default defineNuxtRouteMiddleware((to, from) => {
  const { isAdmin, isAuthenticated } = useAuth()
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  // If user is not admin, redirect to home
  if (!isAdmin.value) {
    return navigateTo('/')
  }
}) 