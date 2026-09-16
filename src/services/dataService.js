import { getData, saveData } from './storage'

function notifyChange() {
  window.dispatchEvent(new Event('placepulse_data_changed'))
}

// ----------------- PLACES -----------------
export function getPlaces() {
  const data = getData()
  return data?.places || []
}

export function getPlaceById(id) {
  const places = getPlaces()
  return places.find((p) => p.id === id) || null
}

export function addPlace(placeData, businessId = null) {
  const data = getData()
  const newPlace = {
    id: 'place_' + Date.now(),
    businessId: businessId,
    name: placeData.name || '',
    category: placeData.category || 'General',
    location: placeData.location || '',
    latitude: Number(placeData.latitude) || 12.9141,
    longitude: Number(placeData.longitude) || 74.8560,
    description: placeData.description || '',
    facilities: Array.isArray(placeData.facilities)
      ? placeData.facilities
      : (placeData.facilities || '').split(',').map((f) => f.trim()).filter(Boolean),
    coverImage: placeData.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    createdAt: new Date().toISOString(),
  }

  data.places = data.places || []
  data.places.unshift(newPlace)
  saveData(data)
  notifyChange()
  return newPlace
}

export function updatePlace(id, updates) {
  const data = getData()
  data.places = (data.places || []).map((p) => (p.id === id ? { ...p, ...updates } : p))
  saveData(data)
  notifyChange()
}

export function deletePlace(id) {
  const data = getData()
  data.places = (data.places || []).filter((p) => p.id !== id)
  // Also clean up campaigns referencing this place
  data.campaigns = (data.campaigns || []).filter((c) => c.placeId !== id)
  saveData(data)
  notifyChange()
}

// ----------------- REELS & SOCIAL INTERACTIONS -----------------
export function getReels() {
  const data = getData()
  return data?.reels || []
}

export function getReelById(id) {
  const reels = getReels()
  return reels.find((r) => r.id === id) || null
}

export function addReel({ creatorId, placeId, mediaUrl, caption, campaignId = null }) {
  const data = getData()
  const newReel = {
    id: 'reel_' + Date.now(),
    creatorId,
    placeId,
    campaignId,
    mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    caption: caption || '',
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    createdAt: new Date().toISOString(),
  }

  data.reels = data.reels || []
  data.reels.unshift(newReel)

  // Mark place as visited by creator
  if (creatorId && placeId) {
    data.visitedPlaces = data.visitedPlaces || []
    const alreadyVisited = data.visitedPlaces.some(
      (v) => v.creatorId === creatorId && v.placeId === placeId
    )
    if (!alreadyVisited) {
      data.visitedPlaces.push({
        id: 'vp_' + Date.now(),
        creatorId,
        placeId,
        visitedAt: new Date().toISOString(),
      })
    }
  }

  saveData(data)
  notifyChange()
  return newReel
}

export function isReelLiked(reelId, userId) {
  if (!userId) return false
  const data = getData()
  return (data?.likes || []).some((l) => l.reelId === reelId && l.userId === userId)
}

export function toggleLikeReel(reelId, userId) {
  if (!userId) return false
  const data = getData()
  data.likes = data.likes || []
  data.reels = data.reels || []

  const index = data.likes.findIndex((l) => l.reelId === reelId && l.userId === userId)
  const reel = data.reels.find((r) => r.id === reelId)

  let liked
  if (index >= 0) {
    data.likes.splice(index, 1)
    if (reel && reel.likeCount > 0) reel.likeCount -= 1
    liked = false
  } else {
    data.likes.push({
      id: 'like_' + Date.now(),
      reelId,
      userId,
      createdAt: new Date().toISOString(),
    })
    if (reel) reel.likeCount = (reel.likeCount || 0) + 1
    liked = true

    // Send notification to creator
    if (reel && reel.creatorId !== userId) {
      addNotification(reel.creatorId, 'New Like', 'Someone liked your place reel.')
    }
  }

  saveData(data)
  notifyChange()
  return liked
}

