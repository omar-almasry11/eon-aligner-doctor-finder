import { APIProvider, Map } from '@vis.gl/react-google-maps'
import { DoctorMarker } from './DoctorMarker'
import { MapController } from './MapController'
import { MAP_DEFAULTS } from '../../utils/constants'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export function DoctorMap({ doctors, selectedDoctor, onDoctorSelect, mapCenter, zoom }) {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY}>
      <Map
        defaultCenter={MAP_DEFAULTS.center}
        defaultZoom={MAP_DEFAULTS.countryZoom}
        gestureHandling="cooperative"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        {doctors.map(doctor => (
          <DoctorMarker
            key={doctor.id}
            doctor={doctor}
            isSelected={selectedDoctor?.id === doctor.id}
            onSelect={onDoctorSelect}
          />
        ))}
        <MapController center={mapCenter} zoom={zoom} />
      </Map>
    </APIProvider>
  )
}
