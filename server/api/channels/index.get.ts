import { defineEventHandler, createError } from "h3";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  try {
    const { data: channels, error } = await client
      .from("channels")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return channels;
  } catch (error) {
    console.error("Error fetching channels:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch channels",
    });
  }
});