export function isItemSaved(type, targetId, userId) {
  if (!userId) return false
  const data = getData()
  return (data?.saves || []).some((s) => s.type === type && s.targetId === targetId && s.userId === userId)
}

export function toggleSaveItem(type, targetId, userId) {
  if (!userId) return false
  const data = getData()
  data.saves = data.saves || []

  const index = data.saves.findIndex(
    (s) => s.type === type && s.targetId === targetId && s.userId === userId
  )

  let saved
  if (index >= 0) {
    data.saves.splice(index, 1)
    saved = false
  } else {
    data.saves.push({
      id: 'save_' + Date.now(),
      type,
      targetId,
      userId,
      createdAt: new Date().toISOString(),
    })
    saved = true
  }

  saveData(data)
  notifyChange()
  return saved
}

export function getCommentsByReel(reelId) {
  const data = getData()
  return (data?.comments || []).filter((c) => c.reelId === reelId)
}

export function addComment(reelId, userId, userName, userAvatar, text) {
  if (!text || !text.trim()) return null
  const data = getData()
  data.comments = data.comments || []
  data.reels = data.reels || []

  const newComment = {
    id: 'comment_' + Date.now(),
    reelId,
    userId,
    userName: userName || 'Explorer',
    userAvatar: userAvatar || '',
    text: text.trim(),
    createdAt: new Date().toISOString(),
  }

  data.comments.push(newComment)

  const reel = data.reels.find((r) => r.id === reelId)
  if (reel) {
    reel.commentCount = (reel.commentCount || 0) + 1
    if (reel.creatorId !== userId) {
      addNotification(reel.creatorId, 'New Comment', `${userName || 'An explorer'} commented: "${text.slice(0, 30)}..."`)
    }
  }

  saveData(data)
  notifyChange()
  return newComment
}

export function incrementReelViews(reelId) {
  const data = getData()
  data.reels = data.reels || []
  const reel = data.reels.find((r) => r.id === reelId)
  if (reel) {
    reel.viewCount = (reel.viewCount || 0) + 1
    saveData(data)
    notifyChange()
  }
}

export function getUserSavedPlaces(userId) {
  if (!userId) return []
  const data = getData()
  const savedIds = (data?.saves || [])
    .filter((s) => s.userId === userId && s.type === 'place')
    .map((s) => s.targetId)
  return (data?.places || []).filter((p) => savedIds.includes(p.id))
}

export function getUserLikedReels(userId) {
  if (!userId) return []
  const data = getData()
  const likedReelIds = (data?.likes || [])
    .filter((l) => l.userId === userId)
    .map((l) => l.reelId)
  return (data?.reels || []).filter((r) => likedReelIds.includes(r.id))
}

// ----------------- CAMPAIGNS & MARKETPLACE -----------------
export function getCampaigns() {
  const data = getData()
  return data?.campaigns || []
}

export function getCampaignById(id) {
  const campaigns = getCampaigns()
  return campaigns.find((c) => c.id === id) || null
}

export function addCampaign(campaignData, businessId) {
  const data = getData()
  const newCamp = {
    id: 'camp_' + Date.now(),
    businessId,
    placeId: campaignData.placeId,
    title: campaignData.title,
    description: campaignData.description || '',
    minFollowers: Number(campaignData.minFollowers) || 0,
    minAvgViews: Number(campaignData.minAvgViews) || 0,
    minCreatorScore: Number(campaignData.minCreatorScore) || 50,
    visitDate: campaignData.visitDate || '',
    deadline: campaignData.deadline || '',
    reelsRequired: Number(campaignData.reelsRequired) || 1,
    basePayment: Number(campaignData.basePayment) || 1000,
    bonusPayment: Number(campaignData.bonusPayment) || 0,
    maxBudget: Number(campaignData.maxBudget) || 2000,
    facilities: campaignData.facilities || '',
    requirements: campaignData.requirements || '',
    status: 'Available',
    selectedCreatorId: null,
    createdAt: new Date().toISOString(),
  }

  data.campaigns = data.campaigns || []
  data.campaigns.unshift(newCamp)
  saveData(data)
  notifyChange()
  return newCamp
}

