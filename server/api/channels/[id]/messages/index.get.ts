import { defineEventHandler, createError, getRouterParam } from "h3";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
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
      .order("created_at", { ascending: false })
      .limit(50);

    if (messagesError) {
      throw messagesError;
    }

    // Fetch user profiles for the messages
    const userIds = [...new Set(messages.map(m => m.user_id))];
    const { data: profiles, error: profilesError } = await client
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profilesError) {
      throw profilesError;
    }

    // Create a map of user profiles
    const profileMap = profiles?.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {}) || {};

    // Combine messages with user profiles
    const messagesWithProfiles = messages.map(message => ({
      ...message,
      user: profileMap[message.user_id] || null
    }));

    return messagesWithProfiles;
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch messages"
    });
  }
});
