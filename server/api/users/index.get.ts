import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: users, error } = await client
    .from('profiles')
    .select(`
      *,
      auth_user:id (
        email,
        created_at,
        last_sign_in_at,
        raw_user_meta_data
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  return users
}) 