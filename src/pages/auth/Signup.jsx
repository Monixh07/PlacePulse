import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function Signup() {
  const { signup } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('normal')
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
  event.preventDefault()

  if (name.trim().length < 2) {
    setMessage('Name must be at least 2 characters')
    return
  }

  if (password.length < 6) {
    setMessage('Password must be at least 6 characters')
    return
  }

  const result = signup({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
  })

  if (result.success) {
    setMessage('Signup successful')
  } else {
    setMessage(result.message)
  }
}

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your PlacePulse account</h1>
        <p>Choose how you want to use PlacePulse</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

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
              placeholder="Create a password"
              required
            />
          </div>

          <div className="input-group">
            <label>Account Type</label>

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="normal">Normal User / Explorer</option>
              <option value="creator">Reel Creator</option>
              <option value="business">Business / Place Promoter</option>
            </select>
          </div>

          <button type="submit">
            Create Account
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  )
}

export default Signup