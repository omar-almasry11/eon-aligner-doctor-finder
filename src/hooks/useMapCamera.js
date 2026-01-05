import { useMemo } from 'react'
import { MAP_DEFAULTS } from '../utils/constants'

export function useMapCamera(filteredDoctors, selectedCountry, selectedCity) {
  return useMemo(() => {
    // If no filters, use defaults
    if (!selectedCountry && !selectedCity) {
      return { center: null, zoom: MAP_DEFAULTS.countryZoom }
    }

    // If city selected, center on first doctor in that city with city zoom
    if (selectedCity && filteredDoctors.length > 0) {
      const cityDoctor = filteredDoctors.find(d => d.city === selectedCity)
      if (cityDoctor) {
        return {
          center: { lat: cityDoctor.latitude, lng: cityDoctor.longitude },
          zoom: MAP_DEFAULTS.cityZoom
        }
      }
    }

    // If only country selected, center on average of all doctors with country zoom
    if (selectedCountry && filteredDoctors.length > 0) {
      const avgLat = filteredDoctors.reduce((sum, d) => sum + d.latitude, 0) / filteredDoctors.length
      const avgLng = filteredDoctors.reduce((sum, d) => sum + d.longitude, 0) / filteredDoctors.length
      return {
        center: { lat: avgLat, lng: avgLng },
        zoom: MAP_DEFAULTS.countryZoom
      }
    }

    // Fallback to defaults
    return { center: null, zoom: MAP_DEFAULTS.countryZoom }
  }, [filteredDoctors, selectedCountry, selectedCity])
}
