import { useState, useEffect } from 'react'
import Modal from './Modal'
import { getCommentsByReel, addComment } from '../../services/dataService'
import { useAuth } from '../../context/AuthContext'
import { Send } from 'lucide-react'

function CommentsModal({ reel, onClose }) {
  const { currentUser } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  const loadComments = () => {
    if (reel?.id) {
      setComments(getCommentsByReel(reel.id))
    }
  }

  useEffect(() => {
    loadComments()
  }, [reel])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser || !reel) return

    addComment(
      reel.id,
      currentUser.id,
      currentUser.name || currentUser.username,
      currentUser.profileImage,
      newComment
    )
    setNewComment('')
    loadComments()
  }

  return (
    <Modal title="Comments" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '360px' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '12px' }}>
          {comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '30px 0' }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {c.userAvatar ? (
                    <img src={c.userAvatar} alt={c.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (c.userName || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ background: 'var(--color-surface)', padding: '8px 12px', borderRadius: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--color-text)' }}>{c.userName}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {currentUser ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newComment.trim()}
              style={{ padding: '10px 14px' }}
              aria-label="Post comment"
            >
              <Send size={16} />
            </button>
          </form>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Please log in to leave a comment.
          </p>
        )}
      </div>
    </Modal>
  )
}

export default CommentsModal
