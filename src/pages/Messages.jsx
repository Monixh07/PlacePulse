import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllUsers, getMessagesBetween, sendMessage } from '../services/dataService'
import { ArrowLeft, Send, MessageCircle } from 'lucide-react'

function Messages() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [activePartner, setActivePartner] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [messageText, setMessageText] = useState('')

  const loadData = () => {
    if (!currentUser) return
    setUsers(getAllUsers().filter((user) => user.id !== currentUser.id))
  }

  useEffect(() => {
    loadData()
    window.addEventListener('placepulse_data_changed', loadData)
    return () => window.removeEventListener('placepulse_data_changed', loadData)
  }, [currentUser])

  useEffect(() => {
    if (currentUser && activePartner) setChatMessages(getMessagesBetween(currentUser.id, activePartner.id))
  }, [currentUser, activePartner])

  const handleSend = (event) => {
    event.preventDefault()
    if (!messageText.trim() || !currentUser || !activePartner) return
    sendMessage(currentUser.id, activePartner.id, messageText)
    setMessageText('')
    setChatMessages(getMessagesBetween(currentUser.id, activePartner.id))
  }

  const getLatestMessage = (userId) => {
    const messages = getMessagesBetween(currentUser.id, userId)
    return messages[messages.length - 1]
  }

  const renderAvatar = (user, size = 38) => (
    <div className="message-avatar" style={{ width: size, height: size }}>
      {user.profileImage ? <img src={user.profileImage} alt={user.name} /> : (user.name || 'U').charAt(0).toUpperCase()}
    </div>
  )

  if (!currentUser) {
    return <div className="empty-state"><h3>Login Required</h3><p>Please log in to view and send messages.</p></div>
  }

  if (activePartner) {
    return (
      <div className="chat-view">
        <div className="chat-header">
          <button type="button" className="chat-back-button" onClick={() => setActivePartner(null)} aria-label="Back to messages"><ArrowLeft size={20} /></button>
          {renderAvatar(activePartner, 36)}
          <div>
            <strong style={{ fontSize: '14px', display: 'block' }}>{activePartner.name}</strong>
            {(activePartner.role || activePartner.username) && <span style={{ fontSize: '11px', textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>
              {activePartner.role || ''}{activePartner.role && activePartner.username ? ' · ' : ''}{activePartner.username ? `@${activePartner.username}` : ''}
            </span>}
          </div>
        </div>
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="chat-empty-state"><MessageCircle size={32} /><p>No messages yet. Send a greeting to start the conversation!</p></div>
          ) : chatMessages.map((message) => {
            const isMine = message.senderId === currentUser.id
            return <div key={message.id} className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}><div>{message.text}</div><span className="message-time">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
          })}
        </div>
        <form onSubmit={handleSend} className="chat-input-bar">
          <input type="text" placeholder={`Message ${activePartner.name}...`} value={messageText} onChange={(event) => setMessageText(event.target.value)} />
          <button type="submit" className="btn btn-primary" disabled={!messageText.trim()} aria-label="Send Message"><Send size={16} /></button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header"><h1>Messages</h1><p>Directly communicate with creators, businesses, and fellow travelers.</p></div>
      <div className="messages-layout conversations-list">
        <div className="conversations-sidebar">
          <div className="conversations-title">Contacts ({users.length})</div>
          <div className="conversations-scroll">
            {users.length === 0 ? <p className="no-contacts">No other users registered yet.</p> : users.map((user) => {
              const latestMessage = getLatestMessage(user.id)
              return (
                <button key={user.id} type="button" className="conversation-item" onClick={() => setActivePartner(user)}>
                  {renderAvatar(user)}
                  <div className="conversation-content">
                    <strong>{user.name}</strong>
                    {(user.role || user.username) && <div className="conversation-meta">{user.role && <span>{user.role}</span>}{user.username && <span>@{user.username}</span>}</div>}
                    {latestMessage && <p className="conversation-preview">{latestMessage.senderId === currentUser.id ? 'You: ' : ''}{latestMessage.text}</p>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages
