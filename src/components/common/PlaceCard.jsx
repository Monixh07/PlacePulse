import { MapPin, ArrowRight, Bookmark, Star } from 'lucide-react'
import { isItemSaved, toggleSaveItem, getPlaceRatingSummary } from '../../services/dataService'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'

function PlaceCard({ place, onOpen }) {
  const { currentUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalRatings: 0 })

  useEffect(() => {
    if (place && currentUser) {
      setSaved(isItemSaved('place', place.id, currentUser.id))
    }
  }, [place, currentUser])

  useEffect(() => {
    if (!place) return undefined
    const loadRating = () => setRatingSummary(getPlaceRatingSummary(place.id))
    loadRating()
    window.addEventListener('placepulse_data_changed', loadRating)
    return () => window.removeEventListener('placepulse_data_changed', loadRating)
  }, [place])

  if (!place) return null

  const handleSave = (e) => {
    e.stopPropagation()
    if (!currentUser) return
    const newState = toggleSaveItem('place', place.id, currentUser.id)
    setSaved(newState)
  }

  return (
    <article className="place-card">
      <div className="place-card-image" onClick={() => onOpen?.(place)} style={{ cursor: 'pointer' }}>
        {place.coverImage ? (
          <img src={place.coverImage} alt={place.name || 'Place'} loading="lazy" />
        ) : (
          <div className="place-card-image-empty">
            <span>No image</span>
          </div>
        )}
      </div>

      <div className="place-card-content">
        <div className="place-card-title-row">
          <h3>{place.name || 'Unnamed Place'}</h3>
          {place.category && (
            <span className="place-card-category">{place.category}</span>
          )}
        </div>

        <div className="place-card-location">
          <MapPin size={14} />
          <span>{place.location || 'Location unavailable'}</span>
        </div>

        <div className="place-rating-summary" aria-label={ratingSummary.totalRatings ? `${ratingSummary.averageRating.toFixed(1)} out of 5 from ${ratingSummary.totalRatings} ratings` : 'No ratings yet'}>
          <Star size={15} fill="currentColor" />
          {ratingSummary.totalRatings ? <span>{ratingSummary.averageRating.toFixed(1)} ({ratingSummary.totalRatings} {ratingSummary.totalRatings === 1 ? 'rating' : 'ratings'})</span> : <span>No ratings yet</span>}
        </div>

        {place.description && (
          <p className="place-card-description">{place.description}</p>
        )}

        <div className="place-card-footer">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onOpen?.(place)}
          >
            View Place
            <ArrowRight size={14} />
          </button>

          {currentUser && (
            <button
              type="button"
              className={`btn-icon ${saved ? 'reel-action-btn saved' : ''}`}
              onClick={handleSave}
              title={saved ? 'Saved' : 'Save Place'}
              aria-label="Save Place"
            >
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default PlaceCard
