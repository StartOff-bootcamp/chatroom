<template>
  <div class="min-h-full">
    <Popover as="header" class="bg-primary pb-24" v-slot="{ open }">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div
          class="relative flex items-center justify-center py-5 lg:justify-between"
        >
          <!-- Logo -->
          <div class="absolute left-0 shrink-0 lg:static">
            <NuxtLink to="/" class="flex items-center">
              <span class="sr-only">{{ $config.public.appName }}</span>
              <span class="text-3xl">🚀</span>
              <span class="ml-2 text-white text-xl font-bold"
                >StartOff community</span
              >
            </NuxtLink>
          </div>

          <!-- Right section on desktop -->
          <div
            v-if="user"
            class="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5"
          >
            <NotificationDropdown />

            <!-- Profile dropdown -->
            <Menu as="div" class="relative ml-4 shrink-0">
              <div>
                <MenuButton
                  class="relative flex rounded-full bg-white text-sm ring-2 ring-white/20 focus:outline-none focus:ring-white"
                >
                  <span class="absolute -inset-1.5" />
                  <span class="sr-only">Open user menu</span>
                  <img
                    v-if="user?.user_metadata?.avatar_url"
                    class="size-8 rounded-full"
                    :src="user.user_metadata.avatar_url"
                    :alt="user.user_metadata.full_name || 'User avatar'"
                  />
                  <div
                    v-else
                    class="size-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold"
                  >
                    {{
                      (user?.user_metadata?.full_name ||
                        user?.email ||
                        "U")[0].toUpperCase()
                    }}
                  </div>
                </MenuButton>
              </div>
              <transition
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems
                  class="absolute -right-2 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
                >
                  <MenuItem v-slot="{ active }">
                    <NuxtLink
                      to="/profile"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                    >
                      Your Profile
                    </NuxtLink>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button
                      @click="handleLogout"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block w-full text-left px-4 py-2 text-sm text-gray-700',
                      ]"
                    >
                      Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>

          <!-- Login button when not logged in -->
          <div v-else class="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5">
            <NuxtLink
              to="/login"
              class="text-white hover:text-white/90 font-medium"
            >
              Login
            </NuxtLink>
          </div>

          <!-- Search -->
          <div class="min-w-0 flex-1 px-12 lg:hidden">
            <div class="mx-auto grid w-full max-w-xs grid-cols-1">
              <input
                type="search"
                name="search"
                aria-label="Search"
                class="peer col-start-1 row-start-1 block w-full rounded-md bg-white/20 py-1.5 pl-10 pr-3 text-base text-white outline-none placeholder:text-white focus:bg-white focus:text-gray-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white/40 focus:placeholder:text-gray-400 sm:text-sm/6"
                placeholder="Search channels"
              />
              <Icon
                name="heroicons:magnifying-glass"
                class="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-white peer-focus:text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>

          <!-- Menu button -->
          <div class="absolute right-0 shrink-0 lg:hidden">
            <PopoverButton
              class="relative inline-flex items-center justify-center rounded-md bg-transparent p-2 text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span class="absolute -inset-0.5" />
              <span class="sr-only">Open main menu</span>
              <Icon
                v-if="!open"
                name="heroicons:bars-3"
                class="block size-6"
                aria-hidden="true"
              />
              <Icon
                v-else
                name="heroicons:x-mark"
                class="block size-6"
                aria-hidden="true"
              />
            </PopoverButton>
          </div>
        </div>
        <div class="hidden border-t border-white/20 py-5 lg:block">
          <div class="grid grid-cols-3 items-center gap-8">
            <div class="col-span-2">
              <nav class="flex space-x-4">
                <NuxtLink
                  v-for="item in navigation"
                  :key="item.name"
                  :to="item.href"
                  :class="[
                    route.path === item.href ? 'text-white' : 'text-white/80',
                    'rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10',
                  ]"
                >
                  {{ item.name }}
                </NuxtLink>
              </nav>
            </div>
            <div
              class="mx-auto grid w-full max-w-md grid-cols-1"
              ref="searchContainer"
            >
              <input
                v-model="searchQuery"
                type="search"
                name="search"
                aria-label="Search"
                @keyup="handleSearch"
                class="peer col-start-1 row-start-1 block w-full rounded-md bg-white/20 py-1.5 pl-10 pr-3 text-sm/6 text-white outline-none placeholder:text-white focus:bg-white focus:text-gray-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white/40 focus:placeholder:text-gray-400"
                placeholder="Zoek in berichten..."
              />
              <Icon
                name="heroicons:magnifying-glass"
                class="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-white peer-focus:text-gray-400"
                aria-hidden="true"
              />

              <!-- Search Results Dropdown -->
              <div
                v-if="
                  showSearchResults && (searchResults.length > 0 || searchError)
                "
                class="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-50"
              >
                <div
                  v-if="searchError"
                  class="p-4 text-sm text-danger bg-danger/10"
                >
                  {{ searchError }}
                </div>
                <div v-else class="max-h-64 overflow-y-auto">
                  <NuxtLink
                    v-for="result in searchResults"
                    :key="result.id"
                    :to="`/channels/${result.id}`"
                    class="block px-4 py-2 hover:bg-gray-50"
                    @click="showSearchResults = false"
                  >
                    <div class="flex items-center">
                      <div>
                        <div class="font-medium text-gray-900">
                          {{ result.name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ result.description }}
                        </div>
                      </div>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransitionRoot as="template" :show="open">
        <div class="lg:hidden">
          <TransitionChild
            as="template"
            enter="duration-150 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <PopoverOverlay class="fixed inset-0 z-20 bg-black/25" />
          </TransitionChild>

          <TransitionChild
            as="template"
            enter="duration-150 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <PopoverPanel
              focus
              class="absolute inset-x-0 top-0 z-30 mx-auto w-full max-w-3xl origin-top transform p-2 transition"
            >
              <div
                class="divide-y divide-gray-200 rounded-lg bg-white shadow-lg ring-1 ring-black/5"
              >
                <div class="pb-2 pt-3">
                  <div class="flex items-center justify-between px-4">
                    <div>
                      <NuxtLink to="/" class="flex items-center">
                        <span class="text-3xl">🚀</span>
                        <span class="ml-2 text-primary text-xl font-bold"
                          >StartOff community</span
                        >
                      </NuxtLink>
                    </div>
                    <div class="-mr-2">
                      <PopoverButton
                        class="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                      >
                        <span class="absolute -inset-0.5" />
                        <span class="sr-only">Close menu</span>
                        <Icon
                          name="heroicons:x-mark"
                          class="size-6"
                          aria-hidden="true"
                        />
                      </PopoverButton>
                    </div>
                  </div>
                  <div class="mt-3 space-y-1 px-2">
                    <NuxtLink
                      v-for="item in navigation"
                      :key="item.name"
                      :to="item.href"
                      :class="[
                        route.path === item.href ? 'bg-gray-100' : '',
                        'block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800',
                      ]"
                    >
                      {{ item.name }}
                    </NuxtLink>
                  </div>
                </div>
                <div class="pb-2 pt-4">
                  <div class="flex items-center px-5">
                    <div class="shrink-0">
                      <img
                        v-if="user?.user_metadata?.avatar_url"
                        class="size-10 rounded-full"
                        :src="user.user_metadata.avatar_url"
                        :alt="user.user_metadata.full_name || 'User avatar'"
                      />
                      <div
                        v-else
                        class="size-10 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold"
                      >
                        {{
                          (user?.user_metadata?.full_name ||
                            user?.email ||
                            "U")[0].toUpperCase()
                        }}
                      </div>
                    </div>
                    <div class="ml-3 min-w-0 flex-1">
                      <div class="truncate text-base font-medium text-gray-800">
                        {{ user?.user_metadata?.full_name || user?.email }}
                      </div>
                      <div class="truncate text-sm font-medium text-gray-500">
                        {{ user?.email }}
                      </div>
                    </div>
                    <button
                      type="button"
                      class="relative ml-auto shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <NotificationDropdown />
                    </button>
                  </div>
                  <div class="mt-3 space-y-1 px-2">
                    <NuxtLink
                      to="/profile"
                      class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Your Profile
                    </NuxtLink>
                    <button
                      @click="handleLogout"
                      class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </TransitionChild>
        </div>
      </TransitionRoot>
    </Popover>

    <main class="-mt-24 pb-8">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 class="sr-only">{{ route.meta.title || "Page" }}</h1>
        <!-- Main 3 column grid -->
        <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
          <!-- Left column -->
          <div :class="[showRightColumn ? 'lg:col-span-2' : 'lg:col-span-3']">
            <section aria-labelledby="section-1-title">
              <h2 class="sr-only" id="section-1-title">Main Content</h2>
              <div class="overflow-hidden rounded-lg bg-white shadow">
                <div class="p-6">
                  <slot />
                </div>
              </div>
            </section>
          </div>

          <!-- Right column -->
          <div v-if="showRightColumn" class="grid grid-cols-1 gap-4">
            <section aria-labelledby="section-2-title">
              <h2 class="sr-only" id="section-2-title">Online Users</h2>
              <div class="overflow-hidden rounded-lg bg-white shadow">
                <div class="p-6">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium text-gray-900">
                      Online Users
                    </h3>
                    <span class="text-sm text-success"
                      >{{ onlineUsers.length }} online</span
                    >
                  </div>
                  <div class="mt-6 flow-root">
                    <ul
                      v-if="onlineUsers.length > 0"
                      role="list"
                      class="-my-5 divide-y divide-gray-200"
                    >
                      <li
                        v-for="onlineUser in onlineUsers"
                        :key="onlineUser.id"
                        class="py-4"
                      >
                        <div class="flex items-center space-x-4">
                          <div class="shrink-0">
                            <img
                              v-if="onlineUser.avatar_url"
                              class="size-8 rounded-full"
                              :src="onlineUser.avatar_url"
                              :alt="onlineUser.name"
                            />
                            <div
                              v-else
                              class="size-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold"
                            >
                              {{
                                (onlineUser.name ||
                                  formatEmail(onlineUser.email) ||
                                  "U")[0].toUpperCase()
                              }}
                            </div>
                          </div>
                          <div class="min-w-0 flex-1">
                            <p
                              class="truncate text-sm font-medium text-gray-900"
                            >
                              {{
                                onlineUser.name || formatEmail(onlineUser.email)
                              }}
                            </p>
                            <p
                              v-if="onlineUser.status"
                              class="truncate text-xs text-gray-500"
                            >
                              {{ onlineUser.status }}
                            </p>
                          </div>
                          <div class="shrink-0">
                            <div class="h-2 w-2 rounded-full bg-success"></div>
                          </div>
                        </div>
                      </li>
                    </ul>
                    <div v-else class="text-center py-4 text-sm text-gray-500">
                      No users currently online
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>

    <footer>
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div
          class="border-t border-gray-200 py-8 text-center text-sm text-gray-500 sm:text-left"
        >
          <span class="block sm:inline"
            >&copy; {{ new Date().getFullYear() }}
            {{ $config.public.appName }}</span
          >
          <span class="block sm:inline">All rights reserved.</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverOverlay,
  PopoverPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { useDebounceFn, onClickOutside } from "@vueuse/core";

