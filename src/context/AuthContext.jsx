import { createContext, useContext, useState } from 'react'
import {
  signup as signupUser,
  login as loginUser,
  saveCurrentUser,
  getCurrentUser,
  clearCurrentUser,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getCurrentUser)

  function login(email, password) {
    const result = loginUser(email, password)

    if (result.success) {
      setCurrentUser(result.user)
      saveCurrentUser(result.user)
    }

    return result
  }
  function signup(userData) {
  const result = signupUser(userData)

  if (result.success) {
    setCurrentUser(result.user)
    saveCurrentUser(result.user)
  }

  return result
}
  function logout() {
    clearCurrentUser()
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        signup,
        login,
        logout,
    }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}