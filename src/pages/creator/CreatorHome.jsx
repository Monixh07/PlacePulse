import { useAuth } from '../../context/AuthContext'

function CreatorHome() {
  const { currentUser, logout } = useAuth()

  return (
    <div style={{ padding: '24px' }}>
      <h1>Creator Dashboard</h1>
      <p>Welcome, {currentUser.name}</p>
      <p>Discover campaigns and promote places.</p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

export default CreatorHome