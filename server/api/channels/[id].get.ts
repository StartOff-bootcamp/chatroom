import { defineEventHandler, createError, getRouterParam } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  // Check if user is authenticated
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const client = await serverSupabaseClient(event);
  const id = getRouterParam(event, "id");

  try {
    const { data: channel, error } = await client
      .from("channels")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!channel) {
      throw createError({
        statusCode: 404,
        message: "Channel not found",
      });
    }

    return channel;
  } catch (error: any) {
    console.error("Error fetching channel:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch channel",
    });
  }
});
