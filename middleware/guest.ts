export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  // If user is already logged in and trying to access auth pages
  if (user.value) {
    // Redirect to home page
    return navigateTo('/');
  }
}); 