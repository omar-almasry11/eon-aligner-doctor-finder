const CACHE_KEY = 'geocode_cache'
const memoryCache = new Map()

// Load from localStorage on init
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      Object.entries(parsed).forEach(([key, value]) => {
        memoryCache.set(key, value)
      })
    }
  } catch (e) {
    console.warn('Failed to load geocode cache:', e)
  }
}

loadFromStorage()

export function getFromCache(key) {
  return memoryCache.get(key) || null
}

export function setInCache(key, value) {
  memoryCache.set(key, value)
  // Persist to localStorage
  try {
    const obj = Object.fromEntries(memoryCache)
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch (e) {
    console.warn('Failed to save geocode cache:', e)
  }
}
