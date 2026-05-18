import { useState } from 'react'
import { useDoctors } from '../hooks/useDoctors'
import { useFilteredDoctors } from '../hooks/useFilteredDoctors'
import { useMapCamera } from '../hooks/useMapCamera'
import { DoctorMap } from './Map/DoctorMap'
import { FilterBar } from './Filters/FilterBar'
import { DoctorList } from './DoctorList/DoctorList'
import { LoadingSpinner } from './UI/LoadingSpinner'
import logo from '../assets/logo.svg'

function SkipLink() {
  const handleClick = (event) => {
    event.preventDefault()
    const main = document.getElementById('main')
    if (!main) return

    main.focus({ preventScroll: false })
    main.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <a href="#main" className="skip-link" onClick={handleClick}>
      Skip to main content
    </a>
  )
}

const mainClassName =
  'flex-1 flex flex-col min-h-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'

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
    selectedCity,
    selectedDoctor
  )

  const handleReset = () => {
    setSelectedCountry(null)
    setSelectedCity(null)
    setSelectedDoctor(null)
  }

  const handleCountryChange = (country) => {
    setSelectedCountry(country)
    setSelectedDoctor(null) // Clear selected doctor when country changes
  }

  const handleCityChange = (city) => {
    setSelectedCity(city)
    setSelectedDoctor(null) // Clear selected doctor when city changes
  }

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col bg-surface-muted">
        <SkipLink />
        <header className="bg-surface shadow-sm">
          <div className="px-6 py-4 flex items-center">
            <img src={logo} alt="Eon Aligner" className="h-16 w-auto" />
          </div>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
          <div className="text-center p-8" role="alert">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-ink mb-2">Failed to load doctors</h2>
            <p className="text-ink-muted">{error.message}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-surface-muted">
      <SkipLink />

      <header className="bg-surface shadow-sm">
        <div className="px-6 py-4 flex items-center">
          <img src={logo} alt="Eon Aligner" className="h-16 w-auto" />
        </div>
      </header>

      <main id="main" tabIndex={-1} className={mainClassName}>
        <FilterBar
          countries={countries}
          cities={cities}
          selectedCountry={selectedCountry}
          selectedCity={selectedCity}
          onCountryChange={handleCountryChange}
          onCityChange={handleCityChange}
          onReset={handleReset}
        />

        {loading ? (
          <div role="status" className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-ink-muted">Loading doctors...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden min-h-0">
            <section
              aria-labelledby="doctors-heading"
              className="w-80 bg-surface flex-shrink-0 hidden md:block"
            >
              <DoctorList
                doctors={filteredDoctors}
                selectedDoctor={selectedDoctor}
                onDoctorSelect={handleDoctorSelect}
                loading={loading}
              />
            </section>

            <section aria-label="Doctor locations map" className="flex-1 min-h-0">
              <DoctorMap
                doctors={filteredDoctors}
                selectedDoctor={selectedDoctor}
                onDoctorSelect={handleDoctorSelect}
                mapCenter={mapCenter}
                zoom={mapZoom}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
