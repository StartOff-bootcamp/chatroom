<script setup>
const user = useSupabaseUser();
const client = useSupabaseClient();
const { data: channels, refresh } = await useFetch("/api/channels");

// Form state
const showForm = ref(false);
const editingChannel = ref(null);
const formData = ref({
  name: "",
  description: "",
});

// Error handling
const error = ref(null);
const success = ref(null);

// Check if user is admin
const isAdmin = computed(() => user.value?.user_metadata?.role === "admin");

// If not admin, redirect to home
watchEffect(() => {
  if (user.value && !isAdmin.value) {
    navigateTo("/");
  }
});

function resetForm() {
  formData.value = {
    name: "",
    description: "",
  };
  editingChannel.value = null;
  showForm.value = false;
  error.value = null;
  success.value = null;
}

function editChannel(channel) {
  editingChannel.value = channel;
  formData.value = {
    name: channel.name,
    description: channel.description,
  };
  showForm.value = true;
}

async function deleteChannel(channelId) {
  if (!confirm("Weet je zeker dat je dit kanaal wilt verwijderen?")) return;

  try {
    const { error: err } = await client
      .from("channels")
      .delete()
      .eq("id", channelId);

    if (err) throw err;

    success.value = "Kanaal succesvol verwijderd";
    await refresh();
  } catch (err) {
    error.value = "Fout bij het verwijderen van het kanaal: " + err.message;
  }
}

async function saveChannel() {
  try {
    if (editingChannel.value) {
      // Update existing channel
      const { error: err } = await client
        .from("channels")
        .update({
          name: formData.value.name,
          description: formData.value.description,
        })
        .eq("id", editingChannel.value.id);

      if (err) throw err;
      success.value = "Kanaal succesvol bijgewerkt";
    } else {
      // Create new channel
      const { error: err } = await client.from("channels").insert({
        name: formData.value.name,
        description: formData.value.description,
      });

      if (err) throw err;
      success.value = "Kanaal succesvol aangemaakt";
    }

    resetForm();
    await refresh();
  } catch (err) {
    error.value = "Fout bij het opslaan van het kanaal: " + err.message;
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Kanaalbeheer</h1>
      <button
        v-if="!showForm"
        @click="showForm = true"
        class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Nieuw Kanaal
      </button>
    </div>

    <!-- Error/Success Messages -->
    <div
      v-if="error"
      class="bg-danger bg-opacity-10 text-danger px-4 py-2 rounded-lg mb-4"
    >
      {{ error }}
    </div>
    <div
      v-if="success"
      class="bg-success bg-opacity-10 text-success px-4 py-2 rounded-lg mb-4"
    >
      {{ success }}
    </div>

    <!-- Channel Form -->
    <div v-if="showForm" class="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {{ editingChannel ? "Kanaal Bewerken" : "Nieuw Kanaal" }}
      </h2>
      <form @submit.prevent="saveChannel" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Naam
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Beschrijving
          </label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
          ></textarea>
        </div>
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="resetForm"
            class="text-gray-600 hover:text-gray-800"
          >
            Annuleren
          </button>
          <button
            type="submit"
            class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            {{ editingChannel ? "Opslaan" : "Aanmaken" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Channels List -->
    <div class="space-y-4">
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="bg-white p-6 rounded-lg shadow-sm flex justify-between items-start"
      >
        <div>
          <h3 class="text-xl font-semibold text-primary">{{ channel.name }}</h3>
          <p class="text-gray-600">{{ channel.description }}</p>
          <span class="text-sm text-gray-400">
            Aangemaakt: {{ new Date(channel.created_at).toLocaleString() }}
          </span>
        </div>
        <div class="flex space-x-4">
          <button
            @click="editChannel(channel)"
            class="text-primary hover:text-opacity-80 transition-colors"
          >
            Bewerken
          </button>
          <button
            @click="deleteChannel(channel.id)"
            class="text-danger hover:text-opacity-80 transition-colors"
          >
            Verwijderen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
