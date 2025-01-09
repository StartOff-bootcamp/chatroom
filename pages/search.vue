definePageMeta({ middleware: ['auth'] })

<script setup>
const route = useRoute();
const query = ref(route.query.q || "");
const results = ref([]);
const loading = ref(false);
const error = ref(null);
const supabase = useSupabaseClient();

// Search function
async function performSearch() {
  if (!query.value.trim()) return;

  loading.value = true;
  error.value = null;

  try {
    // First get messages with channel info
    const { data: messages, error: searchError } = await supabase
      .from("messages")
      .select(
        `
        *,
        channel:channels(id, name)
      `
      )
      .textSearch("content", query.value)
      .order("created_at", { ascending: false })
      .limit(50);

    if (searchError) throw searchError;

    // Then fetch profiles for the message authors
    if (messages && messages.length > 0) {
      const userIds = [...new Set(messages.map((m) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      // Create a map of user profiles
      const profileMap =
        profiles?.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {}) || {};

      // Combine messages with user profiles
      results.value = messages.map((message) => ({
        ...message,
        user: profileMap[message.user_id] || null,
      }));
    } else {
      results.value = [];
    }
  } catch (err) {
    console.error("Search error:", err);
    error.value = "Er is een fout opgetreden bij het zoeken";
  } finally {
    loading.value = false;
  }
}

// Watch for query changes from URL
watch(
  () => route.query.q,
  (newQuery) => {
    query.value = newQuery || "";
    if (newQuery) {
      performSearch();
    }
  },
  { immediate: true }
);

// Format message content with links and line breaks
function formatMessage(content) {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
    )
    .replace(/\n/g, "<br>");
}

// Add helper function to get the user's avatar
function getUserAvatar(user) {
  if (!user) return null;
  if (user.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url;
  }
  return user.avatar_url;
}

// Get initial for avatar fallback
function getInitial(user) {
  if (!user) return "?";
  return (user.name || user.email || "?").charAt(0).toUpperCase();
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2 flex items-center gap-3">
        <span class="text-4xl">🔍</span>
        Zoeken
      </h1>
      <p class="text-gray-600 flex items-center gap-2">
        Zoek in alle berichten
      </p>
    </div>

    <!-- Search form -->
    <form @submit.prevent="performSearch" class="mb-8">
      <div class="flex gap-2">
        <input
          v-model="query"
          type="search"
          placeholder="Zoek in berichten..."
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <span>🔍</span> Zoeken
        </button>
      </div>
    </form>

    <!-- Error message -->
    <div
      v-if="error"
      class="bg-danger bg-opacity-10 text-danger px-4 py-2 rounded-lg mb-4"
    >
      {{ error }}
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>

    <!-- Results -->
    <div v-else-if="results.length > 0" class="space-y-4">
      <div
        v-for="message in results"
        :key="message.id"
        class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div v-if="getUserAvatar(message.user)" class="w-10 h-10">
              <img
                :src="getUserAvatar(message.user)"
                class="w-10 h-10 rounded-full object-cover"
                :alt="`${message.user?.name || 'User'}'s avatar`"
              />
            </div>
            <div
              v-else
              class="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 bg-yellow-200"
            >
              {{ getInitial(message.user) }}
            </div>
          </div>
          <div class="ml-3 flex-grow">
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium text-text">
                  {{ message.user?.name || "Anoniem" }}
                </p>
                <span class="text-sm text-gray-500">in</span>
                <NuxtLink
                  :to="`/channels/${message.channel.id}`"
                  class="text-primary hover:underline"
                >
                  {{ message.channel.name }}
                </NuxtLink>
              </div>
              <p
                class="text-gray-600 mt-1"
                v-html="formatMessage(message.content)"
              ></p>
              <span class="text-xs text-gray-400 flex items-center gap-1 mt-1">
                {{ new Date(message.created_at).toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No results -->
    <div v-else-if="query" class="text-center py-8 text-gray-500">
      <p class="text-lg flex items-center justify-center gap-2">
        <span>🔍</span> Geen resultaten gevonden voor "{{ query }}"
      </p>
    </div>
  </div>
</template>
