<template>
  <div class="min-h-screen bg-background flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 fixed h-full">
      <div class="p-4">
        <NuxtLink
          to="/"
          class="text-2xl font-bold text-primary flex items-center gap-2 mb-8"
        >
          <span class="text-3xl">🚀</span>
          StartOff chat
        </NuxtLink>
        <div class="space-y-2">
          <div class="relative">
            <input
              type="text"
              placeholder="🔍 Zoek kanalen..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
            />
          </div>
          <nav class="mt-4 space-y-1">
            <NuxtLink
              v-for="channel in channels"
              :key="channel.id"
              :to="`/channels/${channel.id}`"
              class="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 group"
              :class="{
                'bg-primary bg-opacity-5': route.params.id === channel.id,
              }"
            >
              <span class="text-text flex items-center gap-2">
                <span>💫</span>
                {{ channel.name }}
              </span>
              <span
                v-if="channel.unread_count"
                class="bg-primary text-white text-xs px-2 py-1 rounded-full"
              >
                {{ channel.unread_count }}
              </span>
            </NuxtLink>
          </nav>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 ml-64">
      <!-- Header -->
      <header
        class="bg-white border-b border-gray-200 fixed w-full ml-64 top-0 z-10"
      >
        <div class="container px-4 py-4 flex justify-between items-center">
          <h1 class="text-xl font-semibold text-text flex items-center gap-2">
            <span v-if="route.path === '/'" class="text-xl">✨</span>
            <span
              v-else-if="route.path.startsWith('/channels/')"
              class="text-xl"
              >💬</span
            >
            <span v-else-if="route.path === '/profile'" class="text-xl"
              >👤</span
            >
            <span v-else-if="route.path === '/admin'" class="text-xl">⚙️</span>
            {{ currentPageTitle }}
          </h1>
          <nav class="flex items-center space-x-4">
            <NuxtLink
              v-if="user && isAdmin"
              to="/admin"
              class="text-text hover:text-primary flex items-center gap-1"
            >
              <span>⚙️</span> Beheer
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="text-text hover:text-primary flex items-center gap-1"
            >
              <span>👤</span> Profiel
            </NuxtLink>
          </nav>
        </div>
      </header>

      <!-- Page Content -->
      <main class="container px-4 py-8 mt-16">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser();
const isAdmin = computed(() => user.value?.user_metadata?.role === "admin");
const { data: channels } = await useFetch("/api/channels");
const route = useRoute();

const currentPageTitle = computed(() => {
  if (route.path === "/") return "Dashboard";
  if (route.path.startsWith("/channels/")) {
    const channel = channels.value?.find((c) => c.id === route.params.id);
    return channel?.name || "Kanaal";
  }
  if (route.path === "/profile") return "Profiel";
  if (route.path === "/admin") return "Beheer";
  return "";
});
</script>
