import { useState, useEffect } from 'react'
import { MapPin, ArrowLeft, Bookmark, Sparkles, Video, PlusCircle } from 'lucide-react'
import { isItemSaved, toggleSaveItem, getReels, getAllUsers } from '../services/dataService'
import { useAuth } from '../context/AuthContext'
import ReelCard from '../components/common/ReelCard'
import CommentsModal from '../components/common/CommentsModal'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

function PlaceDetails({ place, onBack, onPromotePlace, onCreateCampaign }) {
  const { currentUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [placeReels, setPlaceReels] = useState([])
  const [users, setUsers] = useState([])
  const [activeCommentReel, setActiveCommentReel] = useState(null)

  useEffect(() => {
    if (place) {
      if (currentUser) {
        setSaved(isItemSaved('place', place.id, currentUser.id))
      }
      const allReels = getReels()
      setPlaceReels(allReels.filter((r) => r.placeId === place.id))
      setUsers(getAllUsers())
    }
  }, [place, currentUser])

  if (!place) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>No place selected.</p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Go Back
        </button>
      </div>
    )
  }

  const handleSave = () => {
    if (!currentUser) return
    const newState = toggleSaveItem('place', place.id, currentUser.id)
    setSaved(newState)
  }

  const hasCoords =
    typeof place.latitude === 'number' &&
    typeof place.longitude === 'number' &&
    !isNaN(place.latitude)

  const isBusinessOwner =
    currentUser?.role === 'business' && place.businessId === currentUser.id

  const isCreator = currentUser?.role === 'creator'

  return (
    <div className="place-details-view">
      {/* Hero Section */}
      <div className="place-details-hero">
        {place.coverImage ? (
          <img src={place.coverImage} alt={place.name} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#334155' }} />
        )}
        <button
          type="button"
          className="place-details-back"
          onClick={onBack}
          aria-label="Back"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="place-details-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="place-card-category">{place.category || 'General'}</span>
              {isBusinessOwner && (
                <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  Your Managed Place
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>
              {place.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              <MapPin size={16} />
              <span>{place.location}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentUser && (
              <button
                type="button"
                className={`btn btn-secondary ${saved ? 'reel-action-btn saved' : ''}`}
                onClick={handleSave}
                style={{ gap: '6px' }}
              >
                <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Role-specific contextual action banners */}
        {isCreator && (
          <div
            style={{
              margin: '18px 0',
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <strong style={{ color: '#166534', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                Creator Free Promotion
              </strong>
              <p style={{ fontSize: '12px', color: '#15803d', margin: 0 }}>
                Promote this place independently to earn views, followers, and grow your portfolio!
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onPromotePlace?.(place)}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
            >
              <Video size={14} style={{ marginRight: '4px' }} />
              Upload Reel for this Place
            </button>
          </div>
        )}

        {isBusinessOwner && (
          <div
            style={{
              margin: '18px 0',
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <strong style={{ color: '#1e40af', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlusCircle size={16} />
                Boost with a Creator Campaign
              </strong>
              <p style={{ fontSize: '12px', color: '#1d4ed8', margin: 0 }}>
                Create a promotional campaign for this place to hire verified travel creators!
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onCreateCampaign?.(place)}
            >
              Create Campaign
            </button>
          </div>
        )}

        {/* Description */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>About this Place</h3>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
            {place.description || 'No description provided for this destination.'}
          </p>
        </div>

        {/* Facilities */}
        {place.facilities && place.facilities.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Highlights & Facilities</h3>
            <div className="place-facilities">
              {place.facilities.map((fac, idx) => (
                <span key={idx} className="facility-tag">
                  ✓ {fac}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mini Map */}
        {hasCoords && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Location on Map</h3>
            <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <MapContainer
                center={[place.latitude, place.longitude]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[place.latitude, place.longitude]} icon={markerIcon} />
              </MapContainer>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Coordinates: {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
            </p>
          </div>
        )}

        {/* Place Reels */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
            Creator Reels at this Place ({placeReels.length})
          </h3>
          {placeReels.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '12px' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
                No reels uploaded for this place yet. Be the first creator to showcase it!
              </p>
            </div>
          ) : (
            <div className="feed-list">
              {placeReels.map((reel) => {
                const creator = users.find((u) => u.id === reel.creatorId)
                return (
                  <ReelCard
                    key={reel.id}
                    reel={reel}
                    creator={creator}
                    place={place}
                    onComment={() => setActiveCommentReel(reel)}
                  />
                )
              })}
            </div>
          )}
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

export default PlaceDetails
