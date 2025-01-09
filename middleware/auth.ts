export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/confirm']
  
  // If not on a public route and not authenticated, redirect to login
  if (!publicRoutes.includes(to.path) && !isAuthenticated.value) {
    return navigateTo('/login', { 
      replace: true,
      query: { redirect: to.fullPath }
    })
  }
})
