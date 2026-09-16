import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { MapPin } from 'lucide-react'

function Signup({ onSwitchToLogin }) {
  const { signup } = useAuth()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('normal')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState('')
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
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      phone: phone.trim(),
      bio: bio.trim(),
      profileImage: profileImage.trim(),
    })

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
        <h1>Create your account</h1>
        <p>Discover Places. Create. Promote.</p>

        {message && (
          <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Select Role</label>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="normal">Normal User / Explorer</option>
              <option value="creator">Reel Creator</option>
              <option value="business">Business / Place Promoter</option>
            </select>
          </div>

          <div className="input-group">
            <label>{role === 'business' ? 'Business Name' : 'Full Name'}</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={role === 'business' ? 'e.g. Coastal Resorts & Cafe' : 'e.g. Rahul Sharma'}
              required
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="e.g. rahul_travels"
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          {/* Conditional fields based on role */}
          {(role === 'creator' || role === 'business') && (
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
          )}

          {role === 'business' && (
            <div className="input-group">
              <label>Business Details</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Briefly describe your destination, resort, or tourism services..."
              />
            </div>
          )}

          <div className="input-group">
            <label>{role === 'business' ? 'Logo URL (optional)' : 'Profile Image URL (optional)'}</label>
            <input
              type="url"
              value={profileImage}
              onChange={(event) => setProfileImage(event.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
            Register as {role === 'creator' ? 'Reel Creator' : role === 'business' ? 'Business Promoter' : 'Explorer'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <button type="button" onClick={onSwitchToLogin}>
            Log In
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup