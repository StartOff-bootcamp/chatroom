import { ref } from 'vue'

interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  unread_count: number;
  last_visited_at?: string;
  recent_messages?: Array<{
    id: string;
    content: string;
    created_at: string;
    author: string;
  }>;
}

export const useChannelNotifications = () => {
  const channels = ref<Channel[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const client = useSupabaseClient();
  const user = useSupabaseUser();

  // Fetch channels with unread counts
  async function fetchChannels() {
    if (!user.value) return;
    loading.value = true;

    try {
      const updatedChannels = await $fetch<Channel[]>("/api/channels");
      channels.value = updatedChannels;
    } catch (err) {
      console.error("Error fetching channels:", err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch channels';
    } finally {
      loading.value = false;
    }
  }

  // Set up real-time subscriptions
  onMounted(() => {
    fetchChannels();

    const channel = client
      .channel('channel_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => fetchChannels()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_visits',
          filter: `user_id=eq.${user.value?.id}`
        },
        () => fetchChannels()
      )
      .subscribe();

    onUnmounted(() => {
      channel.unsubscribe();
    });
  });

  return {
    channels,
    loading,
    error,
    fetchChannels
  }
} 