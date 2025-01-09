import { defineEventHandler, createError } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

interface Message {
  id: string;
  content: string;
  created_at: string;
  author: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  unread_count: number;
  last_visited_at?: string;
  recent_messages: Message[];
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  try {
    // First get all channels
    const { data: channels, error: channelsError } = await client
      .from("channels")
      .select("*")
      .order("created_at", { ascending: true });

    if (channelsError) {
      throw channelsError;
    }

    // Get last visit times for all channels
    const { data: visits } = await client
      .from("channel_visits")
      .select("channel_id, last_visited_at")
      .eq("user_id", user.id);

    // Create a map of channel_id to last_visited_at
    const visitMap = new Map(
      visits?.map(visit => [visit.channel_id, visit.last_visited_at]) || []
    );

    // Get unread message counts and recent messages for each channel
    const channelsWithData: Channel[] = await Promise.all(
      channels.map(async (channel) => {
        const lastVisit = visitMap.get(channel.id) || new Date(0).toISOString();
        
        // Get unread count
        const { count } = await client
          .from("messages")
          .select("*", { count: 'exact', head: true })
          .eq("channel_id", channel.id)
          .gt("created_at", lastVisit);

        // Get recent messages if there are unread ones
        const recent_messages: Message[] = [];
        if (count && count > 0) {
          const { data: messages } = await client
            .from("messages")
            .select(`
              id,
              content,
              created_at,
              user_id,
              profiles!messages_user_id_fkey (
                name,
                email
              )
            `)
            .eq("channel_id", channel.id)
            .gt("created_at", lastVisit)
            .order("created_at", { ascending: false })
            .limit(3);

          if (messages) {
            messages.forEach(msg => {
              recent_messages.push({
                id: msg.id,
                content: msg.content,
                created_at: msg.created_at,
                author: msg.profiles?.name || msg.profiles?.email || 'Unknown'
              });
            });
          }
        }

        return {
          ...channel,
          unread_count: count || 0,
          last_visited_at: lastVisit,
          recent_messages
        };
      })
    );

    return channelsWithData;
  } catch (error: any) {
    console.error("Error fetching channels:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch channels",
    });
  }
});
