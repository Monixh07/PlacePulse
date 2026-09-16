import { useState, useEffect } from 'react'
import { MapPin, Search, Bell, MessageCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getNotifications } from '../../services/dataService'
import NotificationsModal from './NotificationsModal'

function Navbar({ onNavigate }) {
  const { currentUser } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (currentUser?.id) {
      const updateUnread = () => {
        const notifs = getNotifications(currentUser.id)
        setUnreadCount(notifs.filter((n) => !n.read).length)
      }
      updateUnread()
      window.addEventListener('placepulse_data_changed', updateUnread)
      return () => window.removeEventListener('placepulse_data_changed', updateUnread)
    }
  }, [currentUser])

  const roleLabel =
    currentUser?.role === 'creator'
      ? 'Creator'
      : currentUser?.role === 'business'
      ? 'Business'
      : 'Explorer'

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => onNavigate?.('home')} role="button" tabIndex={0}>
          <MapPin size={22} />
          <span>PlacePulse</span>
        </div>

        <div className="navbar-right">
          {currentUser && <span className="navbar-role-tag">{roleLabel}</span>}

          <div className="navbar-actions">
            <button
              type="button"
              className="navbar-btn"
              onClick={() => onNavigate?.('explore')}
              aria-label="Search and Explore"
              title="Explore Places"
            >
              <Search size={19} />
            </button>

            <button
              type="button"
              className="navbar-btn"
              onClick={() => onNavigate?.('messages')}
              aria-label="Messages"
              title="Conversations"
            >
              <MessageCircle size={19} />
            </button>

            <button
              type="button"
              className="navbar-btn"
              onClick={() => setShowNotifications(true)}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && <span className="navbar-badge" />}
            </button>
          </div>
        </div>
      </nav>

      {showNotifications && (
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      )}
    </>
  )
}

export default Navbar