import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Check if user is authenticated
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Je moet ingelogd zijn om te zoeken'
    })
  }

  const query = getQuery(event)
  const searchTerm = query.q?.toString() || ''

  if (!searchTerm) {
    return []
  }

  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('channels')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('name')

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return data
}) 