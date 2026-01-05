import { useState, useEffect } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { getFromCache, setInCache } from '../utils/geocodeCache'

export function useGeocode(lat, lng, enabled = true) {
  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const geocodingLib = useMapsLibrary('geocoding')

  useEffect(() => {
    if (!enabled || !geocodingLib || !lat || !lng) return

    const cacheKey = `${lat},${lng}`

    // Check cache first
    const cached = getFromCache(cacheKey)
    if (cached) {
      setAddress(cached)
      return
    }

    // Fetch from API
    const geocoder = new geocodingLib.Geocoder()
    setLoading(true)
    setError(null)

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      setLoading(false)
      if (status === 'OK' && results[0]) {
        const formattedAddress = results[0].formatted_address
        setAddress(formattedAddress)
        setInCache(cacheKey, formattedAddress)
      } else {
        setAddress('Address not found')
        setError(new Error(`Geocoding failed: ${status}`))
      }
    })
  }, [lat, lng, enabled, geocodingLib])

  return { address, loading, error }
}
