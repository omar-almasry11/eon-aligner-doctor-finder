
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Test Airtable connection
export const testAirtableConnection = async () => {
  try {
    console.log('Testing Airtable API connection...')
    const response = await fetch(
      'https://api.airtable.com/v0/meta/bases',
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('✓ Airtable connection successful!')
    console.log('Your bases:', data.bases)
    return data
  } catch (error) {
    console.error('✗ Airtable connection failed:', error)
    throw error
  }
}

// Test Google Maps API
export const testGoogleMapsConnection = async () => {
  try {
    console.log('Testing Google Maps API connection...')
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=12&size=400x300&key=${GOOGLE_MAPS_KEY}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    console.log('✓ Google Maps connection successful!')
    console.log('Map image URL:', response.url)
    return response
  } catch (error) {
    console.error('✗ Google Maps connection failed:', error)
    throw error
  }
}

export const fetchDoctors = async (baseId, tableName) => {
  const allRecords = []
  let offset = null

  try {
    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`)
      if (offset) {
        url.searchParams.set('offset', offset)
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      allRecords.push(...data.records)
      offset = data.offset // Will be undefined when no more pages
    } while (offset)

    return allRecords
  } catch (error) {
    console.error('Error fetching doctors:', error)
    throw error
  }
}

export const helloWorld = () => {
  console.log('Hello, World!')
}