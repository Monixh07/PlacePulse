const STORAGE_KEY = 'placepulse_data'
const STORAGE_VERSION_KEY = 'placepulse_storage_version'
const LEGACY_CLEANUP_VERSION = 2
const APPLICATION_COLLECTIONS = [
  'users',
  'places',
  'campaigns',
  'applications',
  'agreements',
  'reels',
  'comments',
  'likes',
  'saves',
  'ratings',
  'visitedPlaces',
  'notifications',
  'messages',
  'creatorStats',
  'businessStats',
]

export class StorageQuotaError extends Error {
  constructor() {
    super('PlacePulse storage is full. Remove an older upload or choose smaller media files.')
    this.name = 'StorageQuotaError'
  }
}

export function getData() {
  const storedData = localStorage.getItem(STORAGE_KEY)

  if (!storedData) {
    return null
  }

  return JSON.parse(storedData)
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    if (error?.name === 'QuotaExceededError') {
      throw new StorageQuotaError()
    }
    throw error
  }
}

export function initializeData(initialData) {
  let existingData = getData()

  if (!existingData) {
    existingData = { ...initialData, currentUser: null }
    saveData(existingData)
    localStorage.setItem(STORAGE_VERSION_KEY, String(LEGACY_CLEANUP_VERSION))
    return
  }

  let updated = false
  const storageVersion = Number.parseInt(localStorage.getItem(STORAGE_VERSION_KEY) || '0', 10)
  if (Number.isNaN(storageVersion) || storageVersion < LEGACY_CLEANUP_VERSION) {
    APPLICATION_COLLECTIONS.forEach((collection) => {
      existingData[collection] = []
    })
    existingData.currentUser = null
    saveData(existingData)
    localStorage.setItem(STORAGE_VERSION_KEY, String(LEGACY_CLEANUP_VERSION))
    return
  }

  // Authentication is owned by Supabase. Remove only legacy auth fields while
  // leaving all non-authentication collections and their data untouched.
  if (Array.isArray(existingData.users)) {
    existingData.users.forEach((user) => {
      if (Object.prototype.hasOwnProperty.call(user, 'password')) {
        delete user.password
        updated = true
      }
    })
  }
  if (existingData.currentUser !== null) {
    existingData.currentUser = null
    updated = true
  }

  Object.keys(initialData).forEach((key) => {
    if (existingData[key] === undefined) {
      existingData[key] = initialData[key]
      updated = true
    }
  })

  // If places exist but lack lat/lng, populate lat/lng from initialData where matching
  if (Array.isArray(existingData.places) && initialData.places) {
    existingData.places.forEach((p) => {
      if (p.latitude === undefined || p.longitude === undefined) {
        const seed = initialData.places.find((sp) => sp.id === p.id)
        if (seed) {
          p.latitude = seed.latitude
          p.longitude = seed.longitude
          p.coverImage = p.coverImage || seed.coverImage
          p.facilities = p.facilities || seed.facilities
          updated = true
        }
      }
    })
    // If existingData.places is empty, copy initialData places
    if (existingData.places.length === 0 && initialData.places.length > 0) {
      existingData.places = [...initialData.places]
      updated = true
    }
  }

  if (updated) {
    saveData(existingData)
  }
}