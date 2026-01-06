import { DoctorCard } from './DoctorCard'
import { LoadingSpinner } from '../UI/LoadingSpinner'

export function DoctorList({ doctors, selectedDoctor, onDoctorSelect, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-lg font-medium">No doctors found</p>
        <p className="text-sm">Try selecting a different location</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-gray-50">
        <span className="text-sm text-gray-600">
          {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {doctors.map(doctor => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            isSelected={selectedDoctor?.id === doctor.id}
            onClick={() => onDoctorSelect(doctor)}
          />
        ))}
      </div>
    </div>
  )
}
