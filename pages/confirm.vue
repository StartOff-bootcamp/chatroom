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
const route = useRoute();

// Handle the redirect after successful authentication
onMounted(() => {
  const redirect = route.query.redirect?.toString() || "/";
  navigateTo(redirect);
});
</script>
