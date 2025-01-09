export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/confirm'];

  // If user is not logged in and trying to access a protected route
  if (!user.value && !publicRoutes.includes(to.path)) {
    // If trying to access the home page, redirect to login
    if (to.path === '/') {
      return navigateTo('/login');
    }
    
    // For other protected routes, redirect to login with the return URL
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    });
  }

  // If user is logged in and trying to access login page, redirect to home
  if (user.value && publicRoutes.includes(to.path)) {
    return navigateTo('/');
  }
}); 