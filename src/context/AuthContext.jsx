import { createContext, useContext, useEffect, useState } from 'react'
import {
  getOrCreateProfile,
  login as loginUser,
  logout as logoutUser,
  restoreSession,
  signup as signupUser,
} from '../services/authService'
import { supabase } from '../services/supabaseClient'
import Loading from '../components/common/Loading'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    restoreSession().then(({ user }) => {
      if (mounted) {
        setCurrentUser(user)
        setLoading(false)
      }
    })

    if (!supabase) return () => { mounted = false }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null)
        setLoading(false)
        return
      }

      // Do not await Supabase queries inside the auth callback.
      setTimeout(() => {
        getOrCreateProfile(session.user)
          .then((profile) => mounted && setCurrentUser(profile))
          .catch(() => mounted && setCurrentUser(null))
          .finally(() => mounted && setLoading(false))
      }, 0)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function login(email, password) {
    const result = await loginUser(email, password)
    if (result.success) setCurrentUser(result.user)
    return result
  }

  async function signup(userData) {
    const result = await signupUser(userData)
    if (result.success && result.user) setCurrentUser(result.user)
    return result
  }

  async function logout() {
    const result = await logoutUser()
    if (result.success) setCurrentUser(null)
    return result
  }

  if (loading) return <Loading />

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
