import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Check if user is authenticated and is admin
    const user = await serverSupabaseUser(event)
    if (!user || user.user_metadata?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Je hebt geen toegang tot deze functie'
      })
    }

    const channelId = event.context.params?.id
    const { name, description } = await readBody(event)

    if (!channelId || !name) {
      throw createError({
        statusCode: 400,
        message: 'Channel ID en naam zijn verplicht'
      })
    }

    const client = await serverSupabaseClient(event)

    // First check if channel exists
    const { data: existingChannel, error: checkError } = await client
      .from('channels')
      .select('id')
      .eq('id', channelId)
      .maybeSingle()

    if (checkError || !existingChannel) {
      throw createError({
        statusCode: 404,
        message: 'Kanaal niet gevonden'
      })
    }

    // Then update the channel
    const { data, error } = await client
      .from('channels')
      .update({ 
        name: name.trim(),
        description: description?.trim() || null 
      })
      .eq('id', channelId)
      .select()

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message
      })
    }

    if (!data || data.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Kanaal niet gevonden'
      })
    }

    return data[0]
  } catch (err: any) {
    console.error('Channel update error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Er is een fout opgetreden'
    })
  }
}) 