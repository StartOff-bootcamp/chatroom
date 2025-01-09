import { defineEventHandler, createError, getRouterParam } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  // Check if user is authenticated
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized"
    });
  }

  const client = await serverSupabaseClient(event);
  const channelId = getRouterParam(event, "id");

  if (!channelId) {
    throw createError({
      statusCode: 400,
      message: "Channel ID is required"
    });
  }

  try {
    // First verify the channel exists
    const { data: channel, error: channelError } = await client
      .from("channels")
      .select("id")
      .eq("id", channelId)
      .single();

    if (channelError || !channel) {
      throw createError({
        statusCode: 404,
        message: "Channel not found"
      });
    }

    // Fetch messages
    const { data: messages, error: messagesError } = await client
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw createError({
        statusCode: 500,
        message: "Error fetching messages"
      });
    }

    // Fetch user profiles and auth data for the messages
    const userIds = [...new Set(messages.map(m => m.user_id))];
    const [{ data: profiles }, { data: authUsers }] = await Promise.all([
      client
        .from("profiles")
        .select("*")
        .in("id", userIds),
      client
        .from("auth.users")
        .select("id, user_metadata")
        .in("id", userIds)
    ]);

    // Create a map of user profiles with metadata
    const userMap = {};
    profiles?.forEach(profile => {
      const authUser = authUsers?.find(u => u.id === profile.id);
      userMap[profile.id] = {
        ...profile,
        user_metadata: authUser?.user_metadata || {}
      };
    });

    // Combine messages with user profiles
    const messagesWithProfiles = messages.map(message => ({
      ...message,
      user: userMap[message.user_id] || null
    }));

    return messagesWithProfiles;
  } catch (error: any) {
    console.error("Error in messages endpoint:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal server error"
    });
  }
});
