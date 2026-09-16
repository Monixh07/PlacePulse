import { useAuth } from '../../context/AuthContext'

function NormalHome() {
  const { currentUser, logout } = useAuth()

  return (
    <div style={{ padding: '24px' }}>
      <h1>Explorer</h1>
      <p>Welcome, {currentUser.name}</p>
      <p>Discover places and travel content.</p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

export default NormalHome