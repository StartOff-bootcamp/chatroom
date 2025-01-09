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

  // Get request body
  const body = await readBody(event)
  const { name, description } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Naam is verplicht'
    })
  }

  const client = await serverSupabaseClient(event)

  // Create the channel
  const { data, error } = await client
    .from('channels')
    .insert({
      name: name.trim(),
      description: description?.trim() || null
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return data
}) 