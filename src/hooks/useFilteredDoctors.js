import { useMemo } from 'react'
import { sortAlphabetically } from '../utils/helpers'

export function useFilteredDoctors(doctors, selectedCountry, selectedCity) {
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      if (selectedCountry && doctor.country !== selectedCountry) return false
      if (selectedCity && doctor.city !== selectedCity) return false
      return true
    })
  }, [doctors, selectedCountry, selectedCity])

  // Extract unique countries
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(doctors.map(d => d.country).filter(Boolean))]
    return sortAlphabetically(uniqueCountries)
  }, [doctors])

  // Extract cities for selected country
  const cities = useMemo(() => {
    if (!selectedCountry) return []
    const uniqueCities = [...new Set(
      doctors
        .filter(d => d.country === selectedCountry)
        .map(d => d.city)
        .filter(Boolean)
    )]
    return sortAlphabetically(uniqueCities)
  }, [doctors, selectedCountry])

  return { filteredDoctors, countries, cities }
}
