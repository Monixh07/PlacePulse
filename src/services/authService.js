import { isSupabaseConfigured, supabase } from './supabaseClient'

function configurationError() {
  return {
    success: false,
    message: 'Authentication is not configured. Add the Supabase URL and anon key to .env.local.',
  }
}

function authMessage(error, fallback = 'Unable to complete authentication') {
  const message = error?.message?.toLowerCase() || ''

  if (message.includes('already registered') || message.includes('already exists')) {
    return 'Email already registered. Please login instead.'
  }
  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password.'
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address before logging in.'
  }
  if (message.includes('password')) {
    return error.message
  }

  return error?.message || fallback
}

function profileFromRow(row, authUser) {
  if (!row) return null

  return {
    ...row,
    id: row.id || authUser.id,
    name: row.name || authUser.user_metadata?.name || 'User',
    username: row.username || authUser.user_metadata?.username || authUser.email.split('@')[0],
    email: authUser.email,
    role: row.role || authUser.user_metadata?.role || 'normal',
    phone: row.phone || '',
    bio: row.bio || '',
    profileImage: row.profile_image || row.profileImage || '',
    followers: row.followers || 0,
    following: row.following || 0,
    creatorScore: row.creator_score || 0,
    earnings: row.earnings || 0,
  }
}

export async function getProfile(authUser) {
  if (!authUser || !supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (error) throw error
  return profileFromRow(data, authUser)
}

export async function signup(userData) {
  if (!isSupabaseConfigured || !supabase) return configurationError()

  const cleanEmail = userData.email?.trim().toLowerCase()
  const cleanUsername = (
    userData.username?.trim().toLowerCase() ||
    cleanEmail?.split('@')[0] ||
    ''
  ).replace(/[^a-z0-9_]/g, '')

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: userData.password,
    options: {
      data: {
        name: userData.name?.trim() || 'User',
        username: cleanUsername,
        role: userData.role || 'normal',
      },
    },
  })

  if (error) return { success: false, message: authMessage(error) }
  if (!data.user) return { success: false, message: 'Unable to create your account.' }
  if (data.user.identities && data.user.identities.length === 0) {
    return { success: false, message: 'Email already registered. Please login instead.' }
  }

  const profile = {
    id: data.user.id,
    name: userData.name?.trim() || 'User',
    username: cleanUsername,
    email: cleanEmail,
    role: userData.role || 'normal',
    phone: userData.phone?.trim() || '',
    bio: userData.bio?.trim() || '',
    profile_image: userData.profileImage || '',
    followers: 0,
    following: 0,
    creator_score: userData.role === 'creator' ? 75 : 0,
    earnings: 0,
  }

  const { data: savedProfile, error: profileError } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()

  if (profileError) {
    return { success: false, message: authMessage(profileError, 'Account created, but your profile could not be saved.') }
  }

  return {
    success: true,
    user: data.session ? profileFromRow(savedProfile, data.user) : null,
    requiresEmailConfirmation: !data.session,
  }
}

export async function login(email, password) {
  if (!isSupabaseConfigured || !supabase) return configurationError()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email?.trim().toLowerCase(),
    password,
  })

  if (error) return { success: false, message: authMessage(error, 'Invalid email or password.') }

  try {
    const profile = await getProfile(data.user)
    if (!profile) {
      await supabase.auth.signOut()
      return { success: false, message: 'Your account profile is missing. Please contact an administrator.' }
    }
    return { success: true, user: profile }
  } catch (profileError) {
    await supabase.auth.signOut()
    return { success: false, message: authMessage(profileError, 'Unable to load your profile.') }
  }
}

export async function restoreSession() {
  if (!isSupabaseConfigured || !supabase) {
    return { user: null, error: configurationError().message }
  }

  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) return { user: null, error: error ? authMessage(error) : null }

  try {
    return { user: await getProfile(data.session.user), error: null }
  } catch (profileError) {
    return { user: null, error: authMessage(profileError, 'Unable to load your profile.') }
  }
}

export async function logout() {
  if (!supabase) return { success: true }
  const { error } = await supabase.auth.signOut()
  return error ? { success: false, message: authMessage(error) } : { success: true }
}
