import { defineEventHandler, createError, getRouterParam, readBody } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);
  const channelId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  if (!channelId) {
    throw createError({
      statusCode: 400,
      message: "Channel ID is required",
    });
  }

  if (!body.content?.trim()) {
    throw createError({
      statusCode: 400,
      message: "Message content is required",
    });
  }

  try {
    console.log("Starting message creation for user:", user.id);

    // First verify the channel exists
    const { data: channel, error: channelError } = await client
      .from("channels")
      .select("id")
      .eq("id", channelId)
      .single();

    if (channelError) {
      console.error("Channel error:", channelError);
      throw channelError;
    }

    if (!channel) {
      throw createError({
        statusCode: 404,
        message: "Channel not found",
      });
    }

    console.log("Channel found:", channel.id);

    // Get or create profile
    console.log("Checking for existing profile...");
    const { data: existingProfile, error: profileError } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    let profile;
    if (profileError) {
      console.log("No existing profile found, creating new one...");
      // Create profile if it doesn't exist
      const { data: newProfile, error: createProfileError } = await client
        .from("profiles")
        .upsert({
          id: user.id,
          name: user.email?.split("@")[0] || "Anonymous",
          avatar_url: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.id}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createProfileError) {
        console.error("Profile creation error:", createProfileError);
        throw createProfileError;
      }
      console.log("New profile created:", newProfile);
      profile = newProfile;
    } else {
      console.log("Existing profile found:", existingProfile);
      profile = existingProfile;
    }

    // Insert the message
    console.log("Creating message...");
    const { data: message, error: messageError } = await client
      .from("messages")
      .insert({
        content: body.content.trim(),
        channel_id: channelId,
        user_id: user.id,
      })
      .select("*")
      .single();

    if (messageError) {
      console.error("Message creation error:", messageError);
      throw messageError;
    }

    console.log("Message created successfully:", message.id);

    // Return message with user profile
    return {
      ...message,
      user: profile
    };
  } catch (error: any) {
    console.error("Detailed error:", {
      error,
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message
    });
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to create message",
    });
  }
});
