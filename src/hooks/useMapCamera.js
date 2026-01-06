import { useMemo } from 'react'
import { MAP_DEFAULTS } from '../utils/constants'

export function useMapCamera(filteredDoctors, selectedCountry, selectedCity, selectedDoctor) {
  return useMemo(() => {
    // Priority 1: If a specific doctor is selected, zoom to their location
    if (selectedDoctor) {
      return {
        center: { lat: selectedDoctor.latitude, lng: selectedDoctor.longitude },
        zoom: 15 // Close zoom for individual doctor
      }
    }

    // Priority 2: If city selected, center on first doctor in that city with city zoom
    if (selectedCity && filteredDoctors.length > 0) {
      const cityDoctor = filteredDoctors.find(d => d.city === selectedCity)
      if (cityDoctor) {
        return {
          center: { lat: cityDoctor.latitude, lng: cityDoctor.longitude },
          zoom: MAP_DEFAULTS.cityZoom
        }
      }
    }

    // Priority 3: If only country selected, center on average of all doctors with country zoom
    if (selectedCountry && filteredDoctors.length > 0) {
      const avgLat = filteredDoctors.reduce((sum, d) => sum + d.latitude, 0) / filteredDoctors.length
      const avgLng = filteredDoctors.reduce((sum, d) => sum + d.longitude, 0) / filteredDoctors.length
      return {
        center: { lat: avgLat, lng: avgLng },
        zoom: MAP_DEFAULTS.countryZoom
      }
    }

    // Fallback to defaults
    return { center: MAP_DEFAULTS.center, zoom: MAP_DEFAULTS.countryZoom }
  }, [filteredDoctors, selectedCountry, selectedCity, selectedDoctor])
}
