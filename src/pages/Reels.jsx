import { useState, useEffect } from 'react'
import { getReels, getPlaces, getAllUsers, incrementReelViews, isReelLiked, toggleLikeReel, isItemSaved, toggleSaveItem } from '../services/dataService'
import { useAuth } from '../context/AuthContext'
import { Heart, MessageCircle, Bookmark, MapPin, ChevronUp, ChevronDown, Compass } from 'lucide-react'
import CommentsModal from '../components/common/CommentsModal'
import EmptyState from '../components/common/EmptyState'

function Reels({ onOpenPlace }) {
  const { currentUser } = useAuth()
  const [reels, setReels] = useState([])
  const [places, setPlaces] = useState([])
  const [users, setUsers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeCommentReel, setActiveCommentReel] = useState(null)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [saved, setSaved] = useState(false)

  const loadReelsData = () => {
    const r = getReels()
    setReels(r)
    setPlaces(getPlaces())
    setUsers(getAllUsers())
  }

  useEffect(() => {
    loadReelsData()
    window.addEventListener('placepulse_data_changed', loadReelsData)
    return () => window.removeEventListener('placepulse_data_changed', loadReelsData)
  }, [])

  const currentReel = reels[currentIndex] || null
  const creator = currentReel ? users.find((u) => u.id === currentReel.creatorId) : null
  const place = currentReel ? places.find((p) => p.id === currentReel.placeId) : null

  // Whenever currentIndex changes, update views & like/save states
  useEffect(() => {
    if (currentReel) {
      incrementReelViews(currentReel.id)
      setLikeCount(currentReel.likeCount ?? currentReel.likesCount ?? 0)
      if (currentUser) {
        setLiked(isReelLiked(currentReel.id, currentUser.id))
        setSaved(isItemSaved('reel', currentReel.id, currentUser.id))
      }
    }
  }, [currentIndex, currentReel?.id, currentUser])

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleLike = () => {
    if (!currentUser || !currentReel) return
    const isNowLiked = toggleLikeReel(currentReel.id, currentUser.id)
    setLiked(isNowLiked)
    setLikeCount((prev) => (isNowLiked ? prev + 1 : Math.max(0, prev - 1)))
  }

  const handleSave = () => {
    if (!currentUser || !currentReel) return
    const isNowSaved = toggleSaveItem('reel', currentReel.id, currentUser.id)
    setSaved(isNowSaved)
  }

  if (reels.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="page-header">
          <h1>Reels</h1>
          <p>Short-form video promotion for real-world places.</p>
        </div>
        <EmptyState
          title="No Reels uploaded yet"
          message="Creators can promote places for free or participate in business campaigns to share reels here."
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          height: '75vh',
          minHeight: '480px',
          maxHeight: '680px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#000',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Background Image / Video */}
        {currentReel?.mediaUrl ? (
          <img
            src={currentReel.mediaUrl}
            alt={currentReel.caption}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            No Media
          </div>
        )}

        {/* Gradient overlays for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top bar: index tracker */}
        <div style={{ position: 'relative', zIndex: 10, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: '20px' }}>
            <Compass size={16} />
            <span>Place Reel {currentIndex + 1} / {reels.length}</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn-icon"
              style={{ color: '#fff', background: 'rgba(0,0,0,0.4)' }}
              disabled={currentIndex === 0}
              onClick={handlePrev}
              title="Previous Reel"
            >
              <ChevronUp size={22} />
            </button>
            <button
              type="button"
              className="btn-icon"
              style={{ color: '#fff', background: 'rgba(0,0,0,0.4)' }}
              disabled={currentIndex === reels.length - 1}
              onClick={handleNext}
              title="Next Reel"
            >
              <ChevronDown size={22} />
            </button>
          </div>
        </div>

        {/* Right action bar: like, comment, save, share */}
        <div
          style={{
            position: 'absolute',
            right: '12px',
            bottom: '100px',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <button
            type="button"
            onClick={handleLike}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: liked ? '#ef4444' : '#ffffff',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {likeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCommentReel(currentReel)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageCircle size={22} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {currentReel?.commentCount ?? currentReel?.commentsCount ?? 0}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: saved ? '#3b82f6' : '#ffffff',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bookmark size={22} fill={saved ? 'currentColor' : 'none'} />
            </div>
          </button>
        </div>

        {/* Bottom overlay: Creator info, Place tag, Caption */}
        <div style={{ position: 'relative', zIndex: 10, padding: '16px', color: '#fff', paddingRight: '70px' }}>
          {/* Creator Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff',
              }}
            >
              {creator?.profileImage ? (
                <img src={creator.profileImage} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}>
                  {(creator?.name || 'C').charAt(0)}
                </span>
              )}
            </div>
            <div>
              <strong style={{ fontSize: '14px', display: 'block', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                {creator?.name || 'Creator'}
              </strong>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                @{creator?.username || 'creator'}
              </span>
            </div>
          </div>

          {/* Place Tag */}
          {place && (
            <button
              type="button"
              onClick={() => onOpenPlace?.(place)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              <MapPin size={14} color="#f59e0b" />
              <span>{place.name}</span>
            </button>
          )}

          {/* Caption */}
          <p style={{ fontSize: '13px', lineHeight: 1.4, textShadow: '0 1px 3px rgba(0,0,0,0.8)', margin: 0 }}>
            {currentReel?.caption}
          </p>
        </div>
      </div>

      {activeCommentReel && (
        <CommentsModal
          reel={activeCommentReel}
          onClose={() => setActiveCommentReel(null)}
        />
      )}
    </div>
  )
}

export default Reels