<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Nieuw kanaal aanmaken</h1>

    <div class="bg-white rounded-lg shadow-sm p-6">
      <form @submit.prevent="createChannel" class="space-y-6">
        <!-- Error Message -->
        <div v-if="error" class="bg-danger/10 text-danger px-4 py-2 rounded-lg">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Naam
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
            placeholder="Naam van het kanaal"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Beschrijving
          </label>
          <textarea
            v-model="formData.description"
            rows="4"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
            placeholder="Beschrijf waar dit kanaal voor is..."
          />
        </div>

        <div class="flex justify-between items-center pt-4">
          <NuxtLink
            to="/admin"
            class="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuleren
          </NuxtLink>

          <button
            type="submit"
            :disabled="loading"
            class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {{ loading ? "Bezig met aanmaken..." : "Kanaal aanmaken" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["admin"],
});

const loading = ref(false);
const error = ref(null);
const router = useRouter();

const formData = ref({
  name: "",
  description: "",
});

async function createChannel() {
  if (!formData.value.name.trim()) {
    error.value = "Naam is verplicht";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await $fetch("/api/channels", {
      method: "POST",
      body: formData.value,
    });

    // Redirect to admin page after successful creation
    router.push("/admin");
  } catch (err) {
    error.value = err.message || "Er is een fout opgetreden";
  } finally {
    loading.value = false;
  }
}
</script>
