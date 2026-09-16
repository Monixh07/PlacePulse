import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const result = login(
  email.trim().toLowerCase(),
  password
)

    if (result.success) {
      setMessage('Login successful')
    } else {
      setMessage(result.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome to PlacePulse</h1>
        <p>Login to continue</p>

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

          <button type="submit">
            Login
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  )
}

export default Login