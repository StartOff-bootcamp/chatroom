<template>
  <div class="space-y-8">
    <!-- User Management Section -->
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">Gebruikersbeheer</h2>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-danger/10 text-danger px-4 py-2 rounded-lg">
        {{ error }}
      </div>

      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="mt-6 space-y-4">
            <div class="flex items-center space-x-4">
              <input
                v-model="userEmail"
                type="email"
                placeholder="Email van gebruiker"
                class="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              <button
                @click="makeAdmin"
                :disabled="loading"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {{ loading ? "Bezig..." : "Maak Admin" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Channels Section -->
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">Kanalen beheer</h2>
        <NuxtLink
          to="/channels/new"
          class="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Nieuw kanaal
        </NuxtLink>
      </div>

      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="mt-6 flow-root">
            <ul role="list" class="-my-5 divide-y divide-gray-200">
              <li v-for="channel in channels" :key="channel.id" class="py-4">
                <div class="flex items-center space-x-4">
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-gray-900">
                      {{ channel.name }}
                    </p>
                    <p class="truncate text-sm text-gray-500">
                      {{ channel.description }}
                    </p>
                  </div>
                  <div class="flex shrink-0 space-x-2">
                    <button
                      @click="editChannel(channel)"
                      class="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Bewerken
                    </button>
                    <button
                      @click="deleteChannel(channel.id)"
                      class="inline-flex items-center rounded-md bg-danger px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-danger/90"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Channel Modal -->
  <ChannelModal
    v-model="showNewChannelModal"
    :channel="editingChannel"
    @save="onChannelSave"
  />
</template>

<script setup>
definePageMeta({
  middleware: ["admin"],
});

const { setUserRole } = useAdmin();
const client = useSupabaseClient();
const loading = ref(false);
const error = ref(null);
const userEmail = ref("");
const showNewChannelModal = ref(false);
const editingChannel = ref(null);

// Fetch channels
const { data: channels, refresh: refreshChannels } = await useFetch(
  "/api/channels"
);

async function makeAdmin() {
  if (!userEmail.value) {
    error.value = "Vul een email adres in";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // First get the user ID from the email
    const { data: users, error: userError } = await client
      .from("profiles")
      .select("id")
      .eq("email", userEmail.value)
      .single();

    if (userError) throw userError;
    if (!users) throw new Error("Gebruiker niet gevonden");

    // Set the user as admin
    const success = await setUserRole(users.id, "admin");
    if (success) {
      userEmail.value = "";
      error.value = null;
    }
  } catch (err) {
    error.value = err.message || "Er is een fout opgetreden";
  } finally {
    loading.value = false;
  }
}

// Channel management functions
const editChannel = (channel) => {
  editingChannel.value = channel;
  showNewChannelModal.value = true;
};

const onChannelSave = () => {
  refreshChannels();
  editingChannel.value = null;
};

const deleteChannel = async (channelId) => {
  if (!confirm("Weet je zeker dat je dit kanaal wilt verwijderen?")) return;

  try {
    await $fetch(`/api/channels/${channelId}`, {
      method: "DELETE",
    });
    refreshChannels();
  } catch (error) {
    console.error("Error deleting channel:", error);
  }
};
</script>