export function updateCampaign(id, updates) {
  const data = getData()
  data.campaigns = (data.campaigns || []).map((c) => (c.id === id ? { ...c, ...updates } : c))
  saveData(data)
  notifyChange()
}

// ----------------- APPLICATIONS & AGREEMENTS -----------------
export function getApplications() {
  const data = getData()
  return data?.applications || []
}

export function applyToCampaign(campaignId, creatorId) {
  const data = getData()
  data.applications = data.applications || []

  // Check duplicate
  const exists = data.applications.some(
    (a) => a.campaignId === campaignId && a.creatorId === creatorId
  )
  if (exists) return { success: false, message: 'You have already applied to this campaign.' }

  const app = {
    id: 'app_' + Date.now(),
    campaignId,
    creatorId,
    status: 'Applied',
    appliedAt: new Date().toISOString(),
  }

  data.applications.push(app)

  // Notify business
  const camp = (data.campaigns || []).find((c) => c.id === campaignId)
  if (camp && camp.businessId) {
    addNotification(camp.businessId, 'New Creator Application', `A creator applied for "${camp.title}".`)
  }

  saveData(data)
  notifyChange()
  return { success: true, application: app }
}

export function selectCreator(campaignId, creatorId) {
  const data = getData()
  data.campaigns = data.campaigns || []
  data.applications = data.applications || []
  data.agreements = data.agreements || []

  // Update campaign
  const camp = data.campaigns.find((c) => c.id === campaignId)
  if (!camp) return false
  camp.selectedCreatorId = creatorId
  camp.status = 'Selected'

  // Update applications
  data.applications.forEach((a) => {
    if (a.campaignId === campaignId) {
      a.status = a.creatorId === creatorId ? 'Selected' : 'Rejected'
    }
  })

  // Create agreement
  const agreement = {
    id: 'agr_' + Date.now(),
    campaignId,
    creatorId,
    businessId: camp.businessId,
    status: 'Agreement Pending',
    createdAt: new Date().toISOString(),
  }
  data.agreements.push(agreement)

  // Notify creator
  addNotification(
    creatorId,
    'Campaign Selection!',
    `Congratulations! You were selected for "${camp.title}". Please accept the agreement to proceed.`
  )

  saveData(data)
  notifyChange()
  return true
}

export function acceptAgreement(campaignId, creatorId) {
  const data = getData()
  data.campaigns = data.campaigns || []
  data.agreements = data.agreements || []

  const camp = data.campaigns.find((c) => c.id === campaignId)
  if (camp) camp.status = 'Visit Scheduled'

  const agr = data.agreements.find((a) => a.campaignId === campaignId && a.creatorId === creatorId)
  if (agr) agr.status = 'Agreement Accepted'

  // Notify business
  if (camp) {
    addNotification(camp.businessId, 'Agreement Accepted', `Creator accepted the agreement for "${camp.title}". Visit is scheduled.`)
  }

  saveData(data)
  notifyChange()
  return true
}

export function markVisitCompleted(campaignId, creatorId, placeId) {
  const data = getData()
  data.campaigns = data.campaigns || []
  data.visitedPlaces = data.visitedPlaces || []

  const camp = data.campaigns.find((c) => c.id === campaignId)
  if (camp) camp.status = 'Visited / Reel Pending'

  // Record visited place
  if (placeId) {
    const alreadyVisited = data.visitedPlaces.some(
      (v) => v.creatorId === creatorId && v.placeId === placeId
    )
    if (!alreadyVisited) {
      data.visitedPlaces.push({
        id: 'vp_' + Date.now(),
        creatorId,
        placeId,
        visitedAt: new Date().toISOString(),
      })
    }
  }

  // Notify business
  if (camp) {
    addNotification(camp.businessId, 'Place Visited', `Creator has visited the location for "${camp.title}". Reel upload is pending.`)
  }

  saveData(data)
  notifyChange()
  return true
}

