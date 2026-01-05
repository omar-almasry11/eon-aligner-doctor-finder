import { useState } from 'react'
import { useDoctors } from '../hooks/useDoctors'
import { useFilteredDoctors } from '../hooks/useFilteredDoctors'
import { useMapCamera } from '../hooks/useMapCamera'
import { DoctorMap } from './Map/DoctorMap'
import { FilterBar } from './Filters/FilterBar'
import { DoctorList } from './DoctorList/DoctorList'
import { LoadingSpinner } from './UI/LoadingSpinner'

export function DoctorFinder() {
  // Filter state
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  // Fetch doctors from Airtable
  const { doctors, loading, error } = useDoctors()

  // Filter doctors based on selection
  const { filteredDoctors, countries, cities } = useFilteredDoctors(
    doctors,
    selectedCountry,
    selectedCity
  )

  // Compute map camera position
  const { center: mapCenter, zoom: mapZoom } = useMapCamera(
    filteredDoctors,
    selectedCountry,
    selectedCity
  )

  const handleReset = () => {
    setSelectedCountry(null)
    setSelectedCity(null)
    setSelectedDoctor(null)
  }

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load doctors</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-teal-600">Eon Aligner</span> Doctor Finder
          </h1>
        </div>
      </header>

      {/* Filters */}
      <FilterBar
        countries={countries}
        cities={cities}
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        onCountryChange={setSelectedCountry}
        onCityChange={setSelectedCity}
        onReset={handleReset}
      />

      {/* Main Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Doctor List */}
          <aside className="w-80 bg-white border-r flex-shrink-0 hidden md:block">
            <DoctorList
              doctors={filteredDoctors}
              selectedDoctor={selectedDoctor}
              onDoctorSelect={handleDoctorSelect}
              loading={loading}
            />
          </aside>

          {/* Map */}
          <main className="flex-1">
            <DoctorMap
              doctors={filteredDoctors}
              selectedDoctor={selectedDoctor}
              onDoctorSelect={handleDoctorSelect}
              mapCenter={mapCenter}
              zoom={mapZoom}
            />
          </main>
        </div>
      )}
    </div>
  )
}
