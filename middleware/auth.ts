export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login"];

  // If on login page and logged in, redirect to home
  if (to.path === "/login" && user.value) {
    return navigateTo("/");
  }

  // If not on a public route and not logged in, redirect to login
  if (!publicRoutes.includes(to.path) && !user.value) {
    return navigateTo("/login");
  }
});
