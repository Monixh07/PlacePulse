import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getPlaces,
  getReels,
  getCampaigns,
  getApplications,
  applyToCampaign,
  acceptAgreement,
  markVisitCompleted,
  submitCampaignReel,
  addReel,
  getVisitedPlaces,
  updateUserProfile,
} from '../../services/dataService'
import ReelCard from '../../components/common/ReelCard'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import CommentsModal from '../../components/common/CommentsModal'
import {
  Video,
  Briefcase,
  MapPin,
  Award,
  LogOut,
  Edit3,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const visitedIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

function CreatorDashboard({ onOpenPlace }) {
  const { currentUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'reels' | 'marketplace' | 'my-campaigns'

  const [places, setPlaces] = useState([])
  const [myReels, setMyReels] = useState([])
  const [visitedPlaces, setVisitedPlaces] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [applications, setApplications] = useState([])

  // Free Promotion Modal
  const [showFreePromoModal, setShowFreePromoModal] = useState(false)
  const [freePromoPlaceId, setFreePromoPlaceId] = useState('')
  const [freePromoCaption, setFreePromoCaption] = useState('')
  const [freePromoMediaUrl, setFreePromoMediaUrl] = useState('')

  // Campaign Reel Upload Modal
  const [activeUploadCampaign, setActiveUploadCampaign] = useState(null)
  const [campCaption, setCampCaption] = useState('')
  const [campMediaUrl, setCampMediaUrl] = useState('')

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editProfileImage, setEditProfileImage] = useState('')

  const [activeCommentReel, setActiveCommentReel] = useState(null)
  const [actionMessage, setActionMessage] = useState('')

  const loadCreatorData = () => {
    if (!currentUser) return
    const allPlaces = getPlaces()
    const allReels = getReels()
    const allCamps = getCampaigns()
    const allApps = getApplications()

    setPlaces(allPlaces)
    setMyReels(allReels.filter((r) => r.creatorId === currentUser.id))
    setVisitedPlaces(getVisitedPlaces(currentUser.id))
    setCampaigns(allCamps)
    setApplications(allApps.filter((a) => a.creatorId === currentUser.id))
  }

  useEffect(() => {
    loadCreatorData()
    if (currentUser) {
      setEditName(currentUser.name || '')
      setEditBio(currentUser.bio || '')
      setEditProfileImage(currentUser.profileImage || '')
    }
    window.addEventListener('placepulse_data_changed', loadCreatorData)
    return () => window.removeEventListener('placepulse_data_changed', loadCreatorData)
  }, [currentUser])

  if (!currentUser) {
    return <div className="empty-state"><h3>Login Required</h3></div>
  }

  // Calculated Stats
  const totalViews = myReels.reduce((acc, r) => acc + (r.viewCount ?? r.viewsCount ?? 0), 0)
  const totalFollowers = currentUser.followers || 0
  const creatorScore = currentUser.creatorScore ?? 75
  const earnings = currentUser.earnings || 0

  const myAppliedCampaignIds = applications.map((a) => a.campaignId)
  const myCampaignsList = campaigns.filter(
    (c) => c.selectedCreatorId === currentUser.id || myAppliedCampaignIds.includes(c.id)
  )

  const completedCampaignsCount = myCampaignsList.filter((c) => c.status === 'Completed').length

  // Free Promotion Submit
  const handleFreePromoSubmit = (e) => {
    e.preventDefault()
    if (!freePromoPlaceId || !freePromoCaption.trim()) return

    addReel({
      creatorId: currentUser.id,
      placeId: freePromoPlaceId,
      caption: freePromoCaption.trim(),
      mediaUrl: freePromoMediaUrl.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    })

    setShowFreePromoModal(false)
    setFreePromoCaption('')
    setFreePromoMediaUrl('')
    setActionMessage('Free promotional reel published successfully!')
    setTimeout(() => setActionMessage(''), 4000)
  }

  // Apply to Campaign
  const handleApply = (campaignId) => {
    const res = applyToCampaign(campaignId, currentUser.id)
    if (res.success) {
      setActionMessage('Application submitted successfully!')
    } else {
      setActionMessage(res.message)
    }
    setTimeout(() => setActionMessage(''), 4000)
  }

  // Submit Campaign Reel
  const handleCampaignReelSubmit = (e) => {
    e.preventDefault()
    if (!activeUploadCampaign || !campCaption.trim()) return

    submitCampaignReel(
      activeUploadCampaign.id,
      currentUser.id,
      activeUploadCampaign.placeId,
      campMediaUrl.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      campCaption.trim()
    )

    setActiveUploadCampaign(null)
    setCampCaption('')
    setCampMediaUrl('')
    setActionMessage('Promotional reel uploaded! Performance is now being tracked.')
    setTimeout(() => setActionMessage(''), 4000)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    updateUserProfile(currentUser.id, {
      name: editName.trim(),
      bio: editBio.trim(),
      profileImage: editProfileImage.trim(),
    })
    setShowEditModal(false)
  }

  return (
    <div>
      {/* Action toast message */}
      {actionMessage && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '16px',
            background: '#dcfce7',
            color: '#15803d',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            border: '1px solid #bbf7d0',
          }}
        >
          ✓ {actionMessage}
        </div>
      )}

      {/* Creator Profile Header */}
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
              border: '3px solid var(--color-primary)',
            }}
          >
            {currentUser.profileImage ? (
              <img src={currentUser.profileImage} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (currentUser.name || 'C').charAt(0).toUpperCase()
            )}
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>
                {currentUser.name}
              </h1>
              <span className="navbar-role-tag">Reel Creator</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              @{currentUser.username || 'creator'} • {currentUser.email}
            </p>
            {currentUser.bio && (
              <p style={{ fontSize: '14px', color: 'var(--color-text)', marginTop: '6px' }}>
                {currentUser.bio}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowFreePromoModal(true)}
              style={{ gap: '6px' }}
            >
              <Video size={14} />
              Promote Place
            </button>
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

        {/* Creator Stats Grid */}
        <div className="stats-grid" style={{ marginTop: '20px', marginBottom: 0 }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
              {creatorScore}
            </div>
            <div className="stat-label">Creator Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              ₹{earnings.toLocaleString()}
            </div>
            <div className="stat-label">Total Earnings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalViews.toLocaleString()}</div>
            <div className="stat-label">Total Reel Views</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{visitedPlaces.length}</div>
            <div className="stat-label">Places Visited</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{myReels.length}</div>
            <div className="stat-label">Reels Uploaded</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completedCampaignsCount}</div>
            <div className="stat-label">Campaigns Done</div>
          </div>
        </div>
      </div>

      {/* Creator Navigation Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <MapPin size={15} style={{ marginRight: '6px' }} />
          Visited Places ({visitedPlaces.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'reels' ? 'active' : ''}`}
          onClick={() => setActiveTab('reels')}
        >
          <Video size={15} style={{ marginRight: '6px' }} />
          My Reels ({myReels.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          <Briefcase size={15} style={{ marginRight: '6px' }} />
          Campaign Marketplace ({campaigns.filter((c) => c.status === 'Available').length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'my-campaigns' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-campaigns')}
        >
          <Award size={15} style={{ marginRight: '6px' }} />
          My Campaigns ({myCampaignsList.length})
        </button>
      </div>

      {/* TAB 1: Visited Places Map & Portfolio */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Your Visited Places Map</h3>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {visitedPlaces.length} destinations pinned
            </span>
          </div>

          {visitedPlaces.length > 0 ? (
            <div>
              <div className="map-container" style={{ height: '360px', marginBottom: '16px' }}>
                <MapContainer
                  center={[visitedPlaces[0]?.latitude || 13.5, visitedPlaces[0]?.longitude || 75.2]}
                  zoom={7}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {visitedPlaces.map((place) => (
                    <Marker
                      key={place.id}
                      position={[place.latitude, place.longitude]}
                      icon={visitedIcon}
                    >
                      <Popup>
                        <div style={{ width: '160px' }}>
                          <strong style={{ fontSize: '13px', display: 'block' }}>{place.name}</strong>
                          <span style={{ fontSize: '11px', color: '#666' }}>{place.location}</span>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%', marginTop: '6px', fontSize: '11px', padding: '4px' }}
                            onClick={() => onOpenPlace?.(place)}
                          >
                            View Place
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              <div className="places-grid">
                {visitedPlaces.map((place) => (
                  <div key={place.id} className="card" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {place.coverImage && (
                      <img
                        src={place.coverImage}
                        alt={place.name}
                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '14px', color: 'var(--color-text)' }}>{place.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block' }}>
                        {place.location}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ marginTop: '6px', fontSize: '11px', padding: '3px 8px' }}
                        onClick={() => onOpenPlace?.(place)}
                      >
                        Explore Place
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Visited Places Yet"
              message="Upload a free promotional reel or complete a campaign to pin your first visited destination on your travel portfolio map!"
            />
          )}
        </div>
      )}

      {/* TAB 2: My Reels */}
      {activeTab === 'reels' && (
        <div>
          {myReels.length === 0 ? (
            <EmptyState
              title="No Reels Uploaded Yet"
              message="Click 'Promote Place' above to upload your first travel reel for any place on PlacePulse."
            />
          ) : (
            <div className="feed-list">
              {myReels.map((reel) => {
                const place = places.find((p) => p.id === reel.placeId)
                return (
                  <ReelCard
                    key={reel.id}
                    reel={reel}
                    creator={currentUser}
                    place={place}
                    onOpenPlace={onOpenPlace}
                    onComment={() => setActiveCommentReel(reel)}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Campaign Marketplace */}
      {activeTab === 'marketplace' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Available Paid Campaigns</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Partner with businesses and tourism promoters to earn payments and increase your Creator Score.
            </p>
          </div>

          {campaigns.filter((c) => c.status === 'Available').length === 0 ? (
            <EmptyState
              title="No Campaigns Available Right Now"
              message="Check back soon! Local businesses create new promotional campaigns regularly."
            />
          ) : (
            campaigns
              .filter((c) => c.status === 'Available')
              .map((camp) => {
                const place = places.find((p) => p.id === camp.placeId)
                const hasAppliedAlready = applications.some((a) => a.campaignId === camp.id)

                const meetsFollowers = totalFollowers >= (camp.minFollowers || 0)
                const meetsScore = creatorScore >= (camp.minCreatorScore || 0)

                return (
                  <div key={camp.id} className="campaign-card">
                    <div className="campaign-header">
                      <div>
                        <h4 className="campaign-title">{camp.title}</h4>
                        {place && (
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '2px', cursor: 'pointer' }}
                            onClick={() => onOpenPlace?.(place)}
                          >
                            <MapPin size={14} />
                            <span>{place.name} ({place.location})</span>
                          </div>
                        )}
                      </div>
                      <div className="campaign-budget">
                        ₹{camp.maxBudget?.toLocaleString()}
                        <span style={{ fontSize: '11px', display: 'block', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                          Base: ₹{camp.basePayment} + Bonus: ₹{camp.bonusPayment}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: '8px 0' }}>
                      {camp.description}
                    </p>

                    <div className="campaign-requirements">
                      <span className={`req-pill ${meetsFollowers ? '' : 'req-unmet'}`}>
                        Min Followers: {camp.minFollowers?.toLocaleString()}
                      </span>
                      <span className={`req-pill ${meetsScore ? '' : 'req-unmet'}`}>
                        Min Creator Score: {camp.minCreatorScore}
                      </span>
                      <span className="req-pill">
                        Visit Date: {camp.visitDate || 'Flexible'}
                      </span>
                      <span className="req-pill">
                        Deadline: {camp.deadline || '30 days'}
                      </span>
                    </div>

                    {camp.facilities && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                        🎁 <strong>Perks:</strong> {camp.facilities}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      {hasAppliedAlready ? (
                        <span className="status-badge pending">Application Pending</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApply(camp.id)}
                        >
                          Apply to Campaign
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
          )}
        </div>
      )}

      {/* TAB 4: My Campaigns & Workflow */}
      {activeTab === 'my-campaigns' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Your Campaign Workflow</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Manage agreements, track visits, and upload deliverables.
            </p>
          </div>

          {myCampaignsList.length === 0 ? (
            <EmptyState
              title="No Active Campaigns"
              message="Apply to campaigns in the Marketplace to start working with business promoters."
            />
          ) : (
            myCampaignsList.map((camp) => {
              const place = places.find((p) => p.id === camp.placeId)

              return (
                <div key={camp.id} className="campaign-card">
                  <div className="campaign-header">
                    <div>
                      <h4 className="campaign-title">{camp.title}</h4>
                      {place && (
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          📍 {place.name}
                        </span>
                      )}
                    </div>
                    <span className={`status-badge ${camp.status?.toLowerCase().replace(/[^a-z]/g, '')}`}>
                      {camp.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: '8px 0' }}>
                    {camp.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-success)' }}>
                      Payout: ₹{camp.maxBudget?.toLocaleString()}
                    </span>

                    {/* Step-by-step action buttons based on status */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {camp.status === 'Selected' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => acceptAgreement(camp.id, currentUser.id)}
                        >
                          Accept Agreement
                        </button>
                      )}

                      {camp.status === 'Visit Scheduled' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => markVisitCompleted(camp.id, currentUser.id, camp.placeId)}
                        >
                          Mark Visit Completed
                        </button>
                      )}

                      {camp.status === 'Visited / Reel Pending' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setActiveUploadCampaign(camp)}
                        >
                          Upload Promotional Reel
                        </button>
                      )}

                      {camp.status === 'Reel Uploaded' && (
                        <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                          ✓ Reel submitted! Awaiting business completion.
                        </span>
                      )}

                      {camp.status === 'Completed' && (
                        <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 700 }}>
                          ✓ Completed & Paid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Free Promotion Modal */}
      {showFreePromoModal && (
        <Modal title="Promote a Place (Free Reel)" onClose={() => setShowFreePromoModal(false)}>
          <form onSubmit={handleFreePromoSubmit}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
              Choose any place to promote. It will appear on your profile, the place details page, and add to your visited places portfolio!
            </p>

            <div className="input-group">
              <label>Select Place</label>
              <select
                value={freePromoPlaceId}
                onChange={(e) => setFreePromoPlaceId(e.target.value)}
                required
              >
                <option value="">-- Choose a Destination --</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Reel Media URL (Image or Video preview)</label>
              <input
                type="url"
                value={freePromoMediaUrl}
                onChange={(e) => setFreePromoMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="input-group">
              <label>Caption & Experience</label>
              <textarea
                rows={3}
                value={freePromoCaption}
                onChange={(e) => setFreePromoCaption(e.target.value)}
                placeholder="Share your travel thoughts, tips, and highlights..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowFreePromoModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Publish Reel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Campaign Reel Submission Modal */}
      {activeUploadCampaign && (
        <Modal title="Submit Campaign Reel" onClose={() => setActiveUploadCampaign(null)}>
          <form onSubmit={handleCampaignReelSubmit}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
              Campaign: <strong>{activeUploadCampaign.title}</strong>
            </p>

            <div className="input-group">
              <label>Reel Media URL</label>
              <input
                type="url"
                value={campMediaUrl}
                onChange={(e) => setCampMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="input-group">
              <label>Promotional Caption</label>
              <textarea
                rows={3}
                value={campCaption}
                onChange={(e) => setCampCaption(e.target.value)}
                placeholder="Describe your visit, tag promoter, include requirements..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveUploadCampaign(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Deliverable
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <Modal title="Edit Creator Profile" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleSaveProfile}>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Bio</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Profile Image URL</label>
              <input
                type="url"
                value={editProfileImage}
                onChange={(e) => setEditProfileImage(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
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

export default CreatorDashboard
