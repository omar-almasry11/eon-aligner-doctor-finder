import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
  useMap
} from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'
import { useGeocode } from '../../hooks/useGeocode'
import { getDirectionsUrl } from '../../utils/helpers'
import { PIN_COLORS } from '../../utils/constants'

export function DoctorMarker({ doctor, isSelected, onSelect }) {
  // Lazy load address only when InfoWindow opens
  const { address, loading: addressLoading } = useGeocode(
    doctor.latitude,
    doctor.longitude,
    isSelected
  )
  const [markerRef, marker] = useAdvancedMarkerRef()
  const tooltipInfoWindowRef = useRef(null)
  const map = useMap()

  const handleMarkerClick = () => {
    onSelect?.(doctor)
  }

  const handleClose = () => {
    onSelect?.(null)
  }

  useEffect(() => {
    if (!marker || !window.google?.maps || !map) return

    if (!tooltipInfoWindowRef.current) {
      tooltipInfoWindowRef.current = new window.google.maps.InfoWindow({
        disableAutoPan: true,
        // Hover-only teaser: mouse leaves the pin to dismiss — no header/X needed.
        headerDisabled: true
      })
    }

    const tooltipInfoWindow = tooltipInfoWindowRef.current

    const openTooltip = () => {
      if (isSelected) return
      tooltipInfoWindow.setContent(
        `<div style="pointer-events:none; color:#1A1A1A; font-family:'Roboto',system-ui,sans-serif;">
           <div style="font-weight:600; font-size: 16px; margin-bottom: 6px;">${doctor.name}</div>
           <div style="color:#5C5C66; font-size: 14px;">Click to view clinic information</div>
         </div>`
      )
      tooltipInfoWindow.open({ map, anchor: marker })
    }

    const closeTooltip = () => {
      tooltipInfoWindow.close()
    }

    const mouseOverListener = marker.addListener('gmp-mouseover', openTooltip)

    const mouseOutListener = marker.addListener('gmp-mouseout', closeTooltip)

    const clickListener = marker.addListener('gmp-click', closeTooltip)

    const contentElement =
      marker.content instanceof Element ? marker.content : null
    if (contentElement) {
      contentElement.addEventListener('mouseenter', openTooltip)
      contentElement.addEventListener('mouseleave', closeTooltip)
    }

    return () => {
      mouseOverListener.remove()
      mouseOutListener.remove()
      clickListener.remove()
      if (contentElement) {
        contentElement.removeEventListener('mouseenter', openTooltip)
        contentElement.removeEventListener('mouseleave', closeTooltip)
      }
      tooltipInfoWindow.close()
    }
  }, [doctor.name, isSelected, marker, map])

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: doctor.latitude, lng: doctor.longitude }}
        onClick={handleMarkerClick}
      >
        <Pin
          background={PIN_COLORS.background}
          glyphColor={PIN_COLORS.glyph}
          borderColor={PIN_COLORS.border}
        />
      </AdvancedMarker>

      {isSelected && (
        <InfoWindow
          position={{ lat: doctor.latitude, lng: doctor.longitude }}
          onClose={handleClose}
        >
          <div className="min-w-[250px] px-2 pb-2 pt-1">
            <div className="flex items-start gap-3">
              {doctor.photo ? (
                <img
                  src={doctor.photo}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-brand" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-ink">{doctor.name}</h3>
                <p className="text-sm font-normal text-ink-muted">{doctor.clinic}</p>
                <p className="mt-1 text-sm text-ink-muted leading-snug">
                  {addressLoading ? (
                    <span className="text-ink-subtle">Loading address...</span>
                  ) : (
                    address || 'Address not found'
                  )}
                </p>
              </div>
            </div>

            <a
              href={getDirectionsUrl(doctor.latitude, doctor.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full justify-center inline-flex items-center gap-2 px-4 py-2 bg-brand font-medium text-[var(--color-ink)] rounded-md hover:bg-brand/90 transition-colors text-sm"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="var(--color-ink)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Get Directions
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  )
}
