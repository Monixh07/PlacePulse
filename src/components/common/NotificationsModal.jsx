import { useState, useEffect } from 'react'
import Modal from './Modal'
import { getNotifications, markNotificationsRead } from '../../services/dataService'
import { useAuth } from '../../context/AuthContext'
import { Bell, CheckCheck } from 'lucide-react'

function NotificationsModal({ onClose }) {
  const { currentUser } = useAuth()
  const [notifs, setNotifs] = useState([])

  const loadNotifs = () => {
    if (currentUser?.id) {
      setNotifs(getNotifications(currentUser.id))
    }
  }

  useEffect(() => {
    loadNotifs()
  }, [currentUser])

  const handleMarkAllRead = () => {
    if (currentUser?.id) {
      markNotificationsRead(currentUser.id)
      loadNotifs()
    }
  }

  return (
    <Modal title="Notifications" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          {notifs.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleMarkAllRead}
              style={{ fontSize: '12px', gap: '4px' }}
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          )}
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-secondary)' }}>
              <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p>You have no notifications yet.</p>
            </div>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: n.read ? 'var(--color-background)' : 'var(--color-primary-light)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--color-text)' }}>{n.title}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}

export default NotificationsModal
