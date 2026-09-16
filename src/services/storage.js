const STORAGE_KEY = 'placepulse_data'

export function getData() {
  const storedData = localStorage.getItem(STORAGE_KEY)

  if (!storedData) {
    return null
  }

  return JSON.parse(storedData)
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function initializeData(initialData) {
  const existingData = getData()

  if (!existingData) {
    saveData(initialData)
    return
  }

  let updated = false
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