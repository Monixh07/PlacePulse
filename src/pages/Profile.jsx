import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserSavedPlaces, getUserLikedReels, getAllUsers, getPlaces, updateUserProfile } from '../services/dataService'
import PlaceCard from '../components/common/PlaceCard'
import ReelCard from '../components/common/ReelCard'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import CommentsModal from '../components/common/CommentsModal'
import { Bookmark, Heart, Edit3, LogOut } from 'lucide-react'

function Profile({ onOpenPlace }) {
  const { currentUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('saved') // 'saved' | 'liked'
  const [savedPlaces, setSavedPlaces] = useState([])
  const [likedReels, setLikedReels] = useState([])
  const [users, setUsers] = useState([])
  const [places, setPlaces] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeCommentReel, setActiveCommentReel] = useState(null)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editProfileImage, setEditProfileImage] = useState('')

  const loadProfileData = () => {
    if (!currentUser) return
    setSavedPlaces(getUserSavedPlaces(currentUser.id))
    setLikedReels(getUserLikedReels(currentUser.id))
    setUsers(getAllUsers())
    setPlaces(getPlaces())
  }

  useEffect(() => {
    loadProfileData()
    if (currentUser) {
      setEditName(currentUser.name || '')
      setEditUsername(currentUser.username || '')
      setEditBio(currentUser.bio || '')
      setEditProfileImage(currentUser.profileImage || '')
    }
    window.addEventListener('placepulse_data_changed', loadProfileData)
    return () => window.removeEventListener('placepulse_data_changed', loadProfileData)
  }, [currentUser])

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!currentUser) return

    updateUserProfile(currentUser.id, {
      name: editName.trim(),
      username: editUsername.trim(),
      bio: editBio.trim(),
      profileImage: editProfileImage.trim(),
    })
    setShowEditModal(false)
  }

  if (!currentUser) {
    return (
      <div className="empty-state">
        <h3>Login Required</h3>
        <p>Please log in to view your profile.</p>
      </div>
    )
  }

  const roleLabel =
    currentUser.role === 'creator'
      ? 'Reel Creator'
      : currentUser.role === 'business'
      ? 'Business Promoter'
      : 'Explorer'

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              flexShrink: 0,
              border: '3px solid var(--color-border)',
            }}
          >
            {currentUser.profileImage ? (
              <img src={currentUser.profileImage} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (currentUser.name || 'U').charAt(0).toUpperCase()
            )}
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
                {currentUser.name}
              </h1>
              <span className="navbar-role-tag">{roleLabel}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              @{currentUser.username || 'user'} • {currentUser.email}
            </p>
            {currentUser.bio && (
              <p style={{ fontSize: '14px', color: 'var(--color-text)', marginTop: '6px' }}>
                {currentUser.bio}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowEditModal(true)}
              style={{ gap: '4px' }}
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={logout}
              style={{ gap: '4px', color: 'var(--color-danger)' }}
              title="Logout"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--color-border)', marginTop: '16px', paddingTop: '12px' }}>
          <div>
            <strong style={{ fontSize: '16px', color: 'var(--color-text)' }}>{savedPlaces.length}</strong>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block' }}>Saved Places</span>
          </div>
          <div>
            <strong style={{ fontSize: '16px', color: 'var(--color-text)' }}>{likedReels.length}</strong>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block' }}>Liked Reels</span>
          </div>
          {currentUser.role === 'creator' && (
            <div>
              <strong style={{ fontSize: '16px', color: 'var(--color-primary)' }}>{currentUser.creatorScore ?? 80}</strong>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block' }}>Creator Score</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={15} style={{ marginRight: '6px' }} />
          Saved Places ({savedPlaces.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          <Heart size={15} style={{ marginRight: '6px' }} />
          Liked Reels ({likedReels.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'saved' ? (
        savedPlaces.length === 0 ? (
          <EmptyState
            title="No saved places yet"
            message="Discover places in the Explore or Home feeds and tap the bookmark icon to save them for your next trip."
          />
        ) : (
          <div className="places-grid">
            {savedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onOpen={onOpenPlace}
              />
            ))}
          </div>
        )
      ) : likedReels.length === 0 ? (
        <EmptyState
          title="No liked reels yet"
          message="Tap the heart icon on reels you enjoy to save them to your favorites."
        />
      ) : (
        <div className="feed-list">
          {likedReels.map((reel) => {
            const creator = users.find((u) => u.id === reel.creatorId)
            const place = places.find((p) => p.id === reel.placeId)
            return (
              <ReelCard
                key={reel.id}
                reel={reel}
                creator={creator}
                place={place}
                onOpenPlace={onOpenPlace}
                onComment={() => setActiveCommentReel(reel)}
              />
            )
          })}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <Modal title="Edit Profile" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleSaveProfile}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Bio</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about your travel passions..."
              />
            </div>

            <div className="input-group">
              <label>Profile Image URL</label>
              <input
                type="url"
                value={editProfileImage}
                onChange={(e) => setEditProfileImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {activeCommentReel && (
        <CommentsModal
          reel={activeCommentReel}
          onClose={() => setActiveCommentReel(null)}
        />
      )}
    </div>
  )
}

export default Profile