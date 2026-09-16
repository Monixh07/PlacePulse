import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllUsers, getMessagesBetween, sendMessage } from '../services/dataService'
import { Send, MessageCircle } from 'lucide-react'

function Messages() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [activePartner, setActivePartner] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [messageText, setMessageText] = useState('')

  const loadData = () => {
    if (!currentUser) return
    const allUsers = getAllUsers().filter((u) => u.id !== currentUser.id)
    setUsers(allUsers)
    if (!activePartner && allUsers.length > 0) {
      setActivePartner(allUsers[0])
    }
  }

  useEffect(() => {
    loadData()
    window.addEventListener('placepulse_data_changed', loadData)
    return () => window.removeEventListener('placepulse_data_changed', loadData)
  }, [currentUser])

  useEffect(() => {
    if (currentUser && activePartner) {
      setChatMessages(getMessagesBetween(currentUser.id, activePartner.id))
    }
  }, [currentUser, activePartner])

  const handleSend = (e) => {
    e.preventDefault()
    if (!messageText.trim() || !currentUser || !activePartner) return

    sendMessage(currentUser.id, activePartner.id, messageText)
    setMessageText('')
    setChatMessages(getMessagesBetween(currentUser.id, activePartner.id))
  }

  if (!currentUser) {
    return (
      <div className="empty-state">
        <h3>Login Required</h3>
        <p>Please log in to view and send messages.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Messages</h1>
        <p>Directly communicate with creators, businesses, and fellow travelers.</p>
      </div>

      <div className="messages-layout">
        {/* Contacts Sidebar */}
        <div className="conversations-sidebar">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Contacts ({users.length})
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {users.length === 0 ? (
              <p style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                No other users registered yet.
              </p>
            ) : (
              users.map((user) => {
                const isActive = activePartner?.id === user.id
                return (
                  <div
                    key={user.id}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActivePartner(user)}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        flexShrink: 0,
                      }}
                    >
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (user.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.name}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '10px', textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>
                          {user.role}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                          @{user.username || 'user'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Thread */}
        <div className="chat-box">
          {activePartner ? (
            <>
              <div className="chat-header">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  {activePartner.profileImage ? (
                    <img src={activePartner.profileImage} alt={activePartner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (activePartner.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <strong style={{ fontSize: '14px', display: 'block' }}>{activePartner.name}</strong>
                  <span style={{ fontSize: '11px', textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>
                    Role: {activePartner.role}
                  </span>
                </div>
              </div>

              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    <MessageCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p>No messages yet. Send a greeting to start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((m) => {
                    const isMine = m.senderId === currentUser.id
                    return (
                      <div key={m.id} className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                        <div>{m.text}</div>
                        <span style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', display: 'block', textAlign: 'right' }}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={handleSend} className="chat-input-bar">
                <input
                  type="text"
                  placeholder={`Message ${activePartner.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!messageText.trim()}
                  aria-label="Send Message"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
              Select a conversation to begin chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages