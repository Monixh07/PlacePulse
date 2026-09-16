import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import { initialData } from './data/initialData'
import { initializeData } from './services/storage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AppHome from './pages/AppHome'

function App() {
  const { currentUser } = useAuth()
  const [authPage, setAuthPage] = useState('login')

  useEffect(() => {
    initializeData(initialData)
  }, [])

  if (!currentUser) {
    if (authPage === 'signup') {
      return <Signup onSwitchToLogin={() => setAuthPage('login')} />
    }

    return <Login onSwitchToSignup={() => setAuthPage('signup')} />
  }

  return <AppHome />
}

export default App