import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import { initialData } from './data/initialData'
import { initializeData } from './services/storage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import NormalHome from './pages/normal/NormalHome'
import CreatorHome from './pages/creator/CreatorHome'
import BusinessHome from './pages/business/BusinessHome'

function App() {
  const { currentUser } = useAuth()
  const [authPage, setAuthPage] = useState('login')

  useEffect(() => {
    initializeData(initialData)
  }, [])

  if (!currentUser) {
    if (authPage === 'signup') {
      return (
        <div>
          <Signup />

          <button onClick={() => setAuthPage('login')}>
            Already have an account? Login
          </button>
        </div>
      )
    }

    return (
      <div>
        <Login />

        <button onClick={() => setAuthPage('signup')}>
          Create a new account
        </button>
      </div>
    )
  }

  if (currentUser.role === 'creator') {
  return <CreatorHome />
}

if (currentUser.role === 'business') {
  return <BusinessHome />
}

return <NormalHome /></div>
  )
}

export default App