// Airtable Configuration
export const AIRTABLE_BASE_ID = 'appR8sQwaCx42Z6GP'
export const AIRTABLE_TABLE_NAME = 'Eon Doctors Database'

// Map Configuration
export const MAP_DEFAULTS = {
  center: { lat: 25.276987, lng: 55.296249 }, // Dubai
  countryZoom: 6,
  cityZoom: 12
}

// Pin colors — kept here as hex because Google Maps doesn't accept CSS variables.
// Keep in sync with --color-brand in index.css.
export const PIN_COLORS = {
  background: '#01BFB8',
  glyph: '#FFFFFF',
  border: '#10A7A2'
}
