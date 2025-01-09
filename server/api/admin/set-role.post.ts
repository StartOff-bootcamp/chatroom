import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Check if user is authenticated
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Je moet ingelogd zijn om deze actie uit te voeren'
    })
  }

  // Get request body
  const body = await readBody(event)
  const { userId, role } = body

  if (!userId || !role) {
    throw createError({
      statusCode: 400,
      message: 'Gebruikers-ID en rol zijn verplicht'
    })
  }

  const client = await serverSupabaseClient(event)

  // Update user metadata
  const { data, error } = await client.auth.admin.updateUserById(
    userId,
    { user_metadata: { role } }
  )

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return { success: true, data }
}) 