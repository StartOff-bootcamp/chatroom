<script setup>
const user = useSupabaseUser();
const loading = ref(true);
const error = ref(null);

// Handle the auth callback
onMounted(async () => {
  try {
    const route = useRoute();
    const client = useSupabaseClient();

    // Exchange the code for a session
    const { error: err } = await client.auth.exchangeCodeForSession(
      route.query.code?.toString() || ""
    );

    if (err) throw err;

    // Redirect to home on success
    navigateTo("/");
  } catch (err) {
    error.value = err.message || "Er is een fout opgetreden";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full text-center">
      <template v-if="loading">
        <h2 class="text-2xl font-bold mb-4">Even geduld...</h2>
        <p class="text-gray-600">We verwerken je inloggegevens</p>
      </template>

      <template v-else-if="error">
        <h2 class="text-2xl font-bold mb-4 text-danger">Oeps!</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <NuxtLink
          to="/login"
          class="text-primary hover:text-opacity-80 transition-colors"
        >
          Terug naar inloggen
        </NuxtLink>
      </template>

      <template v-else-if="user">
        <h2 class="text-2xl font-bold mb-4 text-success">
          Succesvol ingelogd!
        </h2>
        <p class="text-gray-600 mb-4">Je wordt doorgestuurd...</p>
      </template>
    </div>
  </div>
</template>
