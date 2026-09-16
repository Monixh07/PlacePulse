import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getPlaces,
  addPlace,
  updatePlace,
  deletePlace,
  getCampaigns,
  addCampaign,
  getApplications,
  selectCreator,
  completeCampaign,
  getAllUsers,
  getReels,
  updateUserProfile,
} from '../../services/dataService'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import {
  PlusCircle,
  Briefcase,
  Users,
  Sparkles,
  MapPin,
  Trash2,
  Edit3,
  LogOut,
} from 'lucide-react'

function BusinessDashboard({ onOpenPlace }) {
  const { currentUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('places') // 'places' | 'campaigns' | 'applications'

  const [places, setPlaces] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [applications, setApplications] = useState([])
  const [users, setUsers] = useState([])
  const [reels, setReels] = useState([])

  // Place Modal state
  const [showPlaceModal, setShowPlaceModal] = useState(false)
  const [editingPlaceId, setEditingPlaceId] = useState(null)
  const [placeName, setPlaceName] = useState('')
  const [placeCategory, setPlaceCategory] = useState('Beach')
  const [placeLocation, setPlaceLocation] = useState('')
  const [placeLat, setPlaceLat] = useState('12.9141')
  const [placeLng, setPlaceLng] = useState('74.8560')
  const [placeDesc, setPlaceDesc] = useState('')
  const [placeFacilities, setPlaceFacilities] = useState('Parking, Restrooms, Scenic View')
  const [placeCoverImage, setPlaceCoverImage] = useState('')

  // Campaign Modal state
  const [showCampModal, setShowCampModal] = useState(false)
  const [campPlaceId, setCampPlaceId] = useState('')
  const [campTitle, setCampTitle] = useState('')
  const [campDesc, setCampDesc] = useState('')
  const [minFollowers, setMinFollowers] = useState(1000)
  const [minAvgViews, setMinAvgViews] = useState(500)
  const [minCreatorScore, setMinCreatorScore] = useState(70)
  const [visitDate, setVisitDate] = useState('')
  const [deadline, setDeadline] = useState('')
  const [basePayment, setBasePayment] = useState(1000)
  const [bonusPayment, setBonusPayment] = useState(1500)
  const [maxBudget, setMaxBudget] = useState(2500)
  const [campFacilities, setCampFacilities] = useState('Complimentary meal & entry')
  const [campRequirements, setCampRequirements] = useState('Create 1 reel highlighting sunset and key features.')

  // AI Matcher Drawer/Modal
  const [aiMatchCampaign, setAiMatchCampaign] = useState(null)

  // Edit Business Info Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editProfileImage, setEditProfileImage] = useState('')

  const [toastMessage, setToastMessage] = useState('')

  const loadData = () => {
    if (!currentUser) return
    const allPlaces = getPlaces()
    const allCamps = getCampaigns()
    const allApps = getApplications()
    const allUsers = getAllUsers()
    const allReels = getReels()

    // Business only owns places with businessId === currentUser.id
    setPlaces(allPlaces.filter((p) => p.businessId === currentUser.id))
    setCampaigns(allCamps.filter((c) => c.businessId === currentUser.id))
    setApplications(allApps)
    setUsers(allUsers)
    setReels(allReels)
  }

  useEffect(() => {
    loadData()
    if (currentUser) {
      setEditName(currentUser.name || '')
      setEditBio(currentUser.bio || '')
      setEditProfileImage(currentUser.profileImage || '')
    }
    window.addEventListener('placepulse_data_changed', loadData)
    return () => window.removeEventListener('placepulse_data_changed', loadData)
  }, [currentUser])

  if (!currentUser) {
    return <div className="empty-state"><h3>Login Required</h3></div>
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Handle Add/Edit Place
  const handleOpenAddPlace = () => {
    setEditingPlaceId(null)
    setPlaceName('')
    setPlaceCategory('Beach')
    setPlaceLocation('')
    setPlaceLat('12.9141')
    setPlaceLng('74.8560')
    setPlaceDesc('')
    setPlaceFacilities('Parking, Restrooms, Scenic View')
    setPlaceCoverImage('')
    setShowPlaceModal(true)
  }

  const handleOpenEditPlace = (p) => {
    setEditingPlaceId(p.id)
    setPlaceName(p.name || '')
    setPlaceCategory(p.category || 'Beach')
    setPlaceLocation(p.location || '')
    setPlaceLat(p.latitude?.toString() || '12.9141')
    setPlaceLng(p.longitude?.toString() || '74.8560')
    setPlaceDesc(p.description || '')
    setPlaceFacilities(Array.isArray(p.facilities) ? p.facilities.join(', ') : '')
    setPlaceCoverImage(p.coverImage || '')
    setShowPlaceModal(true)
  }

  const handlePlaceSubmit = (e) => {
    e.preventDefault()
    if (!placeName.trim() || !placeLocation.trim()) return

    const payload = {
      name: placeName.trim(),
      category: placeCategory,
      location: placeLocation.trim(),
      latitude: parseFloat(placeLat) || 12.9141,
      longitude: parseFloat(placeLng) || 74.8560,
      description: placeDesc.trim(),
      facilities: placeFacilities.split(',').map((f) => f.trim()).filter(Boolean),
      coverImage: placeCoverImage.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    }

    if (editingPlaceId) {
      updatePlace(editingPlaceId, payload)
      showToast('Place updated successfully!')
    } else {
      addPlace(payload, currentUser.id)
      showToast('New destination added to PlacePulse!')
    }

    setShowPlaceModal(false)
  }

  const handleDeletePlace = (id) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      deletePlace(id)
      showToast('Place removed.')
    }
  }

  // Handle Campaign Creation
  const handleOpenAddCamp = (defaultPlaceId = '') => {
    setCampPlaceId(defaultPlaceId || (places[0]?.id || ''))
    setCampTitle('')
    setCampDesc('')
    setMinFollowers(1000)
    setMinAvgViews(500)
    setMinCreatorScore(70)
    setVisitDate('')
    setDeadline('')
    setBasePayment(1000)
    setBonusPayment(1500)
    setMaxBudget(2500)
    setCampFacilities('Complimentary meal & entry')
    setCampRequirements('Create 1 reel highlighting key features.')
    setShowCampModal(true)
  }

  const handleCampSubmit = (e) => {
    e.preventDefault()
    if (!campPlaceId || !campTitle.trim()) return

    addCampaign(
      {
        placeId: campPlaceId,
        title: campTitle.trim(),
        description: campDesc.trim(),
        minFollowers,
        minAvgViews,
        minCreatorScore,
        visitDate,
        deadline,
        reelsRequired: 1,
        basePayment,
        bonusPayment,
        maxBudget,
        facilities: campFacilities.trim(),
        requirements: campRequirements.trim(),
      },
      currentUser.id
    )

    setShowCampModal(false)
    showToast('Campaign launched! Creators can now discover and apply.')
  }

  // Select Creator for Campaign
  const handleSelectCreator = (campaignId, creatorId) => {
    selectCreator(campaignId, creatorId)
    showToast('Creator selected! Agreement sent.')
  }

  // Approve & Complete Campaign
  const handleCompleteCampaign = (campaignId, creatorId) => {
    completeCampaign(campaignId, creatorId)
    showToast('Campaign successfully approved, completed, and payout credited!')
  }

  // Rule-based AI Creator Matching Algorithm (Phase 23)
  const calculateAiMatch = (creator, campaign) => {
    const creatorFollowers = creator.followers || 0
    const score = creator.creatorScore ?? 75
    const creatorReels = reels.filter((r) => r.creatorId === creator.id)
    const avgViews = creatorReels.length
      ? Math.round(creatorReels.reduce((acc, r) => acc + (r.viewCount || 0), 0) / creatorReels.length)
      : 0

    let matchPoints = 0
    const reasons = []

    if (avgViews > 0) {
      reasons.push(`✓ Content Reach: ~${avgViews.toLocaleString()} avg views`)
    }

    // 1. Follower Match (35%)
    if (creatorFollowers >= campaign.minFollowers) {
      matchPoints += 35
      reasons.push(`✓ Meets follower requirement (${creatorFollowers.toLocaleString()} >= ${campaign.minFollowers.toLocaleString()})`)
    } else {
      const pct = Math.max(0, (creatorFollowers / (campaign.minFollowers || 1)) * 35)
      matchPoints += Math.round(pct)
      reasons.push(`⚠ Below follower threshold (${creatorFollowers.toLocaleString()} / ${campaign.minFollowers.toLocaleString()})`)
    }

    // 2. Creator Score Match (35%)
    if (score >= campaign.minCreatorScore) {
      matchPoints += 35
      reasons.push(`✓ High Creator Score (${score} / 100)`)
    } else {
      const pct = Math.max(0, (score / (campaign.minCreatorScore || 1)) * 35)
      matchPoints += Math.round(pct)
      reasons.push(`⚠ Moderate Creator Score (${score} / ${campaign.minCreatorScore})`)
    }

    // 3. Category Experience & Content Production (30%)
    const place = places.find((p) => p.id === campaign.placeId)
    if (creatorReels.length > 0) {
      matchPoints += 20
      reasons.push(`✓ Active travel content creator (${creatorReels.length} reels published)`)
    }
    if (place && creatorReels.some((r) => r.placeId === place.id)) {
      matchPoints += 10
      reasons.push(`✓ Prior filming experience at ${place.name}`)
    } else {
      matchPoints += 10
      reasons.push(`✓ Fresh creator perspective for destination`)
    }

    return {
      percentage: Math.min(100, Math.round(matchPoints)),
      reasons,
    }
  }

  // Active campaigns list
  const activeCampaigns = campaigns.filter((c) => c.status !== 'Completed')
  const completedCampaigns = campaigns.filter((c) => c.status === 'Completed')

  return (
    <div>
      {toastMessage && (
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
          ✓ {toastMessage}
        </div>
      )}

      {/* Business Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              flexShrink: 0,
              border: '2px solid var(--color-primary)',
            }}
          >
            {currentUser.profileImage ? (
              <img src={currentUser.profileImage} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (currentUser.name || 'B').charAt(0).toUpperCase()
            )}
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>
                {currentUser.name}
              </h1>
              <span className="navbar-role-tag">Place Promoter</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              @{currentUser.username || 'business'} • {currentUser.email}
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
              onClick={handleOpenAddPlace}
              style={{ gap: '6px' }}
            >
              <PlusCircle size={15} />
              Add Place
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleOpenAddCamp()}
              disabled={places.length === 0}
              style={{ gap: '6px' }}
            >
              <Briefcase size={15} />
              Create Campaign
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

        {/* Business Stats Grid */}
        <div className="stats-grid" style={{ marginTop: '20px', marginBottom: 0 }}>
          <div className="stat-card">
            <div className="stat-value">{places.length}</div>
            <div className="stat-label">Managed Places</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
              {activeCampaigns.length}
            </div>
            <div className="stat-label">Active Campaigns</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {completedCampaigns.length}
            </div>
            <div className="stat-label">Completed Campaigns</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {applications.filter((a) => campaigns.some((c) => c.id === a.campaignId)).length}
            </div>
            <div className="stat-label">Applications Received</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'places' ? 'active' : ''}`}
          onClick={() => setActiveTab('places')}
        >
          <MapPin size={15} style={{ marginRight: '6px' }} />
          My Places ({places.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          <Briefcase size={15} style={{ marginRight: '6px' }} />
          Campaigns ({campaigns.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <Users size={15} style={{ marginRight: '6px' }} />
          Applications & Creators
        </button>
      </div>

      {/* TAB 1: My Places */}
      {activeTab === 'places' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Your Managed Destinations</h3>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAddPlace}>
              <PlusCircle size={14} style={{ marginRight: '4px' }} />
              Add Place
            </button>
          </div>

          {places.length === 0 ? (
            <EmptyState
              title="No Places Added Yet"
              message="Add your resort, cafe, beach destination, or tourist attraction to PlacePulse to begin promoting."
            />
          ) : (
            <div className="places-grid">
              {places.map((place) => (
                <div key={place.id} className="place-card">
                  <div className="place-card-image">
                    {place.coverImage ? (
                      <img src={place.coverImage} alt={place.name} />
                    ) : (
                      <div className="place-card-image-empty"><span>No image</span></div>
                    )}
                  </div>
                  <div className="place-card-content">
                    <div className="place-card-title-row">
                      <h3>{place.name}</h3>
                      <span className="place-card-category">{place.category}</span>
                    </div>
                    <div className="place-card-location">
                      <MapPin size={14} />
                      <span>{place.location}</span>
                    </div>
                    <p className="place-card-description">{place.description}</p>
                    <div className="place-card-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => onOpenPlace?.(place)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditPlace(place)}
                          title="Edit Place"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeletePlace(place.id)}
                          style={{ color: 'var(--color-danger)' }}
                          title="Delete Place"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenAddCamp(place.id)}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        Launch Campaign
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Campaigns */}
      {activeTab === 'campaigns' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Promotional Campaigns</h3>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenAddCamp()}
              disabled={places.length === 0}
            >
              <PlusCircle size={14} style={{ marginRight: '4px' }} />
              Create Campaign
            </button>
          </div>

          {campaigns.length === 0 ? (
            <EmptyState
              title="No Campaigns Launched"
              message="Create a promotional campaign to partner with verified creators and increase footfall to your destination."
            />
          ) : (
            campaigns.map((camp) => {
              const place = places.find((p) => p.id === camp.placeId)
              const campApps = applications.filter((a) => a.campaignId === camp.id)
              const selectedCreator = users.find((u) => u.id === camp.selectedCreatorId)
              const uploadedReel = reels.find((r) => r.id === camp.reelId)

              return (
                <div key={camp.id} className="campaign-card">
                  <div className="campaign-header">
                    <div>
                      <h4 className="campaign-title">{camp.title}</h4>
                      {place && (
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          📍 Destination: {place.name}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`status-badge ${camp.status?.toLowerCase().replace(/[^a-z]/g, '')}`}>
                        {camp.status}
                      </span>
                      <span className="campaign-budget">₹{camp.maxBudget?.toLocaleString()}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: '8px 0' }}>
                    {camp.description}
                  </p>

                  <div className="campaign-requirements">
                    <span className="req-pill">Min Followers: {camp.minFollowers?.toLocaleString()}</span>
                    <span className="req-pill">Min Score: {camp.minCreatorScore}</span>
                    <span className="req-pill">Deadline: {camp.deadline || '30 days'}</span>
                    <span className="req-pill">Applicants: {campApps.length}</span>
                  </div>

                  {/* If creator selected */}
                  {selectedCreator && (
                    <div style={{ padding: '10px 12px', background: 'var(--color-surface)', borderRadius: '8px', margin: '10px 0', fontSize: '13px' }}>
                      <strong>Selected Creator:</strong> {selectedCreator.name} (@{selectedCreator.username})
                      {camp.status === 'Reel Uploaded' && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                            Deliverable submitted{uploadedReel ? `: "${uploadedReel.caption}"` : '!'}
                          </span>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCompleteCampaign(camp.id, selectedCreator.id)}
                          >
                            Approve Deliverable & Pay ₹{camp.maxBudget}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setAiMatchCampaign(camp)
                      }}
                      style={{ gap: '4px' }}
                    >
                      <Sparkles size={14} color="#7c3aed" />
                      AI Creator Matcher
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveTab('applications')}
                    >
                      View Applications ({campApps.length})
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* TAB 3: Applications & Creator Selection */}
      {activeTab === 'applications' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Creator Applications</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Review applicants, inspect their verified metrics, and select the creator best suited for each campaign.
            </p>
          </div>

          {campaigns.length === 0 ? (
            <EmptyState title="No Campaigns" message="Create a campaign first to receive applications." />
          ) : (
            campaigns.map((camp) => {
              const campApps = applications.filter((a) => a.campaignId === camp.id)
              if (campApps.length === 0) return null

              return (
                <div key={camp.id} style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                      Applications for: {camp.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Status: {camp.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {campApps.map((app) => {
                      const creator = users.find((u) => u.id === app.creatorId)
                      if (!creator) return null

                      const isSelected = camp.selectedCreatorId === creator.id
                      const matchResult = calculateAiMatch(creator, camp)

                      return (
                        <div
                          key={app.id}
                          className="card"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                            borderLeft: isSelected ? '4px solid var(--color-success)' : undefined,
                          }}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div
                              style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '50%',
                                background: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '16px',
                                overflow: 'hidden',
                              }}
                            >
                              {creator.profileImage ? (
                                <img src={creator.profileImage} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                (creator.name || 'C').charAt(0).toUpperCase()
                              )}
                            </div>

                            <div>
                              <strong style={{ fontSize: '15px', color: 'var(--color-text)' }}>{creator.name}</strong>
                              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block' }}>
                                @{creator.username || 'creator'} • Score: {creator.creatorScore ?? 75}/100 • Followers: {(creator.followers || 0).toLocaleString()}
                              </span>
                              <div style={{ marginTop: '4px' }}>
                                <span className="ai-match-badge">
                                  ⚡ {matchResult.percentage}% Match Score
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {isSelected ? (
                              <span className="status-badge selected">
                                ✓ Creator Selected
                              </span>
                            ) : camp.selectedCreatorId ? (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                Not Selected
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSelectCreator(camp.id, creator.id)}
                              >
                                Select Creator
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* AI CREATOR MATCHER PROTOTYPE MODAL (Phase 23) */}
      {aiMatchCampaign && (
        <Modal
          title={`AI Creator Matcher — ${aiMatchCampaign.title}`}
          onClose={() => setAiMatchCampaign(null)}
        >
          <div>
            <div style={{ padding: '12px', background: '#ede9fe', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6d28d9', fontWeight: 700, fontSize: '14px' }}>
                <Sparkles size={16} />
                Rule-Based Algorithmic Matching
              </div>
              <p style={{ fontSize: '12px', color: '#5b21b6', margin: '4px 0 0' }}>
                Evaluates registered travel creators on minimum follower thresholds, historical Creator Score, and relevant destination content.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto' }}>
              {users.filter((u) => u.role === 'creator').length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No registered creators yet.</p>
              ) : (
                users
                  .filter((u) => u.role === 'creator')
                  .map((creator) => {
                    const match = calculateAiMatch(creator, aiMatchCampaign)
                    const isSelected = aiMatchCampaign.selectedCreatorId === creator.id

                    return (
                      <div
                        key={creator.id}
                        style={{
                          padding: '12px',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          background: 'var(--color-surface)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong style={{ fontSize: '14px' }}>{creator.name}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block' }}>
                              @{creator.username} • {creator.followers?.toLocaleString() || 0} Followers
                            </span>
                          </div>
                          <span className="ai-match-badge">
                            {match.percentage}% Match
                          </span>
                        </div>

                        <div className="ai-reasons-list">
                          {match.reasons.map((r, idx) => (
                            <span key={idx}>{r}</span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                          {isSelected ? (
                            <span className="status-badge selected">Selected</span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                handleSelectCreator(aiMatchCampaign.id, creator.id)
                                setAiMatchCampaign(null)
                              }}
                            >
                              Select This Creator
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Place Modal */}
      {showPlaceModal && (
        <Modal
          title={editingPlaceId ? 'Edit Destination' : 'Add New Place'}
          onClose={() => setShowPlaceModal(false)}
        >
          <form onSubmit={handlePlaceSubmit}>
            <div className="input-group">
              <label>Place Name</label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="e.g. Sunset Point Beach"
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Category</label>
                <select
                  value={placeCategory}
                  onChange={(e) => setPlaceCategory(e.target.value)}
                >
                  <option value="Beach">Beach</option>
                  <option value="Nature">Nature</option>
                  <option value="Heritage">Heritage</option>
                  <option value="Mountain">Mountain</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              <div className="input-group">
                <label>City & State Location</label>
                <input
                  type="text"
                  value={placeLocation}
                  onChange={(e) => setPlaceLocation(e.target.value)}
                  placeholder="e.g. Mangalore, Karnataka"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={placeLat}
                  onChange={(e) => setPlaceLat(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={placeLng}
                  onChange={(e) => setPlaceLng(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Cover Image URL</label>
              <input
                type="url"
                value={placeCoverImage}
                onChange={(e) => setPlaceCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea
                rows={3}
                value={placeDesc}
                onChange={(e) => setPlaceDesc(e.target.value)}
                placeholder="Describe the atmosphere, visitor experience, and scenic beauty..."
              />
            </div>

            <div className="input-group">
              <label>Facilities & Highlights (comma separated)</label>
              <input
                type="text"
                value={placeFacilities}
                onChange={(e) => setPlaceFacilities(e.target.value)}
                placeholder="Parking, Restrooms, Sunset View, Cafe"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPlaceModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingPlaceId ? 'Update Place' : 'Create Place'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Campaign Modal */}
      {showCampModal && (
        <Modal title="Launch Creator Campaign" onClose={() => setShowCampModal(false)}>
          <form onSubmit={handleCampSubmit}>
            <div className="input-group">
              <label>Target Destination</label>
              <select
                value={campPlaceId}
                onChange={(e) => setCampPlaceId(e.target.value)}
                required
              >
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Campaign Title</label>
              <input
                type="text"
                value={campTitle}
                onChange={(e) => setCampTitle(e.target.value)}
                placeholder="e.g. Monsoon Trek Showcase"
                required
              />
            </div>

            <div className="input-group">
              <label>Campaign Description</label>
              <textarea
                rows={2}
                value={campDesc}
                onChange={(e) => setCampDesc(e.target.value)}
                placeholder="Objectives and deliverables required from the creator..."
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Min Followers</label>
                <input
                  type="number"
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(Number(e.target.value))}
                  required
                />
              </div>

              <div className="input-group">
                <label>Min Creator Score</label>
                <input
                  type="number"
                  value={minCreatorScore}
                  onChange={(e) => setMinCreatorScore(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Base Payment (₹)</label>
                <input
                  type="number"
                  value={basePayment}
                  onChange={(e) => setBasePayment(Number(e.target.value))}
                  required
                />
              </div>

              <div className="input-group">
                <label>Performance Bonus (₹)</label>
                <input
                  type="number"
                  value={bonusPayment}
                  onChange={(e) => setBonusPayment(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Total Budget (₹)</label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  required
                />
              </div>

              <div className="input-group">
                <label>Upload Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Perks / Facilities Provided</label>
              <input
                type="text"
                value={campFacilities}
                onChange={(e) => setCampFacilities(e.target.value)}
                placeholder="Free stay, meals, local guide..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCampModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Launch Campaign
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Business Profile Modal */}
      {showEditModal && (
        <Modal title="Edit Business Info" onClose={() => setShowEditModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateUserProfile(currentUser.id, {
                name: editName.trim(),
                bio: editBio.trim(),
                profileImage: editProfileImage.trim(),
              })
              setShowEditModal(false)
            }}
          >
            <div className="input-group">
              <label>Business / Promoter Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Bio & Business Overview</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Logo / Cover Image URL</label>
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
    </div>
  )
}

export default BusinessDashboard
