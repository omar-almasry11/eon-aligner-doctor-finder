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
    <section aria-label="Search filters" className="flex flex-col gap-3 bg-surface px-6 pt-4 pb-8">
      <h1 className="text-4xl leading-none font-semibold text-ink mb-2">
        Find your doctor
      </h1>
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
            type="button"
            onClick={onReset}
            className="px-4 py-2 text-ink-muted hover:text-ink hover:bg-surface-hover rounded-md transition-colors"
          >
            Reset Filters
          </button>
        )}

        {hasFilters && (
          <span className="text-md font-medium text-ink ml-auto">
            Showing doctors in{' '}
            <span className="font-medium text-ink-subtle">
              {[selectedCity, selectedCountry].filter(Boolean).join(', ')}
            </span>
          </span>
        )}
      </div>
    </section>
  )
}
