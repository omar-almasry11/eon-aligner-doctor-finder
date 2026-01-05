import { useState, useEffect } from 'react'
import { fetchDoctors } from '../utils/api'
import { AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from '../utils/constants'

export function useDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true)
        setError(null)
        const records = await fetchDoctors(AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME)

        // Transform Airtable records to normalized format
        const normalized = records
          .map(record => ({
            id: record.id,
            name: record.fields.Name || '',
            latitude: parseFloat(record.fields.Lat) || null,
            longitude: parseFloat(record.fields.Long) || null,
            city: record.fields.City || '',
            country: record.fields.Country || '',
            clinic: record.fields['Clinic Name'] || '',
            photo: record.fields['Doctor Portrait']?.[0]?.url || null
          }))
          // Filter out records without valid coordinates
          .filter(doctor => doctor.latitude && doctor.longitude)

        setDoctors(normalized)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    loadDoctors()
  }, [])

  return { doctors, loading, error }
}
