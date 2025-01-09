<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <h2 class="text-xl font-medium">Bezig met inloggen...</h2>
          <p class="mt-2 text-sm text-gray-500">
            Een moment geduld alstublieft
          </p>

          <div v-if="error" class="mt-4 rounded-md bg-danger/10 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-danger">
                  {{ error }}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const error = ref(null);

// Handle the authentication callback
onMounted(async () => {
  try {
    const { error: err } = await useSupabaseClient().auth.getSession();
    if (err) throw err;

    // Get the redirect URL from query params
    const redirectTo = route.query.redirect?.toString() || "/";

    // Redirect to the intended page or home
    navigateTo(redirectTo, { replace: true });
  } catch (err) {
    error.value = err.message || "Er is een fout opgetreden bij het inloggen";
  }
});
</script>
