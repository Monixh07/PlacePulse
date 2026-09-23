import { useEffect, useRef, useState } from 'react'
import { Heart, MessageCircle, Bookmark, MapPin, Share2 } from 'lucide-react'
import { getPublicReels, getPublicPlaces, getAllUsers, incrementReelViews, isReelLiked, toggleLikeReel, isItemSaved, toggleSaveItem } from '../services/dataService'
import { useAuth } from '../context/AuthContext'
import CommentsModal from '../components/common/CommentsModal'
import EmptyState from '../components/common/EmptyState'

function ReelSlide({ reel, creator, place, onOpenPlace, onComment }) {
  const { currentUser } = useAuth()
  const slideRef = useRef(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(reel.likeCount ?? reel.likesCount ?? 0)
  const [shareMessage, setShareMessage] = useState('')
  const isVideo = reel.mediaUrl?.startsWith('data:video/') || /\.(mp4|mov|webm|ogg)(\?|$)/i.test(reel.mediaUrl || '')

  useEffect(() => {
    setLikeCount(reel.likeCount ?? reel.likesCount ?? 0)
    setLiked(currentUser ? isReelLiked(reel.id, currentUser.id) : false)
    setSaved(currentUser ? isItemSaved('reel', reel.id, currentUser.id) : false)
  }, [reel, currentUser])

  useEffect(() => {
    const slide = slideRef.current
    if (!slide) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        incrementReelViews(reel.id)
        observer.disconnect()
      }
    }, { threshold: 0.65 })
    observer.observe(slide)
    return () => observer.disconnect()
  }, [reel.id])

  const handleLike = () => {
    if (!currentUser) return
    const isNowLiked = toggleLikeReel(reel.id, currentUser.id)
    setLiked(isNowLiked)
    setLikeCount((count) => isNowLiked ? count + 1 : Math.max(0, count - 1))
  }

  const handleSave = () => {
    if (!currentUser) return
    setSaved(toggleSaveItem('reel', reel.id, currentUser.id))
  }

  const handleShare = async () => {
    const title = place?.name || 'PlacePulse Reel'
    try {
      if (navigator.share) {
        await navigator.share({ title, text: reel.caption || `Check out ${title} on PlacePulse.`, url: window.location.href })
        return
      }
      await navigator.clipboard.writeText(window.location.href)
      setShareMessage('Link copied')
    } catch (error) {
      if (error?.name !== 'AbortError') setShareMessage('Unable to share')
    }
    window.setTimeout(() => setShareMessage(''), 2500)
  }

  return (
    <article ref={slideRef} className="reel-fullscreen-slide">
      {reel.mediaUrl ? (isVideo ? <video src={reel.mediaUrl} controls muted playsInline preload="metadata" /> : <img src={reel.mediaUrl} alt={reel.caption || 'Place reel'} />) : <div className="reel-media-empty">No reel media</div>}
      <div className="reel-fullscreen-gradient" />

      <div className="reel-fullscreen-actions">
        <button type="button" onClick={handleLike} aria-label="Like reel" className={liked ? 'liked' : ''}><Heart size={25} fill={liked ? 'currentColor' : 'none'} /><span>{likeCount}</span></button>
        <button type="button" onClick={onComment} aria-label="Comment on reel"><MessageCircle size={25} /><span>{reel.commentCount ?? reel.commentsCount ?? 0}</span></button>
        <button type="button" onClick={handleSave} aria-label="Save reel" className={saved ? 'saved' : ''}><Bookmark size={25} fill={saved ? 'currentColor' : 'none'} /></button>
        <button type="button" onClick={handleShare} aria-label="Share reel"><Share2 size={25} /><span>Share</span></button>
      </div>

      <div className="reel-fullscreen-info">
        <div className="reel-fullscreen-creator">
          <div className="reel-fullscreen-avatar">{creator?.profileImage ? <img src={creator.profileImage} alt={creator.name} /> : (creator?.name || 'C').charAt(0).toUpperCase()}</div>
          <div><strong>{creator?.name || 'Creator'}</strong><span>@{creator?.username || 'creator'}</span></div>
        </div>
        {place && <button type="button" className="reel-fullscreen-place" onClick={() => onOpenPlace?.(place)}><MapPin size={15} /><span>{place.name} · {place.location}</span></button>}
        {reel.caption && <p>{reel.caption}</p>}
        <span className="reel-fullscreen-views">{(reel.viewCount ?? reel.viewsCount ?? 0).toLocaleString()} views</span>
      </div>
      {shareMessage && <div className="reel-fullscreen-share-message">{shareMessage}</div>}
    </article>
  )
}

function Reels({ onOpenPlace }) {
  const [reels, setReels] = useState([])
  const [places, setPlaces] = useState([])
  const [users, setUsers] = useState([])
  const [activeCommentReel, setActiveCommentReel] = useState(null)

  useEffect(() => {
    const loadReelsData = () => { setReels(getPublicReels()); setPlaces(getPublicPlaces()); setUsers(getAllUsers()) }
    loadReelsData()
    window.addEventListener('placepulse_data_changed', loadReelsData)
    return () => window.removeEventListener('placepulse_data_changed', loadReelsData)
  }, [])

  const handleHorizontalWheel = (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) event.currentTarget.scrollLeft += event.deltaY
  }

  if (reels.length === 0) return <EmptyState title="No Reels uploaded yet" message="Creators can promote places for free or participate in business campaigns to share reels here." />

  return (
    <div className="reels-viewer">
      <div className="reels-fullscreen-feed" aria-label="Place reels" onWheel={handleHorizontalWheel}>
        {reels.map((reel) => <ReelSlide key={reel.id} reel={reel} creator={users.find((user) => user.id === reel.creatorId)} place={places.find((item) => item.id === reel.placeId)} onOpenPlace={onOpenPlace} onComment={() => setActiveCommentReel(reel)} />)}
      </div>
      {activeCommentReel && <CommentsModal reel={activeCommentReel} onClose={() => setActiveCommentReel(null)} />}
    </div>
  )
}

export default Reels
