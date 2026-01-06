import { Dropdown } from '../UI/Dropdown'

export function FilterBar({
  countries,
  cities,
  selectedCountry,
  selectedCity,
  onCountryChange,
  onCityChange,
  onReset
}) {
  const hasFilters = selectedCountry || selectedCity

  const handleCountryChange = (country) => {
    onCountryChange(country)
    // Reset city when country changes
    if (country !== selectedCountry) {
      onCityChange(null)
    }
  }

  return (
    <div className="flex flex-col gap-3 bg-white px-6 pt-4 pb-8">
      <div className="text-4xl leading-none font-semibold text-[#004745] mb-2">
        Find your doctor
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          options={countries}
          value={selectedCountry}
          onChange={handleCountryChange}
          placeholder="Select Country"
        />

        <Dropdown
          options={cities}
          value={selectedCity}
          onChange={onCityChange}
          placeholder="Select City"
          disabled={!selectedCountry}
        />

        {hasFilters && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        )}

        {hasFilters && (
          <span className="text-sm text-gray-500 ml-auto">
            Showing doctors in {selectedCity || selectedCountry}
          </span>
        )}
      </div>
    </div>
  )
}
