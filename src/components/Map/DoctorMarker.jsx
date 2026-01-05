import { useState } from 'react'
import { Marker, Pin, InfoWindow } from '@vis.gl/react-google-maps'
import { useGeocode } from '../../hooks/useGeocode'
import { getDirectionsUrl } from '../../utils/helpers'
import { PIN_COLORS } from '../../utils/constants'

export function DoctorMarker({ doctor, isSelected, onSelect }) {
  const [infoOpen, setInfoOpen] = useState(false)

  // Lazy load address only when InfoWindow opens
  const { address, loading: addressLoading } = useGeocode(
    doctor.latitude,
    doctor.longitude,
    infoOpen
  )

  const handleMarkerClick = () => {
    setInfoOpen(true)
    onSelect?.(doctor)
  }

  const handleClose = () => {
    setInfoOpen(false)
  }

  return (
    <>
      <Marker
        position={{ lat: doctor.latitude, lng: doctor.longitude }}
        onClick={handleMarkerClick}
      >
        <Pin
          background={PIN_COLORS.background}
          glyphColor={PIN_COLORS.glyph}
          borderColor={PIN_COLORS.border}
        />
      </Marker>

      {infoOpen && (
        <InfoWindow
          position={{ lat: doctor.latitude, lng: doctor.longitude }}
          onClose={handleClose}
        >
          <div className="min-w-[250px] p-2">
            <div className="flex gap-3">
              {doctor.photo ? (
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                <p className="text-sm text-teal-600">{doctor.clinic}</p>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              {addressLoading ? (
                <span className="text-gray-400">Loading address...</span>
              ) : (
                address || 'Address not found'
              )}
            </div>

            <a
              href={getDirectionsUrl(doctor.latitude, doctor.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
