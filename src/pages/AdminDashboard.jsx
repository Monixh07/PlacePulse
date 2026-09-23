import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPendingPlaces, verifyPlace, rejectPlace } from '../services/dataService'
import EmptyState from '../components/common/EmptyState'

function AdminDashboard() {
  const { currentUser, logout } = useAuth()
  const [places, setPlaces] = useState([])
  const [message, setMessage] = useState('')
  const [rejectionReasons, setRejectionReasons] = useState({})

  const loadPlaces = () => setPlaces(getPendingPlaces())

  useEffect(() => {
    loadPlaces()
    window.addEventListener('placepulse_data_changed', loadPlaces)
    return () => window.removeEventListener('placepulse_data_changed', loadPlaces)
  }, [])

  if (!currentUser || !['admin', 'developer'].includes(currentUser.role)) {
    return <EmptyState title="Verification access required" message="An administrator or developer account is required." />
  }

  const handleVerify = (id) => {
    const result = verifyPlace(id, currentUser)
    setMessage(result.success ? 'Place approved.' : result.message)
    if (result.success) loadPlaces()
  }

  const handleReject = (id) => {
    const result = rejectPlace(id, currentUser, rejectionReasons[id] || '')
    setMessage(result.success ? 'Place rejected.' : result.message)
    if (result.success) loadPlaces()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Place Verification</h1>
        <p>Review new place submissions before they appear in public discovery.</p>
      </div>
      {message && <p role="status" style={{ color: 'var(--color-primary)', marginBottom: '12px' }}>{message}</p>}
      {places.length === 0 ? <EmptyState title="No pending places" message="All place submissions have been reviewed." /> : (
        <div className="places-grid">
          {places.map((place) => (
            <div className="card" key={place.id} style={{ padding: '16px' }}>
              <h3>{place.name}</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>{place.location} · {place.category}</p>
              <p>{place.description || 'No description provided.'}</p>
              <textarea
                rows={2}
                value={rejectionReasons[place.id] || ''}
                onChange={(event) => setRejectionReasons((reasons) => ({ ...reasons, [place.id]: event.target.value }))}
                placeholder="Optional rejection reason"
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleVerify(place.id)}>Approve Place</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleReject(place.id)}>Reject Place</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button type="button" className="btn btn-secondary" onClick={logout} style={{ marginTop: '20px' }}>Log out</button>
    </div>
  )
}

export default AdminDashboard
