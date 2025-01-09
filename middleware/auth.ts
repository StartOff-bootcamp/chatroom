export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  // If user is not logged in and trying to access a protected route
  if (!user.value) {
    // For the index page or protected routes, redirect to login
    if (to.path === '/' || to.path !== '/login') {
      return navigateTo('/login');
    }
  }
});
