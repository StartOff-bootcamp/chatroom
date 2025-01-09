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

// Check if user is admin
const isAdmin = computed(() => user.value?.user_metadata?.role === "admin");

// Fetch initial data
const { data: channelData } = await useFetch(`/api/channels/${channelId}`);
const { data: initialMessages, error: messagesError } = await useFetch(
  `/api/channels/${channelId}/messages`
);

if (messagesError.value) {
  error.value = "Kon berichten niet laden";
} else {
  messages.value = initialMessages.value || [];
}

loading.value = false;

// Auto scroll to bottom
const scrollToBottom = () => {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    });
  }
};

// Watch for new messages and scroll
watch(messages, scrollToBottom, { deep: true });

// Subscribe to real-time updates
onMounted(async () => {
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
    const profileMap = profiles?.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {});

    // Combine messages with user profiles
    messages.value = latestMessages.map((message) => ({
      ...message,
      user: profileMap[message.user_id] || null,
    }));
    scrollToBottom();
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
          messages.value = [...messages.value, newMessage];
          await scrollToBottom();
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
        messages.value = messages.value.filter((m) => m.id !== payload.old.id);
      }
    )
    .subscribe((status) => {
      console.log(`Realtime subscription status:`, status);
    });

  // Cleanup
  onUnmounted(() => {
    channel.unsubscribe();
  });
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
    error.value = "Kon bericht niet versturen";
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

// Format message content with links
function formatMessage(content) {
  // Replace URLs with clickable links
  return content.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" class="text-primary hover:underline">$1</a>'
  );
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
          <span>💫</span> {{ channelData?.name }}
        </h1>
        <p class="text-gray-600 flex items-center gap-2">
          <span>📝</span> {{ channelData?.description }}
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
                  <img
                    :src="message.user?.avatar_url || '/default-avatar.png'"
                    class="w-10 h-10 rounded-full"
                    alt="User avatar"
                  />
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
                        <span>🕒</span>
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
            <input
              v-model="messageInput"
              type="text"
              placeholder="✍️ Type je bericht..."
              class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <span>📨</span> Verstuur
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
