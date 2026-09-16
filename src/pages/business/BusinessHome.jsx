import { useAuth } from '../../context/AuthContext'

function BusinessHome() {
  const { currentUser, logout } = useAuth()

  return (
    <div style={{ padding: '24px' }}>
      <h1>Business Dashboard</h1>
      <p>Welcome, {currentUser.name}</p>
      <p>Create places and promotional campaigns.</p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

export default BusinessHome