<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 text-center">
      <div class="animate-pulse">
        <h2 class="text-2xl font-semibold text-gray-900">
          Bezig met inloggen...
        </h2>
        <p class="mt-2 text-gray-600">Een moment geduld alstublieft.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const client = useSupabaseClient();
const route = useRoute();
const router = useRouter();

// Handle the authentication callback
onMounted(async () => {
  try {
    // Get the session after OAuth callback
    const { error: err } = await client.auth.getSession();
    if (err) throw err;

    // Get the redirect URL from query params and decode it
    const redirectTo = route.query.redirect?.toString();
    const decodedRedirect = redirectTo ? decodeURIComponent(redirectTo) : "/";

    // Redirect to the intended page or home
    await navigateTo(decodedRedirect);
  } catch (err) {
    console.error("Error during authentication:", err);
    // On error, redirect to login
    await navigateTo("/login");
  }
});
</script>
