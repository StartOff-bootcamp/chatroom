export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()
  
  // If user is authenticated, redirect to home
  if (isAuthenticated.value) {
    return navigateTo('/')
  }
}) 