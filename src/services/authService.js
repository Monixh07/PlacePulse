import { getData, saveData } from './storage'

export function signup(userData) {
  const data = getData()

  const existingUser = data.users.find(
    (user) => user.email === userData.email
  )

  if (existingUser) {
    return {
      success: false,
      message: 'Email already registered',
    }
  }

  const newUser = {
    id: Date.now().toString(),
    ...userData,
  }

  data.users.push(newUser)
  saveData(data)

  return {
    success: true,
    user: newUser,
  }
}

export function login(email, password) {
  const data = getData()

  const user = data.users.find(
    (item) =>
      item.email === email &&
      item.password === password
  )

  if (!user) {
    return {
      success: false,
      message: 'Invalid email or password',
    }
  }

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