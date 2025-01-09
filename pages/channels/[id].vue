definePageMeta({ middleware: ['auth'] })

<script setup>
const route = useRoute();
const channelId = route.params.id;
const messageInput = ref("");
const messages = ref([]);
const supabase = useSupabaseClient();
const loading = ref(true);
const error = ref(null);
const messagesContainer = ref(null);
const user = useSupabaseUser();
const client = useSupabaseClient();

// Check if user is admin
const isAdmin = computed(() => user.value?.user_metadata?.role === "admin");

// Fetch initial data
const { data: channelData, error: channelError } = await useFetch(
  `/api/channels/${channelId}`
);
const { data: initialMessages, error: messagesError } = await useFetch(
  `/api/channels/${channelId}/messages`
);

if (channelError.value) {
  error.value =
    channelError.value?.data?.message ||
    "Er is een fout opgetreden bij het laden van het kanaal";
} else if (messagesError.value) {
  error.value =
    messagesError.value?.data?.message ||
    "Er is een fout opgetreden bij het laden van de berichten";
} else {
  messages.value = initialMessages.value || [];
}

loading.value = false;

// Auto scroll to bottom with safety checks
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value && messagesContainer.value.scrollTo) {
      try {
        messagesContainer.value.scrollTo({
          top: messagesContainer.value.scrollHeight,
          behavior: "smooth",
        });
      } catch (e) {
        console.warn("Could not scroll to bottom:", e);
      }
    }
  });
};

// Watch for new messages and scroll safely
watch(
  messages,
  () => {
    if (messages.value?.length) {
      scrollToBottom();
    }
  },
  { deep: true }
);

// Subscribe to real-time updates
onMounted(async () => {
  if (!user.value || !channelId) return;

  try {
    // First try to update existing visit
    const { error: updateError } = await client
      .from("channel_visits")
      .update({ last_visited_at: new Date().toISOString() })
      .eq("user_id", user.value.id)
      .eq("channel_id", channelId);

    // If no existing visit, insert new one
    if (updateError) {
      await client.from("channel_visits").insert({
        user_id: user.value.id,
        channel_id: channelId,
        last_visited_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Error recording channel visit:", err);
  }

  try {
    // First refresh messages to ensure we have the latest
    const { data: latestMessages } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (latestMessages) {
      // Fetch user profiles for all messages
      const userIds = [...new Set(latestMessages.map((m) => m.user_id))];
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
      messages.value = latestMessages.map((message) => ({
        ...message,
        user: profileMap[message.user_id] || null,
      }));

      // Scroll after messages are loaded
      nextTick(() => {
        scrollToBottom();
      });
    }

    // Set up real-time subscription
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          console.log("New message received:", payload);

          try {
            // Fetch the message and user profile separately
            const [messageResult, profileResult] = await Promise.all([
              supabase
                .from("messages")
                .select("*")
                .eq("id", payload.new.id)
                .single(),
              supabase
                .from("profiles")
                .select("*")
                .eq("id", payload.new.user_id)
                .single(),
            ]);

            if (messageResult.data) {
              const newMessage = {
                ...messageResult.data,
                user: profileResult.data || null,
              };
              console.log("Adding message to UI:", newMessage);
              messages.value = [...(messages.value || []), newMessage];
              nextTick(() => {
                scrollToBottom();
              });
            }
          } catch (err) {
            console.error("Error handling new message:", err);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log("Message deleted:", payload);
          if (messages.value) {
            messages.value = messages.value.filter(
              (m) => m.id !== payload.old.id
            );
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status:`, status);
      });

    // Cleanup
    onUnmounted(() => {
      if (channel) {
        channel.unsubscribe();
      }
    });
  } catch (err) {
    console.error("Error in channel setup:", err);
    error.value = "Er is een fout opgetreden bij het laden van het kanaal";
  }
});

// Helper function to get user profile
async function getUserProfile(userId) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return profile || null;
}

async function sendMessage() {
  if (!messageInput.value.trim()) return;

  try {
    await $fetch(`/api/channels/${channelId}/messages`, {
      method: "POST",
      body: {
        content: messageInput.value,
        channelId,
      },
    });
    messageInput.value = "";
  } catch (err) {
    console.error("Error sending message:", err);
    error.value = "Je moet ingelogd zijn om berichten te versturen";
  }
}

async function deleteMessage(messageId) {
  if (!confirm("Weet je zeker dat je dit bericht wilt verwijderen?")) {
    return;
  }

  try {
    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (deleteError) throw deleteError;

    // Remove message from local state
    messages.value = messages.value.filter((m) => m.id !== messageId);
  } catch (err) {
    console.error("Error deleting message:", err);
    error.value = "Kon bericht niet verwijderen";
  }
}

// Format message content with links and line breaks
function formatMessage(content) {
  return (
    content
      // First escape any HTML to prevent XSS
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Replace URLs with clickable links
      .replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
      )
      // Replace line breaks with <br> tags
      .replace(/\n/g, "<br>")
  );
}

// Add a computed property for the default avatar background
const defaultAvatarBg = "bg-yellow-200";

// Add a helper function to get the first letter of name or email
function getInitial(user) {
  if (!user) return "?";
  return (user.name || user.email || "?").charAt(0).toUpperCase();
}

// Add helper function to get the user's avatar
function getUserAvatar(user) {
  if (!user) return null;
  // Check for Google avatar in user metadata
  if (user.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url;
  }
  // Fallback to profile avatar
  return user.avatar_url;
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div
      v-if="error"
      class="bg-danger bg-opacity-10 text-danger px-4 py-2 rounded-lg mb-4 flex items-center gap-2"
    >
      <span>⚠️</span> {{ error }}
    </div>

    <div v-else>
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary flex items-center gap-2">
          {{ channelData?.name }}
        </h1>
        <p class="text-gray-600 flex items-center gap-2">
          {{ channelData?.description }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div
          ref="messagesContainer"
          class="h-[600px] overflow-y-auto mb-4 scroll-smooth"
        >
          <div v-if="loading" class="flex justify-center items-center h-full">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
            ></div>
          </div>

          <div
            v-else-if="messages.length === 0"
            class="flex flex-col items-center justify-center h-full text-gray-500"
          >
            <p class="text-lg flex items-center gap-2">
              <span>💭</span> Nog geen berichten in dit kanaal
            </p>
            <p class="text-sm flex items-center gap-2">
              <span>✨</span> Wees de eerste die iets deelt!
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="message in messages"
              :key="message.id"
              class="mb-4 group"
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
                    class="w-10 h-10 rounded-full flex items-center justify-center text-gray-700"
                    :class="defaultAvatarBg"
                  >
                    {{ getInitial(message.user) }}
                  </div>
                </div>
                <div class="ml-3 flex-grow">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium text-text">
                        {{ message.user?.name || "Anoniem" }}
                      </p>
                      <p
                        class="text-gray-600"
                        v-html="formatMessage(message.content)"
                      ></p>
                      <span
                        class="text-xs text-gray-400 flex items-center gap-1"
                      >
                        {{ new Date(message.created_at).toLocaleString() }}
                      </span>
                    </div>
                    <button
                      v-if="isAdmin"
                      @click="deleteMessage(message.id)"
                      class="text-danger opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-danger hover:bg-opacity-10"
                      title="Verwijder bericht"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t pt-4">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <textarea
              v-model="messageInput"
              rows="2"
              placeholder="✍️ Type je bericht..."
              class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary resize-none"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              type="submit"
              class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 h-fit"
            >
              <span>📨</span> Verstuur
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
