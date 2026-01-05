import { useEffect } from 'react'
import { useMap } from '@vis.gl/react-google-maps'

export function MapController({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !center) return
    map.panTo(center)
    map.setZoom(zoom)
  }, [map, center, zoom])

  return null // Renderless component
}