const route = useRoute();
const client = useSupabaseClient();
const { user, isAdmin } = useAuth();

// Navigation items
const navigation = computed(() => {
  const items = [
    { name: "Channels", href: "/" },
    { name: "Profile", href: "/profile" },
  ];

  if (isAdmin.value) {
    items.push({ name: "Admin", href: "/admin" });
  }

  return items;
});

// Use the presence composable
const { onlineUsers } = usePresence();

// Determine if we should show the right column (online users)
const showRightColumn = computed(() => {
  // Show right column on all pages except home
  return route.path !== "/";
});

// Handle user logout
const handleLogout = async () => {
  try {
    await client.auth.signOut();
    navigateTo("/login");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
};

const searchQuery = ref("");
const searchResults = ref([]);
const showSearchResults = ref(false);
const searchError = ref(null);

// Combined search handler that supports both instant search and Enter key search
const handleSearch = useDebounceFn(async (e) => {
  if (!user.value) {
    searchError.value = "Je moet ingelogd zijn om te zoeken";
    return;
  }

  // Handle Enter key for full search page
  if (e?.key === "Enter" && searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
    searchQuery.value = "";
    showSearchResults.value = false;
    return;
  }

  // Handle instant search for dropdown
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    showSearchResults.value = false;
    return;
  }

  try {
    const results = await $fetch("/api/channels/search", {
      params: { q: searchQuery.value },
    });
    searchResults.value = results;
    showSearchResults.value = true;
    searchError.value = null;
  } catch (error) {
    console.error("Search error:", error);
    searchError.value =
      error.message || "Er is een fout opgetreden bij het zoeken";
  }
}, 300);

// Add this to handle clicking outside search results
const searchContainer = ref(null);
onClickOutside(searchContainer, () => {
  showSearchResults.value = false;
});

// Add helper function to format email
function formatEmail(email) {
  if (!email) return "";
  const [username] = email.split("@");
  return username;
}
</script>

<style>
body {
  @apply bg-[#F8F9FA] text-[#343A40];
}
</style>
