definePageMeta({ middleware: ['auth'] })

<script setup>
const user = useSupabaseUser();
const { channels, loading, error } = useChannelNotifications();
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8 text-center">
      <h1
        class="text-4xl font-bold mb-2 flex items-center gap-3 justify-center"
      >
        <span class="text-4xl">🚀</span>
        StartOff community
      </h1>
      <p class="text-gray-600 flex items-center gap-2 justify-center">
        Kies een kanaal om te beginnen met chatten
      </p>
    </div>

    <div
      v-if="error"
      class="bg-danger bg-opacity-10 text-danger px-4 py-2 rounded-lg mb-4"
    >
      {{ error }}
    </div>

    <div class="grid gap-6">
      <NuxtLink
        v-for="channel in channels"
        :key="channel.id"
        :to="`/channels/${channel.id}`"
        class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
      >
        <div class="flex justify-between items-start">
          <div>
            <h2
              class="text-xl font-semibold text-primary mb-2 flex items-center gap-2"
            >
              {{ channel.name }}
              <span
                v-if="channel.unread_count > 0"
                class="ml-2 inline-flex items-center rounded-full bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500"
              >
                {{ channel.unread_count }} nieuw
              </span>
            </h2>
            <p class="text-gray-600">{{ channel.description }}</p>
          </div>
          <div
            class="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            bekijk <span>➜</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div
      v-if="user?.user_metadata?.role === 'admin'"
      class="mt-8 flex justify-end"
    >
      <NuxtLink
        to="/admin"
        class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
      >
        <span>⚙️</span> Kanalen beheren
      </NuxtLink>
    </div>
  </div>
</template>
