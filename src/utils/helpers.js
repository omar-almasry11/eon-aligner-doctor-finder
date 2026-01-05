// Generate Google Maps directions URL
export function getDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// Get doctor photo URL with fallback
export function getDoctorPhotoUrl(doctor) {
  if (!doctor.Photo) return null
  return doctor.Photo
}

// Sort strings alphabetically (for country/city lists)
export function sortAlphabetically(arr) {
  return [...arr].sort((a, b) => a.localeCompare(b))
}
