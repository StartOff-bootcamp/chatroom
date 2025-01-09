import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = event.context.params?.id
  const body = await readBody(event)

  // Check if user exists
  const { data: existingUser, error: fetchError } = await client
    .from('auth.users')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !existingUser) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  // Update user metadata
  const { data, error } = await client.auth.admin.updateUserById(
    id,
    {
      user_metadata: {
        ...existingUser.raw_user_meta_data,
        ...body.metadata,
      },
    }
  )

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  return { user: data.user }
}) 