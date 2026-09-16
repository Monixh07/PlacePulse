import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Bookmark, MapPin } from 'lucide-react'
import { isReelLiked, toggleLikeReel, isItemSaved, toggleSaveItem } from '../../services/dataService'
import { useAuth } from '../../context/AuthContext'

function ReelCard({
  reel,
  creator,
  place,
  onComment,
  onOpenPlace,
}) {
  const { currentUser } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (reel) {
      setLikeCount(reel.likeCount ?? reel.likesCount ?? 0)
      if (currentUser) {
        setLiked(isReelLiked(reel.id, currentUser.id))
        setSaved(isItemSaved('reel', reel.id, currentUser.id))
      }
    }
  }, [reel, currentUser])

  if (!reel) return null

  const handleLike = () => {
    if (!currentUser) return
    const isNowLiked = toggleLikeReel(reel.id, currentUser.id)
    setLiked(isNowLiked)
    setLikeCount((prev) => (isNowLiked ? prev + 1 : Math.max(0, prev - 1)))
  }

  const handleSave = () => {
    if (!currentUser) return
    const isNowSaved = toggleSaveItem('reel', reel.id, currentUser.id)
    setSaved(isNowSaved)
  }

  const views = reel.viewCount ?? reel.viewsCount ?? 0
  const comments = reel.commentCount ?? reel.commentsCount ?? 0

  return (
    <article className="reel-card">
      <div className="reel-card-header">
        <div className="reel-card-creator">
          <div className="reel-card-avatar">
            {creator?.profileImage ? (
              <img src={creator.profileImage} alt={creator.name || 'Creator'} />
            ) : (
              <span>{(creator?.name || 'C').charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div>
            <h3>{creator?.name || 'Creator'}</h3>
            <p>@{creator?.username || 'creator'}</p>
          </div>
        </div>
      </div>

      <div className="reel-card-media">
        {reel.mediaUrl ? (
          <img src={reel.mediaUrl} alt={reel.caption || 'Place reel'} loading="lazy" />
        ) : (
          <div className="reel-card-media-empty">
            <span>No reel media</span>
          </div>
        )}
      </div>

      <div className="reel-card-content">
        {place && (
          <button
            type="button"
            className="reel-card-place"
            onClick={() => onOpenPlace?.(place)}
            title="View Place Details"
          >
            <MapPin size={16} className="place-icon" />
            <div className="reel-card-place-info">
              <strong>{place.name}</strong>
              <span>{place.location || 'Location unavailable'}</span>
            </div>
          </button>
        )}

        {reel.caption && <p className="reel-card-caption">{reel.caption}</p>}

        <div className="reel-card-actions">
          <div className="reel-action-group">
            <button
              type="button"
              className={`reel-action-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label="Like reel"
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              <span>{likeCount}</span>
            </button>

            <button
              type="button"
              className="reel-action-btn"
              onClick={() => onComment?.(reel)}
              aria-label="Comment on reel"
            >
              <MessageCircle size={20} />
              <span>{comments}</span>
            </button>

            <button
              type="button"
              className={`reel-action-btn ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              aria-label="Save reel"
            >
              <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="reel-card-views">{views.toLocaleString()} views</div>
        </div>
      </div>
    </article>
  )
}

export default ReelCard