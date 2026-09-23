import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { MapPin } from 'lucide-react'

function Login({ onSwitchToSignup }) {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    const result = await login(
      email.trim().toLowerCase(),
      password
    )

    if (result.success) {
      setMessage('')
    } else {
      setMessage(result.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <MapPin size={28} />
          <span style={{ fontSize: '24px', fontWeight: 800 }}>PlacePulse</span>
        </div>
        <h1>Welcome Back</h1>
        <p>Discover Places. Create. Promote.</p>

        {message && (
          <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
            Log In
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?
          <button type="button" onClick={onSwitchToSignup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login