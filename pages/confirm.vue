<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 text-center">
      <div class="animate-pulse">
        <h2 class="text-2xl font-semibold text-gray-900">
          Confirming your login...
        </h2>
        <p class="mt-2 text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();

// Handle the redirect after successful authentication
onMounted(() => {
  const redirect = route.query.redirect?.toString() || "/";
  router.push(redirect);
});
</script>
