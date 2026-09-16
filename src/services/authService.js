import { getData, saveData } from './storage'

export function signup(userData) {
  const data = getData()
  data.users = data.users || []

  const cleanEmail = userData.email?.trim().toLowerCase()
  const cleanUsername = (
    userData.username?.trim().toLowerCase() ||
    cleanEmail.split('@')[0]
  ).replace(/[^a-z0-9_]/g, '')

  const existingEmail = data.users.find((user) => user.email === cleanEmail)
  if (existingEmail) {
    return {
      success: false,
      message: 'Email already registered. Please login instead.',
    }
  }

  const existingUsername = data.users.find((user) => user.username === cleanUsername)
  if (existingUsername) {
    return {
      success: false,
      message: 'Username is already taken. Please choose another.',
    }
  }

  const newUser = {
    id: 'user_' + Date.now().toString(),
    name: userData.name?.trim() || 'User',
    username: cleanUsername,
    email: cleanEmail,
    password: userData.password,
    role: userData.role || 'normal',
    phone: userData.phone?.trim() || '',
    bio: userData.bio?.trim() || (userData.role === 'creator' ? 'Travel Creator on PlacePulse' : userData.role === 'business' ? 'Business & Tourism Promoter' : 'Travel Explorer'),
    profileImage: userData.profileImage?.trim() || '',
    // Initial zero statistics for all new accounts
    followers: 0,
    following: 0,
    creatorScore: userData.role === 'creator' ? 75 : 0,
    earnings: 0,
    createdAt: new Date().toISOString(),
  }

  data.users.push(newUser)
  data.currentUser = newUser
  saveData(data)

  return {
    success: true,
    user: newUser,
  }
}

export function login(email, password) {
  const data = getData()
  const cleanEmail = email?.trim().toLowerCase()

  const user = (data.users || []).find(
    (item) => item.email === cleanEmail && item.password === password
  )

  if (!user) {
    return {
      success: false,
      message: 'Invalid email or password',
    }
  }

  data.currentUser = user
  saveData(data)

  return {
    success: true,
    user,
  }
}

export function saveCurrentUser(user) {
  const data = getData()
  data.currentUser = user
  saveData(data)
}

export function getCurrentUser() {
  const data = getData()
  return data?.currentUser || null
}

export function clearCurrentUser() {
  const data = getData()
  data.currentUser = null
  saveData(data)
}