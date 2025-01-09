<script setup>
const user = useSupabaseUser();
const client = useSupabaseClient();
const loading = ref(false);
const { auth } = useSupabaseClient();

const userProfile = ref({
  name: "",
  email: "",
  avatar_url: "",
  status: "",
});

// Load user profile data
async function loadProfile() {
  if (!user.value) return;

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.value.id)
    .single();

  if (data) {
    userProfile.value = data;
  }
}

// Update profile
async function updateProfile() {
  loading.value = true;
  try {
    const { error } = await client.from("profiles").upsert({
      id: user.value.id,
      name: userProfile.value.name,
      avatar_url: userProfile.value.avatar_url || null,
      status: userProfile.value.status || null,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating profile:", error);
  } finally {
    loading.value = false;
  }
}

// Sign out
async function signOut() {
  try {
    await auth.signOut();
    navigateTo("/");
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

// Load profile on mount
onMounted(() => {
  if (user.value) {
    loadProfile();
  }
});

// Watch for user changes
watch(user, (newUser) => {
  if (newUser) {
    loadProfile();
  }
});
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Profiel instellingen</h1>

    <template v-if="user">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form @submit.prevent="updateProfile" class="space-y-6">
          <!-- Avatar Preview -->
          <div
            class="flex flex-col items-center space-y-4 pb-6 border-b border-gray-200"
          >
            <UserAvatar
              :avatar-url="userProfile.avatar_url"
              :name="userProfile.name"
              :email="user.email"
              size="xl"
            />
            <p class="text-sm text-gray-500">
              {{
                userProfile.avatar_url
                  ? "Avatar URL gedetecteerd"
                  : "Standaard avatar"
              }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Naam
            </label>
            <input
              v-model="userProfile.name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              :value="user.email"
              disabled
              class="w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-50"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input
              v-model="userProfile.avatar_url"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
            />
            <p class="mt-1 text-sm text-gray-500">
              Voer een URL in naar een afbeelding voor je avatar, of laat leeg
              voor een letter-avatar
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Status bericht
            </label>
            <input
              v-model="userProfile.status"
              type="text"
              placeholder="Wat ben je aan het doen?"
              maxlength="50"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
            />
            <p class="mt-1 text-sm text-gray-500">
              Maximaal 50 karakters. Dit is zichtbaar voor andere gebruikers.
            </p>
          </div>

          <div class="flex justify-between items-center pt-4">
            <button
              type="submit"
              :disabled="loading"
              class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {{ loading ? "Bezig met opslaan..." : "Wijzigingen opslaan" }}
            </button>

            <button
              @click="signOut"
              type="button"
              class="text-danger hover:text-opacity-80 transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </form>
      </div>
    </template>

    <template v-else>
      <div class="text-center">
        <p class="text-lg mb-4">Log in om je profiel te bekijken</p>
        <NuxtLink
          to="/"
          class="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Naar inloggen
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
