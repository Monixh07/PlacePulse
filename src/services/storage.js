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
  }
}