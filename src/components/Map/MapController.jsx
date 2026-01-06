import { useEffect, useRef } from 'react'
import { useMap } from '@vis.gl/react-google-maps'

export function MapController({ center, zoom }) {
  const map = useMap()
  const previousCenter = useRef(null)
  const previousZoom = useRef(null)

  useEffect(() => {
    if (!map || !center) return

    // Check if this is a meaningful change
    const centerChanged = !previousCenter.current ||
      previousCenter.current.lat !== center.lat ||
      previousCenter.current.lng !== center.lng

    const zoomChanged = previousZoom.current !== zoom

    if (!centerChanged && !zoomChanged) return

    // Use panTo for smooth panning and setZoom for zoom
    // Both are called together so they animate simultaneously
    map.panTo(center)
    map.setZoom(zoom)

    previousCenter.current = center
    previousZoom.current = zoom
  }, [map, center, zoom])

  return null // Renderless component
}
