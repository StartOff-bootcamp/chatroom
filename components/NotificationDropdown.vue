<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

const user = useSupabaseUser();
const { channels, loading } = useChannelNotifications();
const isOpen = ref(false);

// Computed property for notifications
const notifications = computed(() => {
  return channels.value
    .filter((channel) => channel.unread_count > 0)
    .map((channel) => ({
      channelId: channel.id,
      channelName: channel.name,
      unreadCount: channel.unread_count,
      messages: channel.recent_messages || [],
    }))
    .filter(Boolean);
});

// Computed property for whether there are any unread messages
const hasUnread = computed(() => notifications.value.length > 0);

function closeDropdown() {
  isOpen.value = false;
}
</script>

<template>
  <Menu as="div" class="relative">
    <MenuButton
      class="relative shrink-0 rounded-full p-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
      :class="[hasUnread ? 'text-orange-400' : 'text-white/80']"
      @click="isOpen = !isOpen"
    >
      <span class="absolute -inset-1.5" />
      <span class="sr-only">View notifications</span>
      <Icon name="heroicons:bell" class="size-6" aria-hidden="true" />
      <div
        v-if="hasUnread"
        class="absolute -top-1 -right-1 size-2 bg-orange-400 rounded-full"
      />
    </MenuButton>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        v-if="isOpen"
        class="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
      >
        <div class="px-4 py-2 border-b border-gray-100">
          <h3 class="text-sm font-medium text-gray-900">Notifications</h3>
        </div>

        <div v-if="loading" class="px-4 py-3 text-sm text-gray-500 text-center">
          Loading...
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="px-4 py-3 text-sm text-gray-500 text-center"
        >
          No new notifications
        </div>

        <div v-else class="max-h-96 overflow-y-auto">
          <div
            v-for="notification in notifications"
            :key="notification.channelId"
            class="px-4 py-3 hover:bg-gray-50"
          >
            <NuxtLink
              :to="`/channels/${notification.channelId}`"
              class="block"
              @click="closeDropdown"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-900">
                  {{ notification.channelName }}
                </h4>
                <span
                  class="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800"
                >
                  {{ notification.unreadCount }} new
                </span>
              </div>
              <div class="space-y-1">
                <div
                  v-for="message in notification.messages"
                  :key="message.id"
                  class="text-sm"
                >
                  <span class="font-medium text-gray-900"
                    >{{ message.author }}:</span
                  >
                  <span class="text-gray-500">
                    {{
                      message.content.length > 50
                        ? message.content.slice(0, 50) + "..."
                        : message.content
                    }}
                  </span>
                </div>
              </div>
              <div
                v-if="notification.unreadCount > 3"
                class="mt-1 text-xs text-gray-500"
              >
                And {{ notification.unreadCount - 3 }} more messages...
              </div>
            </NuxtLink>
          </div>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>