export function submitCampaignReel(campaignId, creatorId, placeId, mediaUrl, caption) {
  const data = getData()
  data.campaigns = data.campaigns || []

  // Add reel
  const reel = addReel({ creatorId, placeId, mediaUrl, caption, campaignId })

  // Update campaign
  const camp = data.campaigns.find((c) => c.id === campaignId)
  if (camp) {
    camp.status = 'Reel Uploaded'
    camp.reelId = reel.id
    addNotification(camp.businessId, 'Reel Uploaded', `Creator has uploaded the promotional reel for "${camp.title}".`)
  }

  saveData(data)
  notifyChange()
  return reel
}

export function completeCampaign(campaignId, creatorId) {
  const data = getData()
  data.campaigns = data.campaigns || []
  data.users = data.users || []

  const camp = data.campaigns.find((c) => c.id === campaignId)
  if (!camp) return false
  camp.status = 'Completed'

  // Update creator stats
  const creator = data.users.find((u) => u.id === creatorId)
  if (creator) {
    creator.earnings = (creator.earnings || 0) + (camp.basePayment || 0) + (camp.bonusPayment || 0)
    creator.creatorScore = Math.min(100, (creator.creatorScore || 80) + 5)
  }

  addNotification(creatorId, 'Campaign Completed!', `Campaign "${camp.title}" completed. Payout of ₹${(camp.basePayment || 0) + (camp.bonusPayment || 0)} credited!`)

  saveData(data)
  notifyChange()
  return true
}

// ----------------- VISITED PLACES -----------------
export function getVisitedPlaces(creatorId) {
  const data = getData()
  const vps = (data?.visitedPlaces || []).filter((v) => v.creatorId === creatorId)
  const placeIds = vps.map((v) => v.placeId)
  return (data?.places || []).filter((p) => placeIds.includes(p.id))
}

// ----------------- NOTIFICATIONS -----------------
export function getNotifications(userId) {
  const data = getData()
  return (data?.notifications || []).filter((n) => n.userId === userId)
}

export function addNotification(userId, title, message) {
  const data = getData()
  data.notifications = data.notifications || []
  data.notifications.unshift({
    id: 'notif_' + Date.now(),
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  })
  saveData(data)
  notifyChange()
}

export function markNotificationsRead(userId) {
  const data = getData()
  data.notifications = (data.notifications || []).map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  )
  saveData(data)
  notifyChange()
}

// ----------------- MESSAGES -----------------
export function getConversations(userId) {
  const data = getData()
  const msgs = data?.messages || []
  const userMsgs = msgs.filter((m) => m.senderId === userId || m.receiverId === userId)

  const partnerIds = new Set()
  userMsgs.forEach((m) => {
    if (m.senderId === userId) partnerIds.add(m.receiverId)
    else partnerIds.add(m.senderId)
  })

  const users = data?.users || []
  return users.filter((u) => partnerIds.has(u.id))
}

export function getMessagesBetween(userId1, userId2) {
  const data = getData()
  return (data?.messages || []).filter(
    (m) =>
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
  )
}

export function sendMessage(senderId, receiverId, text) {
  if (!text || !text.trim()) return null
  const data = getData()
  data.messages = data.messages || []

  const msg = {
    id: 'msg_' + Date.now(),
    senderId,
    receiverId,
    text: text.trim(),
    timestamp: new Date().toISOString(),
  }

  data.messages.push(msg)
  saveData(data)
  notifyChange()
  return msg
}

// ----------------- USERS -----------------
export function getAllUsers() {
  const data = getData()
  return data?.users || []
}

export function updateUserProfile(userId, profileUpdates) {
  const data = getData()
  data.users = (data.users || []).map((u) => (u.id === userId ? { ...u, ...profileUpdates } : u))
  if (data.currentUser && data.currentUser.id === userId) {
    data.currentUser = { ...data.currentUser, ...profileUpdates }
  }
  saveData(data)
  notifyChange()
  return data.currentUser
}
