import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Check if user is authenticated and is admin
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Je moet ingelogd zijn om deze actie uit te voeren'
    })
  }

  // Check if user is admin
  if (user.user_metadata?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Je hebt geen toegang tot deze functie'
    })
  }

  // Get the channel ID from the URL
  const channelId = event.context.params?.id
  if (!channelId) {
    throw createError({
      statusCode: 400,
      message: 'Channel ID is verplicht'
    })
  }

  const client = await serverSupabaseClient(event)

  // Delete the channel
  const { error } = await client
    .from('channels')
    .delete()
    .eq('id', channelId)

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return { success: true }
}) 